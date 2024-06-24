// user.controllers.js

import Conversation from "../../Models/chat.model.js";
import axios from "axios";
import { parseString } from "xml2js";
import { promisify } from "util";
import { sendWhatsAppMessage } from "../../Services/twilio.service.js";

const parseXml = promisify(parseString);

export const listofUsers = async (req, res) => {
  try {
    // SOAP request configuration
    const url = "https://uat.imsolutionsremote.co.uk/IMS/imswebservice.asmx";
    const headers = {
      SOAPAction: "http://IMS/WebService/CallStoredProcedure",
      "Content-Type": "text/xml; charset=utf-8",
    };
    const data = `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://IMS/WebService">
               <soapenv:Header/>
               <soapenv:Body>
                  <web:CallStoredProcedure/>
               </soapenv:Body>
            </soapenv:Envelope>
        `;

    // Make the SOAP request
    const response = await axios.post(url, data, { headers });

    // Parse the XML response
    const result = await parseXml(response.data);

    // Extract the CaseData array
    const caseDataArray =
      result["soap:Envelope"]["soap:Body"][0]["CallStoredProcedureResponse"][0][
      "CallStoredProcedureResult"
      ][0]["CaseData"];

    // Format the data as required
    const formattedData = caseDataArray.map((caseData) => ({
      name: caseData.Name[0],
      phoneNumber: caseData.PhoneNumber[0],
      caseId: caseData.CaseId[0],
    }));

    // Send the formatted data as JSON response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching case data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching case data" });
  }
};

// export const receiveMessage = async () => {
//     const message = await fetchMessagesFromQueue();
//     console.log(message);
// going to recieve a message from twilio
/*  
this is a post route , 
the message recieved from twilio should be saved in mongodb in the correct message format
the message should me converted into json if not converted..
send the message to frontend through sockets.
*/
// }

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const response = await sendWhatsAppMessage(
      message.receiver_id,
      message.content
    );
    let data = await Conversation.findOne({ participant: message.receiver_id });
    if (!data) {
      data = new Conversation({
        participant: message.receiver_id,
        messages: [],
      });
      console.log("new Convo created");
    }
    message["messageSid"] = response.messageSid;
    message["accountSid"] = response.accountSid;
    data.messages.push(message);
    await data.save();
    console.log("Data saved in mongo successfully");
    res.status(200).json({
      message: `Sending message to twilio successful , SID : ${response}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// export const getChatbyNumber = async (req, res) => {
//     try {
//         const { number } = req.body;
//         const data = await Conversation.findOne({ participant: number });
//         let response = [];
//         if (data) {
//             response = data.messages;
//         }
//         res.status(200).json(response);
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error', error: error.message });

//     }
// }

export const getChatbyNumber = async (req, res) => {
  try {
    const { number, page = 1, limit = 20 } = req.body; // page and limit for pagination
    const skip = (page - 1) * limit; // calculate the number of documents to skip

    const data = await Conversation.findOne({ participant: number });
    let response = { messages: [], hasMore: false };

    if (data) {
      const totalMessages = data.messages.length;
      response.messages = data.messages
        .slice()
        .reverse()
        .slice(skip, skip + limit); // reverse and paginate
      response.hasMore = skip + limit < totalMessages; // check if there are more messages to load
    }

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getUnreadcount = async (req, res) => {
  try {
    const conversations = await Conversation.find({});
    const unreadCountsArray = conversations.map(conv => ({
      phone: conv.participant,
      unreadCount: conv.unreadCount
    }));

    res.status(200).json(unreadCountsArray);
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Error fetching unread counts' });
  }

}
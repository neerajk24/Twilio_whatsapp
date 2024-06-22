import Conversation from "../../Models/chat.model.js";
import mongoose from "mongoose";

export const getConversationid = async (req, res) => {
  const { userId1, userId2 } = req.body;
  console.log(`Users have arrived ${userId1} and ${userId2}`);
  if (!userId1 || !userId2) {
    res.status(400).json({ message: "Both the userid's are required" });
  }
  try {
    console.log("here");
    let conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    });
    console.log("here also..");
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId1, userId2],
        messages: [],
      });
      console.log("New convo is made....");
      await conversation.save();
      console.log("Successfully ssavedd...");
    }
    console.log(`Conversation ID found : ${conversation._id}`);
    res.status(200).json({ conversationId: conversation._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const getUnreadmsg = async (req, res) => {
  console.log("Unread message route entered");
  const username = req.params.username;
  try {
    const conversations = await Conversation.find({
      participants: { $in: [username] },
    });

    // Object to hold the count of unread messages from each participant
    const unreadMessagesCount = {};
    // Iterate over each conversation
    conversations.forEach((conversation) => {
      // Filter messages where the receiver is the username and is_read is false
      const unreadMessages = conversation.messages.filter(
        (msg) => msg.receiver_id === username && !msg.is_read
      );

      // Iterate over unread messages to count them by sender_id
      unreadMessages.forEach((message) => {
        if (unreadMessagesCount[message.sender_id]) {
          unreadMessagesCount[message.sender_id]++;
        } else {
          unreadMessagesCount[message.sender_id] = 1;
        }
      });
    });

    // Format the response
    const formattedResponse = Object.entries(unreadMessagesCount).map(
      ([sender, count]) => ({
        sender,
        count,
      })
    );
    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const markMsgRead = async (req, res) => {
  const { conversationId, senderId } = req.body;
  console.log(`ConversationId: ${conversationId} and sender_id: ${senderId}`);
  try {
    const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
    const result = await Conversation.updateOne(
      { _id: conversationObjectId, "messages.sender_id": senderId },
      { $set: { "messages.$[elem].is_read": true } },
      { arrayFilters: [{ "elem.sender_id": senderId }] }
    );
    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ error: "Conversation or sender not found" });
    }
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

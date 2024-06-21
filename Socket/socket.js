import Conversation from "../models/chats.model.js";
import mongoose from 'mongoose';
import axios from 'axios';


let ConnectedSockets = [
  // {Userid , socketId}
]

export const ChatSocket = (io) => {
  io.on('connection', (socket) => {
    const Userid = socket.handshake.auth.userid;
    ConnectedSockets.push({
      socketId: socket.id,
      Userid
    })
    console.log(`${Userid} got connected..`);
    io.emit('onlineUsers', ConnectedSockets.map(s => s.Userid));
    socket.on('joinRoom', async ({ userId, conversationId }) => {
      console.log(`User ${userId} trying to join the room ${conversationId}`);
      socket.join(conversationId);
      // Convert the conversationId string to an ObjectId
      const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
      const chat = await Conversation.findOne({ _id: conversationObjectId });
      if (chat) {
        socket.emit('previousMessages', chat.messages);
      }
    });

    socket.on('sendMessages', async ({ conversationId, message }) => {
      console.log(`${conversationId} is trying to send ${message}`);
      io.to(conversationId).emit('recieveMessage', message);
      // Convert the conversationId string to an ObjectId
      const conversationObjectId = new mongoose.Types.ObjectId(conversationId);

      // Check if both users are online in the room
      const usersInRoom = io.sockets.adapter.rooms.get(conversationId);
      const isReceiverOnline = usersInRoom && usersInRoom.size === 2;
      // Set is_read to true if both users are online
      message.is_read = isReceiverOnline;
      const chat = await Conversation.findOne({ _id: conversationObjectId });
      if (chat) {
        chat.messages.push(message);
        await chat.save();
      } else {
        console.log("Error in sending messages Chat not found!");
      }
      //send the new unreadMsg to the disconnected User
      if (!isReceiverOnline) {
        console.log("oops user hasn't seen messages");
        const SOCKET = ConnectedSockets.find((soc) => soc.Userid === message.receiver_id);
        if (SOCKET) {
          console.log("unseen user found");
          const response = await axios.get(`http://localhost:3000/api/socketChat/chats/getUnreadmsg/${message.receiver_id}`);
          io.to(SOCKET.socketId).emit('unreadMessages', response.data);
          console.log("Unread data send to the user");
        }
      }
    });

    socket.on('userTyping', ({ conversationId, receiverId, typing }) => {
      const usersInRoom = io.sockets.adapter.rooms.get(conversationId);
      const isReceiverOnline = usersInRoom && usersInRoom.size === 2;

      if (isReceiverOnline) {
        const receiverSocket = ConnectedSockets.find((soc) => soc.Userid === receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('typing', typing);
        }
      }
    });

    socket.on('disconnect', () => {
      ConnectedSockets = ConnectedSockets.filter((soc) => soc.Userid !== Userid);
      io.emit('onlineUsers', ConnectedSockets.map(s => s.Userid));
      console.log(socket.id + " disconnected");
    })
  })
}
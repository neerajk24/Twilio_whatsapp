import express from 'express';
import cors from 'cors';
import connectDB from './Config/databaseConnection.js';
import Socketroute from './api/Routes/socketChat.route.js';
import userRoute from './api/Routes/user.route.js';
import { Server } from 'socket.io';
import http from 'http';
import { queueService } from './Services/queue.service.js';
import Conversation from './Models/chat.model.js';


// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRoute);
app.use('/api/sockets', Socketroute);

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Adjust as necessary for your CORS policy
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle socket events here
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Export the io instance if needed in other modules
export { io };

queueService.addMessageHandler(async (messageData) => {
    console.log("Processing message:", messageData);
    // Add your message processing logic here
});

// Start listening for messages when the app starts
queueService.startListening().catch(console.error);

// Your routes and other app setup...

// Graceful shutdown
process.on('SIGINT', async () => {
    await queueService.stopListening();
    process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

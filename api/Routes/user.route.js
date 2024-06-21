// routes.js
import express from 'express';
import { listofUsers , sendMessage , getChatbyNumber} from '../Controllers/user.controller.js';

const router = express.Router();

// Give the list of users
router.get('/listofUsers', listofUsers);
// Going to send a message to twilio
router.post('/sendMessage', sendMessage);
// Going to send previous messages as response
router.post('/getchatbyNumber' , getChatbyNumber);
export default router;
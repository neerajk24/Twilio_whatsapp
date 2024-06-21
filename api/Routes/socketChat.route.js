// /routes/chatRoutes.js
import express from "express";
const router = express.Router();
import { getConversationid , getUnreadmsg , markMsgRead } from "../Controllers/socketChat.controller.js";

router.post('/chats/getconvoId', getConversationid);
router.get('/chats/getUnreadmsg/:username', getUnreadmsg);
router.post('/chats/markMsgRead', markMsgRead);
// router.get('/chats/generateSasurl', generateSasurl);

export default router;
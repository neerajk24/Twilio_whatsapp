import React from "react";
import { styled } from "@mui/material/styles";
import axios from 'axios';

import {
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Paper,
    InputBase,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import { useState, useEffect } from "react";

const Root = styled("div")({
    display: "flex",
    height: "100vh",
    backgroundColor: "#dadbd3",
});

const Sidebar = styled("div")({
    flex: "0 0 30%",
    borderRight: "1px solid #d1d7db",
    backgroundColor: "#ffffff",
});

const ChatList = styled(List)({
    overflowY: "auto",
    height: "calc(100% - 64px)",
});

const ChatArea = styled("div")({
    flex: 1,
    display: "flex",
    flexDirection: "column",
});

const Messages = styled(Paper)({
    flex: 1,
    padding: 16,
    overflowY: "auto",
});

const InputArea = styled(Paper)({
    padding: "8px 16px",
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
});

const Input = styled(InputBase)({
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "8px 16px",
    marginRight: 8,  // Add some space between input and icon
});

const SearchContainer = styled("div")({
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    padding: "0 16px",
    margin: "8px 0",
    width: "100%", // Ensure it takes full width
});

const MessageContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
});

const MessageBubble = styled('div')(({ sent }) => ({
    maxWidth: '70%',
    padding: '8px 12px',
    borderRadius: '12px',
    marginBottom: '8px',
    wordWrap: 'break-word',
    backgroundColor: sent ? '#dcf8c6' : '#fff',
    alignSelf: sent ? 'flex-end' : 'flex-start',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
}));

const Timestamp = styled(Typography)({
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '4px',
    textAlign: 'right',
});

const SearchInput = styled(InputBase)({
    marginLeft: 8,
    flex: 1,
});

function WhatsAppClone() {
    const [listofUsers, setListofusers] = useState([]);
    const [currentUser, setCurrentuser] = useState(false);
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const vendorNumber = '+14155238886';

    useEffect(() => {
        // Fetch users
        axios.get('http://localhost:5000/api/user/listofUsers')
            .then(response => setListofusers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const loadChat = async (chat) => {
        console.log(chat);
        setCurrentuser(chat);
        const response = await axios.post('http://localhost:5000/api/user/getChatbyNumber', {
            number: chat.phoneNumber
        });
        setMessages(response.data);
        console.log(response.data);
    }

    const sendMessage = async () => {
        if (content.trim() !== '') {
            const newMessage = {
                sender_id: vendorNumber,
                receiver_id: currentUser.phoneNumber,
                content: content,
                content_type: 'text',
                content_link: null,
                timestamp: new Date(),
                is_read: false,
            };
            try {
                const response = await axios.post('http://localhost:5000/api/user/sendMessage', {
                    message: newMessage
                });
                console.log("Success in sending the message", response);
                setMessages(messages => [...messages, newMessage]);
            } catch (error) {
                console.log("Error in sending message", error.message);
            }
            setContent('');
        }
    };

    return (
        <Root>
            <Sidebar>
                <AppBar position="static" color="default" elevation={0}>
                    <Toolbar>
                        <Typography variant="h6">Twilio_Chat</Typography>
                    </Toolbar>
                </AppBar>
                <SearchContainer>
                    <SearchIcon />
                    <SearchInput placeholder="Search or start new chat" />
                </SearchContainer>
                <ChatList>
                    {listofUsers.map((chat) => (
                        <ListItem button key={chat.id} onClick={()=>{loadChat(chat)}}>
                            <ListItemAvatar>
                                <Avatar>{chat.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={`${chat.name} (${chat.caseId})`} secondary={chat.lastMessage} />
                        </ListItem>
                    ))}
                </ChatList>
            </Sidebar>
            {currentUser && <ChatArea>
                <AppBar position="static" color="default" elevation={0}>
                    <Toolbar>
                        <Typography variant="h6">{currentUser.name}</Typography>
                    </Toolbar>
                </AppBar>
                <Messages>
                    <MessageContainer>
                        {messages.map((message, index) => (
                            <MessageBubble key={message._id || index} sent={message.sender_id === vendorNumber}>
                                {message.content}
                                <Timestamp>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Timestamp>
                            </MessageBubble>
                        ))}
                    </MessageContainer>
                </Messages>
                <InputArea elevation={0}>
                    <Input
                        placeholder="Type a message"
                        fullWidth
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                sendMessage();
                            }
                        }}
                    />
                    <IconButton color="primary" onClick={sendMessage}>
                        <SendIcon />
                    </IconButton>
                </InputArea>
            </ChatArea>}
        </Root>
    );
}

export default WhatsAppClone;

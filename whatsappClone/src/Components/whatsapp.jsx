import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import axios from 'axios';
import io from 'socket.io-client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
    Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';


const URL = "http://localhost:5000";

const Root = styled("div")({
    display: "flex",
    height: "100vh",
    backgroundColor: "#dadbd3",
});

const Sidebar = styled(Paper)({
    flex: "0 0 30%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #d1d7db",
    backgroundColor: "#ffffff",
});

const ChatArea = styled(Paper)({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#e5ddd5",
});

const SidebarHeader = styled(AppBar)({
    position: "static",
    backgroundColor: "#00a884",
    boxShadow: "none",
});

const ChatHeader = styled(AppBar)({
    position: "static",
    backgroundColor: "#f0f2f5",
    boxShadow: "none",
    color: "#000",
});

const SearchBar = styled("div")({
    padding: "8px 16px",
    backgroundColor: "#f6f6f6",
});

const ChatList = styled(List)({
    flex: 1,
    overflowY: "auto",
    padding: 0,
});

const Messages = styled("div")({
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
    backgroundSize: "contain",
});

const InputArea = styled("div")({
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#f0f2f5",
});

const Input = styled(InputBase)({
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "9px 12px",
    marginRight: 8,
});

const MessageBubble = styled("div")(({ sent }) => ({
    maxWidth: '70%',
    padding: '8px 12px',
    borderRadius: sent ? '8px 0 8px 8px' : '0 8px 8px 8px',
    marginBottom: '8px',
    wordWrap: 'break-word',
    backgroundColor: sent ? '#dcf8c6' : '#fff',
    alignSelf: sent ? 'flex-end' : 'flex-start',
    boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)',
}));

const MessageContainer = styled("div")({
    display: 'flex',
    flexDirection: 'column',
});

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

const InputField = React.memo(({ content, setContent, sendMessage, setContentType, setContentLink }) => (
    <InputArea>
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
        <input
            accept="image/*,video/*,audio/*,.pdf"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    setContentType(file.type);
                    // You'll need to implement a function to upload the file and get a link
                    uploadFile(file).then(link => setContentLink(link));
                }
            }}
        />
        <label htmlFor="raised-button-file">
            <IconButton component="span">
                <AttachFileIcon />
            </IconButton>
        </label>
        <IconButton color="primary" onClick={sendMessage}>
            <SendIcon />
        </IconButton>
    </InputArea>
));

const MessageContent = ({ message, onMediaClick }) => {

    const renderMedia = () => {
        switch (message.content_type) {
            case 'image/jpeg':
            case 'image/png':
                return (
                    <img
                        src={message.content_link}
                        alt="Sent image"
                        style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => onMediaClick(message)}
                    />
                );
            case 'video/mp4':
                return (
                    <div
                        onClick={() => onMediaClick(message)}
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            width: '200px',
                            height: '200px',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <video
                            src={message.content_link}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)'
                        }}>
                            <PlayArrowIcon style={{ fontSize: 50, color: 'white' }} />
                        </div>
                    </div>
                );
            case 'audio/mpeg':
                return (
                    <Paper elevation={0} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => onMediaClick(message)}>
                        <AudioFileIcon style={{ marginRight: '8px' }} />
                        <Typography variant="caption">Audio message</Typography>
                    </Paper>
                );
            case 'application/pdf':
                return (
                    <Paper elevation={0} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => onMediaClick(message)}>
                        <PictureAsPdfIcon style={{ marginRight: '8px' }} />
                        <Typography variant="caption">PDF Document</Typography>
                    </Paper>
                );
            case 'file':
                return (
                    <Paper elevation={0} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => onMediaClick(message)}>
                        <InsertDriveFileIcon style={{ marginRight: '8px' }} />
                        <Typography variant="caption">File</Typography>
                    </Paper>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {message.content_type === 'text' ? (
                <Typography>{message.content}</Typography>
            ) : (
                renderMedia()
            )}
        </div>
    );
};

const MessageList = ({ messages, vendorNumber, onMediaClick }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <MessageContainer>
            {messages.map((message, index) => (
                <MessageBubble key={message._id || index} sent={message.sender_id === vendorNumber}>
                    <MessageContent message={message} onMediaClick={onMediaClick} />
                    <Timestamp>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Timestamp>
                </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
        </MessageContainer>
    );
};

const ExpandedMediaView = ({ media, onClose }) => {
    const renderExpandedContent = () => {
        switch (media.content_type) {
            case 'image/jpeg':
            case 'image/png':
                return (
                    <img
                        src={media.content_link}
                        alt="Expanded image"
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                );
            case 'video/mp4':
                return (
                    <video
                        src={media.content_link}
                        controls
                        style={{ maxWidth: '90%', maxHeight: '90%' }}
                    />
                );
            case 'audio/mpeg':
                return (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <audio src={media.content_link} controls />
                    </div>
                );
            case 'application/pdf':
                return (
                    <iframe
                        src={`${media.content_link}#toolbar=0`}
                        style={{ width: '90vw', height: '90vh', border: 'none' }}
                    />
                );
            case 'file':
                return (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <Typography variant="h6">File Preview</Typography>
                        <a href={media.content_link} download>Download File</a>
                    </div>
                );
            default:
                return <Typography>Unsupported media type</Typography>;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <IconButton
                onClick={onClose}
                style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}
            >
                <ArrowBackIcon />
            </IconButton>
            {renderExpandedContent()}
        </div>
    );
};

const ChatListComponent = React.memo(({ listofUsers, loadChat, searchTerm }) => {
    const filteredUsers = listofUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ChatList>
            {filteredUsers.map((chat) => (
                <React.Fragment key={chat.id}>
                    <ListItem button onClick={() => loadChat(chat)}>
                        <ListItemAvatar>
                            <Avatar>{chat.name.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={`${chat.name} (${chat.caseId})`} secondary={chat.lastMessage} />
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
        </ChatList>
    );
});

const SearchBarComponent = React.memo(({ setSearchTerm }) => (
    <SearchBar>
        <SearchInput
            placeholder="Search or start new chat"
            startAdornment={<SearchIcon sx={{ color: 'action.active', mr: 1 }} />}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
    </SearchBar>
));

function WhatsAppClone() {
    const [listofUsers, setListofusers] = useState([]);
    const [currentUser, setCurrentuser] = useState(null);
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const socketRef = useRef(null);
    const [expandedMedia, setExpandedMedia] = useState(null);
    const vendorNumber = '14155238886';

    useEffect(() => {
        axios.get(`${URL}/api/user/listofUsers`)
            .then(response => setListofusers(response.data))
            .catch(error => console.error('Error fetching users:', error));

        const socket = io(URL, {
            auth: {
                userid: vendorNumber,
            }
        });
        socketRef.current = socket;
        socket.on('receiveMessage', (msg) => {
            console.log("message received");
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    const handleMediaClick = (media) => {
        setExpandedMedia(media);
    };

    const handleCloseExpandedMedia = () => {
        setExpandedMedia(null);
    };

    const loadChat = useCallback(async (chat) => {
        console.log(chat);
        setCurrentuser(chat);
        const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
            number: chat.phoneNumber
        });
        setMessages(response.data);
    }, []);

    const sendMessage = useCallback(async () => {
        if (content.trim() !== '' && currentUser) {
            const newMessage = {
                sender_id: vendorNumber,
                receiver_id: currentUser.phoneNumber,
                content: content,
                content_type: 'text',
                content_link: null,
                timestamp: new Date(),
                is_read: false,
            };
            setMessages(messages => [...messages, newMessage]);
            setContent('');
            try {
                await axios.post(`${URL}/api/user/sendMessage`, { message: newMessage });
            } catch (error) {
                console.log("Error in sending message", error.message);
            }
        }
    }, [content, currentUser]);

    return (
        <Root>
            <Sidebar>
                <SidebarHeader position="static">
                    <Toolbar>
                        <Typography variant="h6">Twilio Chat</Typography>
                    </Toolbar>
                </SidebarHeader>
                <SearchBarComponent setSearchTerm={setSearchTerm} />
                <ChatListComponent
                    listofUsers={listofUsers}
                    loadChat={loadChat}
                    searchTerm={searchTerm}
                />
            </Sidebar>
            <ChatArea>
                {currentUser ? (
                    <>
                        <ChatHeader position="static">
                            <Toolbar>
                                <Avatar sx={{ mr: 2 }}>{currentUser.name.charAt(0)}</Avatar>
                                <Typography variant="h6">{currentUser.name}</Typography>
                            </Toolbar>
                        </ChatHeader>
                        <Messages>
                            <MessageList
                                messages={messages}
                                vendorNumber={vendorNumber}
                                onMediaClick={handleMediaClick}
                            />
                        </Messages>
                        <InputField content={content} setContent={setContent} sendMessage={sendMessage} />
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="h5" color="textSecondary">Select a chat to start messaging</Typography>
                    </div>
                )}
            </ChatArea>
            {expandedMedia && (
                <ExpandedMediaView
                    media={expandedMedia}
                    onClose={handleCloseExpandedMedia}
                />
            )}
        </Root>
    );
}

export default WhatsAppClone;

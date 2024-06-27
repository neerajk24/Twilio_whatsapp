import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { styled } from "@mui/material/styles";
import axios from "axios";
import io from "socket.io-client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingBar from "react-top-loading-bar";
import { BlobServiceClient } from "@azure/storage-blob";

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
  Badge,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const URL = import.meta.env.VITE_API_URL;
console.log(URL);

const Root = styled("div")(({ theme, activeService }) => ({
  display: "flex",
  height: "100vh",
  backgroundColor: activeService === 'sms' ? "#e6ecf0" : "#dadbd3", // Default to WhatsApp background
}));

const Sidebar = styled(Paper)({
  flex: "0 0 30%",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #d1d7db",
  backgroundColor: "#ffffff",
});

const ChatArea = styled(Paper)(({ theme, activeService }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: activeService === 'sms' ? "#ffffff" : "#e5ddd5", // Default to WhatsApp chat background
}));

const SidebarHeader = styled(AppBar)(({ theme, activeService }) => ({
  position: "static",
  backgroundColor: activeService === 'sms' ? "#0088cc" : "#00a884", // Default to WhatsApp green
  boxShadow: "none",
}));


const ChatHeader = styled(AppBar)(({ theme, activeService }) => ({
  position: "static",
  backgroundColor: activeService === 'sms' ? "#ffffff" : "#f0f2f5", // Default to WhatsApp chat header
  boxShadow: "none",
  color: "#000",
}));

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
  height: "100vh",
  padding: "16px",
  backgroundImage:
    "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
  backgroundSize: "contain",
});

const InputArea = styled("div")(({ theme, activeService }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 16px",
  backgroundColor: activeService === 'sms' ? "#ffffff" : "#f0f2f5", // Default to WhatsApp input area
}));

const Input = styled(InputBase)({
  flex: 1,
  backgroundColor: "#ffffff",
  borderRadius: 20,
  padding: "9px 12px",
  marginRight: 8,
});

const MessageBubble = styled("div")(({ sent }) => ({
  maxWidth: "70%",
  padding: "8px 12px",
  borderRadius: sent ? "8px 0 8px 8px" : "0 8px 8px 8px",
  marginBottom: "8px",
  wordWrap: "break-word",
  backgroundColor: sent ? "#dcf8c6" : "#fff",
  alignSelf: sent ? "flex-end" : "flex-start",
  boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
}));

const MessageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const Timestamp = styled(Typography)({
  fontSize: "0.75rem",
  color: "#999",
  marginTop: "4px",
  textAlign: "right",
});

const SearchInput = styled(InputBase)({
  marginLeft: 8,
  flex: 1,
});
const DateSeparator = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '10px 0',
});

const DateBadge = styled('span')({
  backgroundColor: '#e1f3fb',
  color: '#5b5b5b',
  padding: '5px 12px',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
});

const MessageDateSeparator = ({ date }) => (
  <DateSeparator>
    <DateBadge>{date}</DateBadge>
  </DateSeparator>
);

const InputField = React.memo(
  ({ content, setContent, sendMessage, onFileSelect }) => (
    <InputArea>
      <Input
        placeholder="Type a message"
        fullWidth
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <input
        accept="image/*,video/*,audio/*,.pdf"
        style={{ display: "none" }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={onFileSelect}
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
  )
);
const MessageContent = ({ message, onMediaClick }) => {
  const renderMedia = () => {
    switch (message.content_type) {
      case "image/jpeg":
      case "image/png":
        return (
          <img
            src={message.content_link}
            alt="Sent image"
            style={{
              maxWidth: "200px",
              maxHeight: "200px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
            onClick={() => onMediaClick(message)}
          />
        );
      case "video/mp4":
        return (
          <div
            onClick={() => onMediaClick(message)}
            style={{
              position: "relative",
              cursor: "pointer",
              width: "200px",
              height: "200px",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <video
              src={message.content_link}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
            >
              <PlayArrowIcon style={{ fontSize: 50, color: "white" }} />
            </div>
          </div>
        );
      case "audio/mpeg":
        return (
          <Paper
            elevation={0}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
            onClick={() => onMediaClick(message)}
          >
            <AudioFileIcon style={{ marginRight: "8px" }} />
            <Typography variant="caption">Audio message</Typography>
          </Paper>
        );
      case "application/pdf":
        return (
          <Paper
            elevation={0}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
            onClick={() => onMediaClick(message)}
          >
            <PictureAsPdfIcon style={{ marginRight: "8px" }} />
            <Typography variant="caption">PDF Document</Typography>
          </Paper>
        );
      case "file":
        return (
          <Paper
            elevation={0}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
            onClick={() => onMediaClick(message)}
          >
            <InsertDriveFileIcon style={{ marginRight: "8px" }} />
            <Typography variant="caption">File</Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {message.content_link && renderMedia()}
      {message.content && <Typography>{message.content}</Typography>}
    </div>
  );
};


const MessageList = ({ messages, vendorNumber, onMediaClick, activeService }) => {
  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  let currentDate = null;

  return (
    <MessageContainer>
      {[...messages].reverse().map((message, index) => {
        const messageDate = new Date(message.timestamp);
        const formattedDate = formatDate(messageDate);
        let dateSeparator = null;

        if (formattedDate !== currentDate) {
          dateSeparator = <MessageDateSeparator key={`date-${index}`} date={formattedDate} />;
          currentDate = formattedDate;
        }

        return (
          <React.Fragment key={message._id || `message-${index}`}>
            {dateSeparator}
            <MessageBubble
              sent={message.sender_id === vendorNumber}
              activeService={activeService}
            >
              <MessageContent message={message} onMediaClick={onMediaClick} />
              <Timestamp>
                {messageDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Timestamp>
            </MessageBubble>
          </React.Fragment>
        );
      })}
    </MessageContainer>
  );
};

const ExpandedMediaView = ({ media, onClose }) => {
  const renderExpandedContent = () => {
    switch (media.content_type) {
      case "image/jpeg":
      case "image/png":
        return (
          <img
            src={media.content_link}
            alt="Expanded image"
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
          />
        );
      case "video/mp4":
        return (
          <video
            src={media.content_link}
            controls
            style={{ maxWidth: "90%", maxHeight: "90%" }}
          />
        );
      case "audio/mpeg":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <audio src={media.content_link} controls />
          </div>
        );
      case "application/pdf":
        return (
          <iframe
            src={`${media.content_link}#toolbar=0`}
            style={{ width: "90vw", height: "90vh", border: "none" }}
          />
        );
      case "file":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <Typography variant="h6">File Preview</Typography>
            <a href={media.content_link} download>
              Download File
            </a>
          </div>
        );
      default:
        return <Typography>Unsupported media type</Typography>;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <IconButton
        onClick={onClose}
        style={{ position: "absolute", top: 20, left: 20, color: "white" }}
      >
        <ArrowBackIcon />
      </IconButton>
      {renderExpandedContent()}
    </div>
  );
};

const ChatListComponent = React.memo(
  ({ listofUsers, loadChat, searchTerm, unreadCount }) => {
    const sortedUsers = useMemo(() => sortUsersWithUnread([...listofUsers], unreadCount), [listofUsers, unreadCount]);

    const filteredUsers = sortedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <ChatList>
        {filteredUsers.map((chat) => (
          <React.Fragment key={chat.id}>
            <ListItem
              button
              onClick={() => loadChat(chat)}
              sx={{
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
                padding: '10px 15px',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: '#DFE5E7',
                    color: '#4A4A4A',
                    fontWeight: 'bold',
                  }}
                >
                  {chat.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${chat.name} (${chat.caseId})`}
                secondary={chat.lastMessage}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 'bold',
                    color: '#000000',
                  }
                }}
                secondaryTypographyProps={{
                  sx: {
                    color: '#667781',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                }}
              />
              {unreadCount.find(item => item.phone === chat.phoneNumber)?.unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount.find(item => item.phone === chat.phoneNumber).unreadCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#25D366',
                      color: 'white',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      minWidth: '24px',
                      height: '24px',
                      fontSize: '0.9rem',
                      padding: '0 6px',
                      marginRight: '10px'
                    },
                  }}
                />
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </ChatList>
    );
  }
);

const SearchBarComponent = React.memo(({ setSearchTerm }) => (
  <SearchBar>
    <SearchInput
      placeholder="Search or start new chat"
      startAdornment={<SearchIcon sx={{ color: "action.active", mr: 1 }} />}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </SearchBar>
));

// Place this outside of your WhatsAppClone component, perhaps in a utils.js file

export const sortUsersWithUnread = (users, unreadCount) => {
  // Separate users with unread messages
  const usersWithUnread = users.filter(user =>
    unreadCount.some(item => item.phone === user.phoneNumber && item.unreadCount > 0)
  );

  // Users without unread messages
  const usersWithoutUnread = users.filter(user =>
    !unreadCount.some(item => item.phone === user.phoneNumber && item.unreadCount > 0)
  );

  // Sort users with unread messages by their unread count (descending)
  usersWithUnread.sort((a, b) => {
    const unreadA = unreadCount.find(item => item.phone === a.phoneNumber)?.unreadCount || 0;
    const unreadB = unreadCount.find(item => item.phone === b.phoneNumber)?.unreadCount || 0;
    return unreadB - unreadA;
  });

  // Concatenate the sorted unread users with the rest of the users
  return [...usersWithUnread, ...usersWithoutUnread];
};

const whatsapp = "14155238886";
const sms = "441173256790";


function WhatsAppClone() {
  const [listofUsers, setListofusers] = useState([]);
  const [currentUser, setCurrentuser] = useState(null);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);
  const [expandedMedia, setExpandedMedia] = useState(null);
  const [vendorNumber , setVendorNumber] = useState(whatsapp);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [progress, setProgress] = useState(0);
  const [unreadCount, setUnreadcount] = useState([]);
  const [media, setMedia] = useState({ contentType: null, contentLink: null });
  const [activeService, setActiveService] = useState('whatsapp');

  const scrollToNewMessage = () => {
    const scrollableDiv = document.getElementById('scrollableDiv');
    if (scrollableDiv && scrollableDiv.scrollTop === 0) {
      scrollableDiv.scrollTop = 0;
    }
  };
  useEffect(() => {
    if (messages.length > 0) {
      scrollToNewMessage();
    }
  }, [messages]);

  useEffect(() => {
    setProgress(25);
    axios
      .get(`${URL}/api/user/listofUsers`)
      .then((response) => setListofusers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
    axios
      .get(`${URL}/api/user/getUnreadcount`)
      .then((response) => setUnreadcount(response.data))
      .catch((error) => console.error("Error fetching unreadCount:", error.message));
    setProgress(100);
    const socket = io(URL, {
      auth: {
        userid: vendorNumber,
      },
    });
    socketRef.current = socket;
    socket.on("receiveMessage", (newMessage) => {
      console.log("message received");
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      scrollToNewMessage();
    });
    socket.on("unreadMessages", ({ newMessage, unreadmsg }) => {
      console.log('unreadMessage came!!', unreadmsg);
      setUnreadcount((prevUnreadCount) => {
        const updatedUnreadCount = prevUnreadCount.map(item => {
          if (item.phone === newMessage.sender_id) {
            return { ...item, unreadCount: unreadmsg };
          }
          return item;
        });
        if (!updatedUnreadCount.some(item => item.phone === newMessage.sender_id)) {
          updatedUnreadCount.push({ phone: newMessage.sender_id, unreadCount: unreadmsg });
        }
        return updatedUnreadCount;
      });

      // Move the user with new unread messages to the top
      setListofusers(prevUsers => {
        const userIndex = prevUsers.findIndex(user => user.phoneNumber === newMessage.sender_id);
        if (userIndex > -1) {
          const [user] = prevUsers.splice(userIndex, 1);
          return [user, ...prevUsers];
        }
        return prevUsers;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [activeService]);
  const handleMediaClick = (media) => {
    setExpandedMedia(media);
  };

  const handleCloseExpandedMedia = () => {
    setExpandedMedia(null);
  };

  const uploadToBlob = async (file) => {
    try {
      setProgress(30);

      // Fetch the SAS URL from the backend
      const response = await axios.get(`${URL}/api/user/getSasurl`);
      const sasUrl = response.data;

      // Create BlobServiceClient with the SAS URL
      const blobServiceClient = new BlobServiceClient(sasUrl);
      const containerClient =
        blobServiceClient.getContainerClient("Twilio_media");

      // Generate unique blob name
      const blobName = `${new Date().getTime()}-${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload the file to Azure Blob Storage
      await blockBlobClient.uploadData(file);
      console.log("File uploaded to Azure Blob Storage successfully");
      setProgress(100);
      // Return the file URL
      return blockBlobClient.url;
    } catch (error) {
      console.error("Error uploading file to Azure Blob Storage:", error);
      throw error;
    }
  };


  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // You'll need to implement a function to upload the file and get a link
        const link = await uploadToBlob(file);
        console.log(link);
        setMedia({ contentType: file.type, contentLink: link });
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle the error appropriately
      }
    }
  };

  const loadChat = useCallback(async (chat) => {
    console.log(chat);
    setCurrentuser(chat);
    socketRef.current.emit('changeUser', chat);
    socketRef.current.emit('updateReadcount', chat.phoneNumber);
    setPage(1);
    setHasMore(true);
    setProgress(30);
    try {
      console.log(activeService);
      const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
        number: chat.phoneNumber,
        page: 1,
        limit: 20,
        type: activeService
      });
      setMessages(response.data.messages);
      setHasMore(response.data.hasMore);
      setUnreadcount(prevUnreadCount =>
        prevUnreadCount.map(item =>
          item.phone === chat.phoneNumber ? { ...item, unreadCount: 0 } : item
        )
      );
      setProgress(100);
    } catch (error) {
      console.error("Error loading chat:", error);
      setProgress(100);
    }
  }, [activeService]);

  const loadMoreMessages = async () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setProgress(30);
    try {
      const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
        number: currentUser.phoneNumber,
        page: nextPage,
        limit: 20,
        type: activeService
      });

      const scrollableDiv = document.getElementById('scrollableDiv');
      const scrollHeightBefore = scrollableDiv.scrollHeight;

      setMessages((prevMessages) => [
        ...prevMessages,
        ...response.data.messages,
      ]);
      setHasMore(response.data.hasMore);
      setPage(nextPage);
      setProgress(100);

      // Maintain scroll position after loading more messages
      requestAnimationFrame(() => {
        const scrollHeightAfter = scrollableDiv.scrollHeight;
        scrollableDiv.scrollTop += scrollHeightAfter - scrollHeightBefore;
      });

    } catch (error) {
      console.error("Error loading more messages:", error);
      setProgress(100);
    }
  };

  const sendMessage = useCallback(async () => {
    if (currentUser && (content.trim() !== "" || media.contentLink)) {
      const newMessage = {
        sender_id: vendorNumber,
        receiver_id: currentUser.phoneNumber,
        content: content.trim(),
        content_type: media.contentType || "text",
        content_link: media.contentLink,
        timestamp: new Date(),
        is_read: false,
      };

      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setContent("");
      setMedia({ contentType: null, contentLink: null });

      try {
        console.log("sending message", newMessage);
        await axios.post(`${URL}/api/user/sendMessage`, {
          message: newMessage,
          type: activeService
        });
        scrollToNewMessage();
      } catch (error) {
        console.log("Error in sending message", error.message);
      }
    }
  }, [content, currentUser, media, activeService]);

  const handleServiceChange = (service) => {
    if (activeService === service) {
      return;
    }
    setActiveService(service);
    if(service==='whatsapp'){
      setVendorNumber(whatsapp);
    }
    else{
      setVendorNumber(sms);
    }
    resetAppState();
  };

  const resetAppState = () => {
    setProgress(20);
    setListofusers([]);
    setCurrentuser(null);
    setContent("");
    setMessages([]);
    setSearchTerm("");
    setPage(1);
    setHasMore(true);
    setUnreadcount([]);
    setMedia({ contentType: null, contentLink: null });
    setProgress(100)
  };
  return (
    <Root activeService={activeService}>
      <LoadingBar color="#f11946" progress={progress} height={4} />
      <Sidebar>
        <SidebarHeader position="static" activeService={activeService}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>Twilio Chat</Typography>
            <Button
              color="inherit"
              onClick={() => handleServiceChange('whatsapp')}
              style={{
                backgroundColor: activeService === 'whatsapp' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                marginRight: '8px'
              }}
            >
              WhatsApp
            </Button>
            <Button
              color="inherit"
              onClick={() => handleServiceChange('sms')}
              style={{
                backgroundColor: activeService === 'sms' ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
              }}
            >
              SMS
            </Button>
          </Toolbar>
        </SidebarHeader>
        <SearchBarComponent setSearchTerm={setSearchTerm} />
        <ChatListComponent
          listofUsers={listofUsers}
          loadChat={loadChat}
          searchTerm={searchTerm}
          unreadCount={unreadCount}
        />
      </Sidebar>
      <ChatArea activeService={activeService}>
        {currentUser ? (
          <>
            <ChatHeader position="static" activeService={activeService}>
              <Toolbar>
                <Avatar sx={{ mr: 2 }}>{currentUser.name.charAt(0)}</Avatar>
                <Typography variant="h6">{currentUser.name}</Typography>
              </Toolbar>
            </ChatHeader>
            <Messages
              id="scrollableDiv"
              style={{ display: "flex", flexDirection: "column-reverse" }}
            >
              <InfiniteScroll
                dataLength={messages.length}
                next={loadMoreMessages}
                style={{ display: "flex", flexDirection: "column-reverse" }}
                inverse={true}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableDiv"
                endMessage={
                  <p style={{ textAlign: "center" }}>
                    <b>You have seen all messages</b>
                  </p>
                }
                scrollThreshold="200px"
                isReverse={true}
              >
                <MessageList
                  messages={messages}
                  vendorNumber={vendorNumber}
                  onMediaClick={handleMediaClick}
                />
              </InfiniteScroll>
            </Messages>
            <InputField
              content={content}
              setContent={setContent}
              sendMessage={sendMessage}
              onFileSelect={handleFileSelect}
            />
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="h5" color="textSecondary">
              Select a chat to start messaging
            </Typography>
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
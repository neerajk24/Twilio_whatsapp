import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

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
  height: "100vh",
  padding: "16px",
  backgroundImage:
    "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
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

const InputField = React.memo(
  ({ content, setContent, sendMessage, setContentType, setContentLink }) => (
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
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setContentType(file.type);
            // You'll need to implement a function to upload the file and get a link
            uploadFile(file).then((link) => setContentLink(link));
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
      {message.content_type === "text" ? (
        <Typography>{message.content}</Typography>
      ) : (
        renderMedia()
      )}
    </div>
  );
};

// const MessageList = ({ messages, vendorNumber, onMediaClick }) => {
//     const messagesEndRef = useRef(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(scrollToBottom, [messages]);

//     return (
//         <MessageContainer>
//             {messages.map((message, index) => (
//                 <MessageBubble key={message._id || index} sent={message.sender_id === vendorNumber}>
//                     <MessageContent message={message} onMediaClick={onMediaClick} />
//                     <Timestamp>
//                         {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </Timestamp>
//                 </MessageBubble>
//             ))}
//             <div ref={messagesEndRef} />
//         </MessageContainer>
//     );
// };

const MessageList = ({ messages, vendorNumber, onMediaClick }) => {
  return (
    <MessageContainer>
      {[...messages].reverse().map((message, index) => (
        <MessageBubble
          key={message._id || index}
          sent={message.sender_id === vendorNumber}
        >
          <MessageContent message={message} onMediaClick={onMediaClick} />
          <Timestamp>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Timestamp>
        </MessageBubble>
      ))}
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

// const ChatListComponent = React.memo(
//   ({ listofUsers, loadChat, searchTerm }) => {
//     const filteredUsers = listofUsers.filter(
//       (user) =>
//         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.caseId.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return (
//       <ChatList>
//         {filteredUsers.map((chat) => (
//           <React.Fragment key={chat.id}>
//             <ListItem button onClick={() => loadChat(chat)}>
//               <ListItemAvatar>
//                 <Avatar>{chat.name.charAt(0)}</Avatar>
//               </ListItemAvatar>
//               <ListItemText
//                 primary={`${chat.name} (${chat.caseId})`}
//                 secondary={chat.lastMessage}
//               />
//             </ListItem>
//             <Divider />
//           </React.Fragment>
//         ))}
//       </ChatList>
//     );
//   }
// );

const ChatListComponent = React.memo(
  ({ listofUsers, loadChat, searchTerm, unreadCount }) => {
    const filteredUsers = listofUsers.filter(
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
                      minWidth: '20px',
                      height: '20px',
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

function WhatsAppClone() {
  const [listofUsers, setListofusers] = useState([]);
  const [currentUser, setCurrentuser] = useState(null);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);
  const [expandedMedia, setExpandedMedia] = useState(null);
  const vendorNumber = "14155238886";
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [progress, setProgress] = useState(0);
  const [unreadCount, setUnreadcount] = useState([]);

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

    });
    socket.on("unreadMessages", ({newMessage , unreadmsg}) => {
      console.log('unreadMessage came!!', unreadmsg);
      setUnreadcount((prevUnreadCount) => {
        const updatedUnreadCount = prevUnreadCount.map(item => {
          if (item.phone === newMessage.sender_id) {
            return { ...item, unreadCount: unreadmsg };
          }
          return item;
        });
        // If the sender is not in the unreadCount array, add them
        if (!updatedUnreadCount.some(item => item.phone === newMessage.sender_id)) {
          updatedUnreadCount.push({ phone: newMessage.sender_id, unreadCount: unreadmsg });
        }
        return updatedUnreadCount;
      });
      console.log(unreadCount);
    })
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

  // const loadChat = useCallback(async (chat) => {
  //     console.log(chat);
  //     setCurrentuser(chat);
  //     const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
  //         number: chat.phoneNumber
  //     });
  //     setMessages(response.data);
  // }, []);

  const loadChat = useCallback(async (chat) => {
    console.log(chat);
    setCurrentuser(chat);
    socketRef.current.emit('changeUser', chat);
    socketRef.current.emit('updateReadcount', chat.phoneNumber);
    setPage(1);
    setHasMore(true);
    setProgress(30);
    try {
      const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
        number: chat.phoneNumber,
        page: 1,
        limit: 20,
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
  }, []);

  const loadMoreMessages = async () => {
    console.log(page);
    if (!hasMore) return;
    const nextPage = page + 1;
    setProgress(30);
    try {
      const response = await axios.post(`${URL}/api/user/getChatbyNumber`, {
        number: currentUser.phoneNumber,
        page: nextPage,
        limit: 20,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        ...response.data.messages,
      ]);
      setHasMore(response.data.hasMore);
      setPage(nextPage);
      setProgress(100);
      console.log(messages);
    } catch (error) {
      console.error("Error loading more messages:", error);
      setProgress(100);
    }
  };

  const sendMessage = useCallback(async () => {
    if (content.trim() !== "" && currentUser) {
      const newMessage = {
        sender_id: vendorNumber,
        receiver_id: currentUser.phoneNumber,
        content: content,
        content_type: "text",
        content_link: null,
        timestamp: new Date(),
        is_read: false,
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setContent("");
      try {
        await axios.post(`${URL}/api/user/sendMessage`, {
          message: newMessage,
        });
      } catch (error) {
        console.log("Error in sending message", error.message);
      }
    }
  }, [content, currentUser]);

  return (
    <Root>
      <LoadingBar color="#f11946" progress={progress} height={4} />
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
          unreadCount={unreadCount}
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

import React, { createContext, useState, useRef, useCallback, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { BlobServiceClient } from '@azure/storage-blob';

const ChatContext = createContext();
export const useChatContext = () => useContext(ChatContext);

const whatsapp = "14155238886";
const sms = "447380300545";
const URL = import.meta.env.VITE_API_URL;



export const ChatProvider = ({ children }) => {
  const [listofUsers, setListofusers] = useState([]);
  const [currentUser, setCurrentuser] = useState(null);
  // const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);
  const [expandedMedia, setExpandedMedia] = useState(null);
  const [vendorNumber, setVendorNumber] = useState(whatsapp);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [progress, setProgress] = useState(0);
  const [unreadCount, setUnreadcount] = useState([]);
  const [media, setMedia] = useState({ contentType: null, contentLink: null });
  const [activeService, setActiveService] = useState('whatsapp');


  const scrollToNewMessage = useCallback(() => {
    const scrollableDiv = document.getElementById('scrollableDiv');
    if (scrollableDiv && scrollableDiv.scrollTop === 0) {
      scrollableDiv.scrollTop = 0;
    }
  }, []);
  useEffect(() => {
    if (messages.length > 0) {
      scrollToNewMessage();
    }
  }, [messages, scrollToNewMessage]);

  useEffect(() => {
    setProgress(25);
    axios
      .get(`${URL}/api/user/listofUsers`)
      .then((response) => setListofusers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
    axios
      .get(`${URL}/api/user/getUnreadcount/?service=${activeService}`)
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
  const handleMediaClick = useCallback((media) => {
    setExpandedMedia(media);
  }, []);

  const handleCloseExpandedMedia = useCallback(() => {
    setExpandedMedia(null);
  }, []);

  const uploadToBlob = useCallback(async (file) => {
    try {
      setProgress(30);

      // Fetch the SAS URL from the backend
      const response = await axios.get(`${URL}/api/user/getSasurl`);
      const sasUrl = response.data;

      // Create BlobServiceClient with the SAS URL
      const blobServiceClient = new BlobServiceClient(sasUrl);
      const containerClient =
        blobServiceClient.getContainerClient("Twilio_media_storage");

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
  }, []);


  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // You'll need to implement a function to upload the file and get a link
        const baseURL = await uploadToBlob(file);
        const link = baseURL.split("?")[0];
        console.log(link);
        setMedia({ contentType: file.type, contentLink: link });

      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle the error appropriately
      }
    }
  }, []);

  const loadChat = useCallback(async (chat) => {
    console.log(chat);
    setCurrentuser(chat);
    socketRef.current.emit('changeUser', chat);
    socketRef.current.emit('updateReadcount', {count : chat.phoneNumber , activeService});
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

  const loadMoreMessages = useCallback(async () => {
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
  }, [currentUser, page, hasMore, activeService]);

  const sendMessage = useCallback(async (content) => {
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
  }, [currentUser, media, activeService, vendorNumber]);

  const handleServiceChange = useCallback((service) => {
    if (activeService === service) {
      return;
    }
    setActiveService(service);
    if (service === 'whatsapp') {
      setVendorNumber(whatsapp);
    }
    else {
      setVendorNumber(sms);
    }
    resetAppState();
  }, [activeService]);

  const resetAppState = useCallback(() => {
    setProgress(20);
    setListofusers([]);
    setCurrentuser(null);
    setMessages([]);
    setSearchTerm("");
    setPage(1);
    setHasMore(true);
    setUnreadcount([]);
    setMedia({ contentType: null, contentLink: null });
    setProgress(100)
  }, []);

  const value = useMemo(() => ({
    handleServiceChange,
    loadMoreMessages,
    handleFileSelect,
    handleMediaClick,
    listofUsers,
    setListofusers,
    currentUser,
    setCurrentuser,
    messages,
    setMessages,
    searchTerm,
    setSearchTerm,
    socketRef,
    expandedMedia,
    setExpandedMedia,
    vendorNumber,
    setVendorNumber,
    page,
    setPage,
    hasMore,
    setHasMore,
    progress,
    setProgress,
    unreadCount,
    setUnreadcount,
    media,
    setMedia,
    activeService,
    setActiveService,
    scrollToNewMessage,
    loadChat,
    sendMessage,
    handleCloseExpandedMedia,
  }), [
    handleServiceChange,
    loadMoreMessages,
    handleFileSelect,
    handleMediaClick,
    listofUsers,
    currentUser,
    messages,
    searchTerm,
    expandedMedia,
    vendorNumber,
    page,
    hasMore,
    progress,
    unreadCount,
    media,
    activeService,
    scrollToNewMessage,
    loadChat,
    sendMessage,
    handleCloseExpandedMedia
  ]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
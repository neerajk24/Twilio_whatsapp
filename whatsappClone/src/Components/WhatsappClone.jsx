// src/components/WhatsAppClone.jsx
import { useChatContext } from "../Context/ChatContext";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingBar from "react-top-loading-bar";
import { Root, Sidebar, SidebarHeader, ChatArea, ChatHeader, Messages } from "./Styles/StyledComponent";
import SearchBarComponent from "./Shared/SearchBarComponent";
import ChatListComponent from "./ChatListComponent"
import MessageList from "./MessageList"
import InputField from "./Shared/InputField";
import ExpandedMediaView from "./Shared/ExpandedMedia";
import MemoizedToolbar from "./Shared/toolbar"

import {
  Toolbar,
  Typography,
  Avatar,
  Button,
} from "@mui/material";

export default function WhatsAppClone() {
  const {
    handleServiceChange,
    loadMoreMessages,
    currentUser,
    messages,
    expandedMedia,
    hasMore,
    progress,
    activeService,
    handleCloseExpandedMedia } = useChatContext();


  return (
    <Root>
      <LoadingBar color="#f11946" progress={progress} height={4} />
      <Sidebar>
        <SidebarHeader position="static">
          <MemoizedToolbar
            handleServiceChange={handleServiceChange}
            activeService={activeService}
          />
        </SidebarHeader>
        <SearchBarComponent />
        <ChatListComponent />
      </Sidebar>
      <ChatArea >
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
                scrollThreshold="500px"
                isReverse={true}
              >
                <MessageList />
              </InfiniteScroll>
            </Messages>
            <InputField activeService={activeService} />
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
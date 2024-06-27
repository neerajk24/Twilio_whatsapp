import React, { useMemo } from "react";

import {
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Badge,
} from "@mui/material";
import { ChatList } from "./Styles/StyledComponent";
import { useChatContext } from "../Context/ChatContext";
import { sortUsersWithUnread } from "../utils/sortUsersWithUnread.js";

const MemoizedChatList = React.memo(({ filteredUsers, loadChat, unreadCount }) => (
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
), (prevProps, nextProps) => {
    return (
        prevProps.filteredUsers === nextProps.filteredUsers &&
        prevProps.unreadCount === nextProps.unreadCount
    );
});

const ChatListComponent = () => {
    const { listofUsers, loadChat, searchTerm, unreadCount } = useChatContext();
    const sortedUsers = useMemo(() => sortUsersWithUnread([...listofUsers], unreadCount), [listofUsers, unreadCount]);

    const filteredUsers = useMemo(() =>
        sortedUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.caseId.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [sortedUsers, searchTerm]
    );

    return <MemoizedChatList filteredUsers={filteredUsers} loadChat={loadChat} unreadCount={unreadCount} />;
};

export default ChatListComponent;
import React, { useState, useCallback } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useChatContext } from "../../Context/ChatContext";
import { InputArea, Input } from "../Styles/StyledComponent";
import { IconButton, Popover } from "@mui/material";
import EmojiPicker from 'emoji-picker-react';

const InputField = React.memo(({ activeService }) => {
    const [localContent, setLocalContent] = useState("");
    const { sendMessage, handleFileSelect } = useChatContext();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSendMessage = useCallback(() => {
        sendMessage(localContent);
        setLocalContent("");
    }, [localContent, sendMessage]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleEmojiClick = (emojiObject) => {
        setLocalContent(prevContent => prevContent + emojiObject.emoji);
    };
    const handleEmojiButtonClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseEmojiPicker = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'emoji-popover' : undefined;

    return (
        <InputArea>
            <IconButton onClick={handleEmojiButtonClick}>
                <EmojiEmotionsIcon />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleCloseEmojiPicker}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Popover>
            <Input
                placeholder="Type a message"
                fullWidth
                value={localContent}
                onChange={(event) => setLocalContent(event.target.value)}
                onKeyPress={handleKeyPress}
            />
            {activeService !== 'sms' && (
                <>
                    <input
                        accept="image/*,video/*,audio/*,.pdf"
                        style={{ display: "none" }}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="raised-button-file">
                        <IconButton component="span">
                            <AttachFileIcon />
                        </IconButton>
                    </label>
                </>
            )}
            <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
            </IconButton>
        </InputArea>
    );
});

export default InputField;
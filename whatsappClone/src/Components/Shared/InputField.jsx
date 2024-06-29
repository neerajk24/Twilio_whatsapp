import React, { useState, useCallback } from "react";
import {
    Box,
    TextField,
    IconButton,
    Popover,
    Paper,
    Grid
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useChatContext } from "../../Context/ChatContext";
import { InputArea } from "../Styles/StyledComponent";
import EmojiPicker from 'emoji-picker-react';

const InputField = React.memo(({ activeService }) => {
    const [localContent, setLocalContent] = useState("");
    const [subject, setSubject] = useState("");
    const { sendMessage, handleFileSelect } = useChatContext();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSendMessage = useCallback(() => {
        sendMessage({ subject, content: localContent });
        setLocalContent("");
        setSubject("");
    }, [localContent, subject, sendMessage, activeService]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
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

    if (activeService === 'mail') {
        return (
            <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={11}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Subject"
                                variant="outlined"
                                fullWidth
                                value={subject}
                                onChange={(event) => setSubject(event.target.value)}
                            />
                            <TextField
                                label="Email content"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={localContent}
                                onChange={(event) => setLocalContent(event.target.value)}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={1}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                            <IconButton onClick={handleEmojiButtonClick}>
                                <EmojiEmotionsIcon />
                            </IconButton>
                            <IconButton component="label">
                                <AttachFileIcon />
                                <input
                                    hidden
                                    accept="image/*,video/*,audio/*,.pdf"
                                    multiple
                                    type="file"
                                    onChange={handleFileSelect}
                                />
                            </IconButton>
                            <IconButton color="primary" onClick={handleSendMessage}>
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
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
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Popover>
            </Paper>
        );
    }

    // Original WhatsApp and SMS layout
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
            <TextField
                placeholder="Type a message"
                variant="outlined"
                fullWidth
                multiline
                maxRows={4}
                value={localContent}
                onChange={(event) => setLocalContent(event.target.value)}
                onKeyDown={handleKeyPress}
                InputProps={{
                    sx: {
                        borderRadius: '8px',  // Reduced border radius
                        backgroundColor: "#ffffff",
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '8px',  // Reduced border radius
                        },
                    },
                }}
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
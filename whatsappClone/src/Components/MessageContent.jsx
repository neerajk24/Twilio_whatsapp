import React from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import {
    Typography,
    Paper,
} from "@mui/material";


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

export default MessageContent;
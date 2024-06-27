import React from 'react';
import { Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


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

export default ExpandedMediaView;
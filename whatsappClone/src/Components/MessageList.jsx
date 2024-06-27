import React from "react";
import { useChatContext } from "../Context/ChatContext";
import { DateSeparator , DateBadge , MessageBubble , Timestamp , MessageContainer } from "./Styles/StyledComponent";
import MessageContent from "./MessageContent";

const MessageDateSeparator = ({ date }) => (
    <DateSeparator>
      <DateBadge>{date}</DateBadge>
    </DateSeparator>
  );

const MessageList = () => {
    const { messages, vendorNumber, handleMediaClick, activeService } = useChatContext();

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
                            <MessageContent message={message} onMediaClick={handleMediaClick} />
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

export default MessageList;
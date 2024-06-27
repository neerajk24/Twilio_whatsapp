import { styled } from "@mui/material/styles";
import {
    AppBar,
    Typography,
    List,
    Paper,
    InputBase,
} from "@mui/material";
import { useChatContext } from "../../Context/ChatContext";

export const Root = styled("div")(({ theme }) => {
    const { activeService } = useChatContext();
    return {
        display: "flex",
        height: "100vh",
        backgroundColor: activeService === 'sms' ? "#e6ecf0" : "#dadbd3",
    };
});

export const Sidebar = styled(Paper)({
    flex: "0 0 30%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #d1d7db",
    backgroundColor: "#ffffff",
});

export const ChatArea = styled(Paper)(({ theme }) => {
    const { activeService } = useChatContext();
    return {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: activeService === 'sms' ? "#ffffff" : "#e5ddd5",
    };
});

export const SidebarHeader = styled(AppBar)(({ theme }) => {
    const { activeService } = useChatContext();
    return {
        position: "static",
        backgroundColor: activeService === 'sms' ? "#0088cc" : "#00a884",
        boxShadow: "none",
    };
});

export const ChatHeader = styled(AppBar)(({ theme }) => {
    const { activeService } = useChatContext();
    return {
        position: "static",
        backgroundColor: activeService === 'sms' ? "#ffffff" : "#f0f2f5",
        boxShadow: "none",
        color: "#000",
    };
});

export const InputArea = styled("div")(({ theme }) => {
    return {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: "#f0f2f5",
    };
});

export const SearchBar = styled("div")({
    padding: "8px 16px",
    backgroundColor: "#f6f6f6",
});

export const ChatList = styled(List)({
    flex: 1,
    overflowY: "auto",
    padding: 0,
});

export const Messages = styled("div")({
    flex: 1,
    overflowY: "auto",
    height: "100vh",
    padding: "16px",
    backgroundImage:
        "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
    backgroundSize: "contain",
});

export const Input = styled(InputBase)({
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: "9px 12px",
    marginRight: 8,
});

export const MessageBubble = styled("div")(({ sent }) => ({
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: sent ? "8px 0 8px 8px" : "0 8px 8px 8px",
    marginBottom: "8px",
    wordWrap: "break-word",
    backgroundColor: sent ? "#dcf8c6" : "#fff",
    alignSelf: sent ? "flex-end" : "flex-start",
    boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
    
}));

export const MessageContainer = styled("div")({
    display: "flex",
    flexDirection: "column",
});

export const Timestamp = styled(Typography)({
    fontSize: "0.75rem",
    color: "#999",
    marginTop: "4px",
    textAlign: "right",
});

export const SearchInput = styled(InputBase)({
    marginLeft: 8,
    flex: 1,
});
export const DateSeparator = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0',
});

export const DateBadge = styled('span')({
    backgroundColor: '#e1f3fb',
    color: '#5b5b5b',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
});
import { useChatContext } from "../../Context/ChatContext";
import { SearchBar, SearchInput } from "../Styles/StyledComponent";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";


const SearchBarComponent = React.memo(() => {
    const { setSearchTerm } = useChatContext();
    return (
        <SearchBar>
            <SearchInput
                placeholder="Search or start new chat"
                startAdornment={<SearchIcon sx={{ color: "action.active", mr: 1 }} />}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </SearchBar>
    );
});

export default SearchBarComponent;
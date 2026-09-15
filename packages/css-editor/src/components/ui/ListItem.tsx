import styled from "@emotion/styled";

const ListItem = styled.li<{ active: boolean }>(({ active }) => ({
    padding: "1px 4px",
    fontWeight: 400,
    background: active ? "#cfe6fc" : "#ffffff",
    cursor: "pointer",
    "&:hover": {
        fontWeight: 800,
        background: active ? "#7ba5d6" : "#e7f3ff",
    },
}));


export default ListItem;
import styled from "styled-components";

export const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

export const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

  width: ${(props) => props.width};
`;

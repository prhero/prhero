import React from "react";
import styled from "styled-components";
import { TreeObject, FileStatus } from "../state/github";
import { useToggle } from "../state/util";
import { File, Down, Right } from "../icons";
import { dirname } from "../util";
import { Text } from "@primer/components";

const ListItem = styled.li`
  padding: 2px 0;
  cursor: pointer
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ListChildren = styled.ul`
  list-style-type: none;
  margin: 0;
  padding-left: 1em;
`;
const Line = styled.div`
  position: absolute;
  left: 0;
  width: 300px;
  margin-top: -1.5px;
  height: 24px;
  pointer-events: none;
`;
const SelectedLine = styled(Line)`
  background-color: rgba(0, 68, 196, 0.3);
`;
const HoveredLine = styled(Line)`
  background-color: rgba(0, 30, 30, 0.2);
`;
const ItemText = styled(Text)`
  & > svg {
    display: inline-block;
    vertical-align: middle;
  }
`;
const ListContainer = styled.div`
  position: relative;
  padding-top: 10px;
  font-size: 14px;
  line-height: 20px;
  background-color: #fafbfc;
  height: calc(100% - 30px);
  overflow-y: scroll;
`;

interface Props extends TreeObject {
  hovered: string | null;
  onHover: (path: string | null) => void;
  selected: TreeObject | null;
  onSelect: (path: TreeObject) => void;
  onOpen: (path: string) => void;
}

function Icon({ type, open }: { type: "file" | "folder"; open: boolean }) {
  if (type === "file") {
    return <File />;
  } else {
    if (open) {
      return <Down />;
    } else {
      return <Right />;
    }
  }
}

function TreeItem({
  name,
  children,
  type,
  path,
  selected,
  status,
  onOpen,
  onHover,
  hovered,
  onSelect
}: Props) {
  const [open, toggleOpen] = useToggle();
  const active = selected?.path === path;
  const hover = hovered === path;

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    if (type === "folder") {
      onOpen(path);
      toggleOpen();
    }
    if (type === "file") {
      onOpen(dirname(path));
      onSelect({ path, status, type, name, children });
    }
  }

  return (
    <ListItem
      onMouseOver={e => {
        e.stopPropagation();
        onHover(path);
      }}
      onClick={handleClick}
    >
      {active && <SelectedLine />}
      {hover && !active && <HoveredLine />}
      <ItemText color={fileColor(status)}>
        <Icon type={type} open={open} /> {name}
      </ItemText>
      {children.length > 0 && open && (
        <ListChildren>
          {sort(children).map(el => (
            <TreeItem
              hovered={hovered}
              onHover={onHover}
              onOpen={onOpen}
              status={status}
              key={el.path}
              selected={selected}
              onSelect={onSelect}
              {...el}
            />
          ))}
        </ListChildren>
      )}
    </ListItem>
  );
}

export function Tree({
  children,
  onOpen,
  onHover,
  hovered,
  onSelect,
  selected,
  status
}: Props) {
  return (
    <ListContainer
      onMouseLeave={() => {
        onHover(null);
      }}
    >
      <ListChildren>
        {sort(children).map(el => (
          <TreeItem
            onOpen={onOpen}
            onHover={onHover}
            hovered={hovered}
            status={status}
            key={el.path}
            selected={selected}
            onSelect={onSelect}
            {...el}
          />
        ))}
      </ListChildren>
    </ListContainer>
  );
}

function fileColor(status: FileStatus) {
  switch (status) {
    case "added":
      return "green.8";
    case "removed":
      return "red.8";
    case "modified":
      return "yellow.8";
    case "unchanged":
      return "black";
  }
}

function sort(children: TreeObject[]) {
  return children.sort((a, b) => {
    if (a.type === "folder" && b.type === "file") {
      return -1;
    }
    if (b.type === "folder" && a.type === "file") {
      return 1;
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    return 1;
  });
}

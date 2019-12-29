import React from "react";
import styled from "styled-components";
import { TreeObject } from "../state/github";
import { useToggle } from "../state/util";
import { File, Down, Right } from "../icons";
import { dirname } from "../util";

const ListItem = styled.li`
  padding: 2px 0;
  cursor: pointer
  margin: 0;
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
  margin-top: -2px;
  height: 24px;
  pointer-events: none;
`;
const SelectedLine = styled(Line)`
  background-color: rgba(0, 68, 196, 0.3);
`;
const HoveredLine = styled(Line)`
  background-color: rgba(0, 30, 30, 0.2);
`;
const ListContainer = styled.div`
  padding-top: 30px;
  font-size: 14px;
  line-height: 20px;
  background-color: #fafbfc;
  height: 100%;
`;

interface Props extends TreeObject {
  hovered: string | null;
  onHover: (path: string | null) => void;
  changedFiles: string[];
  selected: string | null;
  onSelect: (path: string) => void;
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
  changedFiles,
  onOpen,
  onHover,
  hovered,
  onSelect
}: Props) {
  const [open, toggleOpen] = useToggle();
  const active = selected === path;
  const hover = hovered === path;

  const changed =
    type === "folder"
      ? changedFiles.find(f => f.startsWith(path))
      : changedFiles.includes(path);

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    if (type === "folder") {
      onOpen(path);
      toggleOpen();
    }
    if (type === "file") {
      onOpen(dirname(path));
      onSelect(path);
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
      <span className={changed ? "changed" : ""}>
        <Icon type={type} open={open} /> {name}
      </span>
      {children.length > 0 && open && (
        <ListChildren>
          {sort(children).map(el => (
            <TreeItem
              hovered={hovered}
              onHover={onHover}
              onOpen={onOpen}
              changedFiles={changedFiles}
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
  changedFiles
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
            changedFiles={changedFiles}
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

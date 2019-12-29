import React from "react";
import { TreeObject } from "../state/github";
import { useToggle } from "../state/util";
import { File, Down, Right } from "../icons";

import "./Tree.css";
import { dirname } from "../util";

interface Props extends TreeObject {
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

function TreeSelectedLine() {
  return <div className="Tree-SelectedLine"></div>;
}

function TreeItem({
  name,
  children,
  type,
  path,
  selected,
  changedFiles,
  onOpen,
  onSelect
}: Props) {
  const [open, toggleOpen] = useToggle();
  const active = selected === path;

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
    <li
      onClick={handleClick}
      className={`Tree-Item } ${
        active ? "Tree-selected text-white" : ""
        }`}
    >
      {active && <TreeSelectedLine />}
      <span className={changed ? "Tree-changed text-green" : ""}>
        <Icon type={type} open={open} /> {name}
      </span>
      {children.length > 0 && open && (
        <ul className="Tree-Children">
          {sort(children).map(el => (
            <TreeItem
              onOpen={onOpen}
              changedFiles={changedFiles}
              key={el.path}
              selected={selected}
              onSelect={onSelect}
              {...el}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Tree({ children, onOpen, onSelect, selected, changedFiles }: Props) {
  return (
    <div className="Tree">
      <ul className="Tree-Children">
        {sort(children).map(el => (
          <TreeItem
            onOpen={onOpen}
            changedFiles={changedFiles}
            key={el.path}
            selected={selected}
            onSelect={onSelect}
            {...el}
          />
        ))}
      </ul>
    </div>
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

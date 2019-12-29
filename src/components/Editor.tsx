import React from "react";
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";

import "./Editor.css";

// TODO: Use default vscode way.
const languages: { [k: string]: string | undefined } = {
  js: "javascript",
  ts: "typescript",
  md: "markdown",
  rb: "ruby",
  py: "python",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  Dockerfile: "dockerfile",
  go: "go",
};

export interface Props {
  filename: string;
  original: string;
  modified: string;
}

export function DiffEditor({ filename, original, modified }: Props) {
  const ext = filename.split(".").pop() || "";
  return (
    <div className="DiffEditor">
    <MonacoDiffEditor
      original={original}
      modified={modified}
      language={languages[filename] || languages[ext]}
      options={{
        readOnly: true
      }}
      theme="dark"
      height="100%"
    />
    </div>
  );
}

export function EditorHeader({ children }: { children?: React.ReactNode }) {
  return <p className="EditorHeader">{children}</p>;
}

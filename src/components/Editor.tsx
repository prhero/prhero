import React from "react";
import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import styled from "styled-components";

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
  go: "go"
};

export interface Props {
  filename: string;
  original: string;
  modified: string;
}

const EditorContainer = styled.div`
  width: 100%;
  height: calc(100% - 30px);
`;

export function DiffEditor({ filename, original, modified }: Props) {
  const ext = filename.split(".").pop() || "";
  return (
    <EditorContainer>
      <MonacoDiffEditor
        original={original}
        modified={modified}
        language={languages[filename] || languages[ext]}
        options={{
          readOnly: true
        }}
        height="100%"
      />
    </EditorContainer>
  );
}

export const EditorHeader = styled.p`
  margin: 0;
  padding: 5px;
  font-size: 0.8em;
  height: 30px;
  font-weight: bold;
  color: #586069;
  border-bottom: thin solid #eee;
`;

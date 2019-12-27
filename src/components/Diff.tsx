import React from "react";
import { useDiff, Ref } from "../state/github";
import { DiffEditor } from "./Editor";

export interface Props {
  base: Ref;
  head: Ref;
  selected: string;
}

export function Diff({ base, head, selected }: Props) {
  const diff = useDiff({
    base: base,
    head: head,
    path: selected
  });
  if (diff) {
    return <DiffEditor {...diff} />;
  }
  return <div>Loading...</div>;
}

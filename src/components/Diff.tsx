import React from "react";
import { useDiff, Ref, TreeObject } from "../state/github";
import { DiffEditor } from "./Editor";

export interface Props {
  base: Ref;
  head: Ref;
  selected: TreeObject;
}

export function Diff({ base, head, selected }: Props) {
  const diff = useDiff({
    base: base,
    head: head,
    obj: selected
  });
  if (diff) {
    return <DiffEditor {...diff} />;
  }
  return <div>Loading...</div>;
}

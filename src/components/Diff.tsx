import React from "react";
import { useDiff, TreeObject } from "../state/github";
import { Pr, Ref } from "../state/api";
import { DiffEditor } from "./Editor";

export interface Props {
  pr: Pr;
  base: Ref;
  head: Ref;
  selected: TreeObject;
}

export function Diff({ pr, base, head, selected }: Props) {
  const diff = useDiff({
    pr,
    base,
    head,
    obj: selected
  });
  if (diff) {
    return <DiffEditor {...diff} />;
  }
  return <div>Loading...</div>;
}

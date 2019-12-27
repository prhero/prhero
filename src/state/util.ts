import { useState } from "react";

export function useToggle(): [boolean, () => void] {
  const [toggle, setToggle] = useState(false);
  function handleToggle() {
    setToggle(!toggle);
  }
  return [toggle, handleToggle];
}

import React from "react";

export function Container({
  children,
  className
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`Flex-Container ${className}`} style={{ display: "flex" }}>
      {children}
    </div>
  );
}

export function Child({
  flex,
  className,
  children
}: {
  flex: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`Flex-Child ${className}`} style={{ flex }}>
      {children}
    </div>
  );
}

export const Flex = {
  Child,
  Container
};

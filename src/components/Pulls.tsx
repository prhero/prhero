import React from "react";
import styled from "styled-components";
import { useMyPrs } from "../state/github";
import {
  Box,
  Heading,
  Link,
  Text,
} from "@primer/components";

const ListItem = styled("div")`
  display: block;
  padding: 8px;
  border-bottom: 1px solid #eee;
`;

export function Pulls() {
  const myPrs = useMyPrs();
  return (
    <main className="Pulls" style={{ margin: "auto", width: "600px" }}>
      <Heading mt={4} textAlign="center">
        PRHero
      </Heading>
      <Box mt={4} mb={4}>
        {myPrs.map(pr => (
          <ListItem>
            <Link href={`?owner=${pr.owner}&repo=${pr.repo}&pr=${pr.number}`}>{pr.title}</Link>
            <br />
            <Text fontSize={1}>{pr.owner} / {pr.repo} #{pr.number}</Text>
          </ListItem>
        ))}
      </Box>
    </main>
  );
}

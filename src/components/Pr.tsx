import React from "react";
import { PrState } from "../state/github";
import { Link, Text, Heading, Flex, BranchName } from "@primer/components";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  padding: 10px;
  height: 70px;
  display: flex;
  z-index: 1;
  box-shadow: 0 1px 1px rgba(27, 31, 35, 0.1);
`;

export function PrTitle({
  owner,
  repo,
  number,
  title,
  head,
  base,
  author,
  commits
}: PrState) {
  return (
    <Container>
      <Flex.Item pr={4} alignSelf="flex-end">
        <Text>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${owner}/${repo}/pull/${number}`}
          >
            {owner}/{repo}#{number}
          </Link>
        </Text>
        <Heading fontSize={2} className="text-center">
          {title}
        </Heading>
      </Flex.Item>
      <Flex.Item alignSelf="flex-end">
        <Text>
          <Link href={`https://github.com/${author}`}>{author}</Link> wants to
          merge {commits.length} {commits.length === 1 ? "commit" : "commits"}{" "}
          into{" "}
          <BranchName>
            {base.repo.owner}:{base.ref}
          </BranchName>{" "}
          from{" "}
          <BranchName>
            {head.repo.owner}:{head.ref}
          </BranchName>
        </Text>
      </Flex.Item>
    </Container>
  );
}

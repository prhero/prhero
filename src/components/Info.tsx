import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  TextInput,
  Flex,
  Button
} from "@primer/components";

export function Info() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [pr, setPr] = useState("");
  function handleClick() {
    window.location.href = `${window.location.pathname}?owner=${owner}&repo=${repo}&pr=${pr}`;
  }

  return (
    <main className="Info" style={{ margin: "auto", width: "600px" }}>
      <Heading mt={4} textAlign="center">
        PRHero
      </Heading>
      <Box mt={4}>
        <Text as="p">
          To view a pull request type in the information below.
        </Text>
        <Flex>
          <Flex p={1} flex={2}>
            <TextInput
              onChange={e => setOwner(e.target.value)}
              width="100%"
              placeholder="Owner"
            />
          </Flex>
          <Flex p={1} flex={2}>
            <TextInput
              onChange={e => setRepo(e.target.value)}
              width="100%"
              placeholder="Repo"
            />
          </Flex>
          <Flex p={1} flex={1}>
            <TextInput
              onChange={e => setPr(e.target.value)}
              width="100%"
              placeholder="Number"
            />
          </Flex>
        </Flex>
        <Flex mt={2} justifyContent="center" alignItems="center">
          <Flex>
            <Button onClick={handleClick}>Review</Button>
          </Flex>
        </Flex>
      </Box>
    </main>
  );
}

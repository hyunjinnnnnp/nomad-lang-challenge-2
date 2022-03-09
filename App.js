import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import icons from "./icons";

const MAIN_COLOR = "#CE0C5C";
const ICONS_LENGTH = icons.length;

// max exclusive: should be ICONS_LENGTH + 1
const getRandomIconIndex = () => Math.floor(Math.random() * (ICONS_LENGTH + 1));

const Container = styled.View`
  background-color: ${MAIN_COLOR};
  flex: 1;
`;
const IconContainer = styled.View`
  flex: 3;
  justify-content: flex-end;
  align-items: center;
`;
const WordsContainer = styled.View`
  flex: 5;
`;
const AnswerContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const Box = styled.Text`
  border: 1px solid white;
  color: white;
  width: auto;
  min-width: 60px;
  min-height: 60px;
  font-size: 30px;
  line-height: 60px;
  font-weight: 600;
  text-align: center;
  border-radius: 10px;
  padding: 0 15px;
`;
const AlphabetContainer = styled.View`
  background-color: white;
  width: 40px;
  height: 40px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
`;
const Alphabet = styled.Text`
  color: ${MAIN_COLOR};
  font-size: 20px;
  line-height: 20px;
  font-weight: 700;
`;
export default function App() {
  const [word, setWord] = useState("");
  const [iconIndex, setIconIndex] = useState(0);

  const makeAlphabets = () => {
    const arr = word.split("");
    return arr.map((a, index) => (
      <AlphabetContainer key={index}>
        <Alphabet key={index}>{a}</Alphabet>
      </AlphabetContainer>
    ));
  };

  useEffect(() => {
    const randomIndex = getRandomIconIndex();
    setIconIndex(randomIndex);
    setWord(icons[randomIndex]);
  }, []);

  return (
    <Container>
      <IconContainer>
        <Ionicons name={icons[iconIndex]} size={90} color="white" />
      </IconContainer>
      <WordsContainer>{makeAlphabets()}</WordsContainer>
      <AnswerContainer>
        <Box>BLABLA_</Box>
      </AnswerContainer>
    </Container>
  );
}

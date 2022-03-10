import React, { useState, useEffect } from "react";
import { Animated, View, Dimensions } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import icons from "./icons";

const MAIN_COLOR = "#CE0C5C";
const ICONS_LENGTH = icons.length;
const ALPHABET_BALL_SIZE = "40";

const QUIZ_CONTAINER_FLEX = 2;
const WORDS_CONTAINER_FLEX = 5;
const ANSWER_CONTAINER_FLEX = 1;
const ALL_CONTAINER_FLEX =
  QUIZ_CONTAINER_FLEX + WORDS_CONTAINER_FLEX + ANSWER_CONTAINER_FLEX;

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// max exclusive: should be ICONS_LENGTH + 1
const getRandomNumber = (max) => Math.floor(Math.random() * max);

const getRandomPosition = (maxX, maxY) => {
  const x = getRandomNumber(maxX);
  const y = getRandomNumber(maxY);
  return { x, y };
};
const Container = styled.View`
  background-color: ${MAIN_COLOR};
  flex: 1;
`;
const QuizIconContainer = styled.View`
  flex: ${QUIZ_CONTAINER_FLEX};
  justify-content: flex-end;
  align-items: center;
`;
const WordsContainer = styled.View`
  flex: ${WORDS_CONTAINER_FLEX};
`;
const AnswerContainer = styled.View`
  flex: ${ANSWER_CONTAINER_FLEX};
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
const AnswerBox = styled.Text`
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
const AlphabetBall = styled(Animated.createAnimatedComponent(View))`
  background-color: white;
  width: ${ALPHABET_BALL_SIZE}px;
  height: ${ALPHABET_BALL_SIZE}px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
`;
const AlphabetText = styled.Text`
  color: ${MAIN_COLOR};
  font-size: 20px;
  line-height: 20px;
  font-weight: 700;
`;
export default function App() {
  const [word, setWord] = useState("");
  const [iconIndex, setIconIndex] = useState(0);

  const makeAlphabets = () => {
    const wordArr = word.split("");
    return wordArr.map((alphabet, index) => {
      const position = getRandomPosition(
        WINDOW_WIDTH - ALPHABET_BALL_SIZE,
        (WINDOW_HEIGHT / ALL_CONTAINER_FLEX) * WORDS_CONTAINER_FLEX -
          ALPHABET_BALL_SIZE
      );
      return (
        <AlphabetBall
          key={index}
          style={{
            position: "absolute",
            top: position.y,
            left: position.x,
          }}
        >
          <AlphabetText key={index}>{alphabet}</AlphabetText>
        </AlphabetBall>
      );
    });
  };

  useEffect(() => {
    const randomIndex = getRandomNumber(0, ICONS_LENGTH + 1);
    setIconIndex(randomIndex);
    setWord(icons[randomIndex]);
  }, []);

  return (
    <Container>
      <QuizIconContainer>
        <Ionicons name={icons[iconIndex]} size={90} color="white" />
      </QuizIconContainer>
      <WordsContainer>{makeAlphabets()}</WordsContainer>
      <AnswerContainer>
        <AnswerBox>BLABLA_</AnswerBox>
      </AnswerContainer>
    </Container>
  );
}

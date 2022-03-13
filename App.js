import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Animated,
  PanResponder,
  View,
  Dimensions,
  Pressable,
} from "react-native";
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
  console.log("max Y: ", maxY);
  const x = getRandomNumber(maxX - ALPHABET_BALL_SIZE);
  const y = getRandomNumber(maxY - ALPHABET_BALL_SIZE);
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

const AlphabetBall = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  background-color: white;
  width: ${ALPHABET_BALL_SIZE}px;
  height: ${ALPHABET_BALL_SIZE}px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
`;
const TouchableAlphabet = styled(Animated.createAnimatedComponent(Pressable))`
  position: absolute;
  width: ${ALPHABET_BALL_SIZE}px;
  height: ${ALPHABET_BALL_SIZE}px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background-color: white;
`;

const AlphabetText = styled.Text`
  color: ${MAIN_COLOR};
  font-size: 20px;
  line-height: 20px;
  font-weight: 700;
`;

const AnswerContainer = styled.View`
  flex: ${ANSWER_CONTAINER_FLEX};
  justify-content: center;
  align-items: center;
`;
const AnswerBox = styled.Text`
  border: 1px solid white;
  color: white;
  width: auto;
  width: 60px;
  height: 60px;
  font-size: 30px;
  line-height: 60px;
  font-weight: 600;
  text-align: center;
  border-radius: 10px;
  padding: 0 15px;
  margin-bottom: 20px;
`;

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState("");
  const [quizIconIndex, setQuizIconIndex] = useState(0);
  const [onPressInIndex, setOnPressInIndex] = useState(null);

  const onPressInPosition = useRef(new Animated.ValueXY()).current;

  const balls = useMemo(
    () =>
      data?.map((obj) => {
        const {
          position: { x, y },
        } = obj;
        return {
          ...obj,
          animatedVal:
            onPressInIndex === obj.index
              ? onPressInPosition.setValue({ x, y })
              : null,
        };
      }),
    [data, onPressInIndex]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // 오프셋 설정 (현 위치 누적값으로 저장)
          onPressInPosition.setOffset({
            x: onPressInPosition.x._value,
            y: onPressInPosition.y._value,
          });
        },
        onPanResponderMove: (_, { dx, dy }) => {
          onPressInPosition.setValue({
            x: dx,
            y: dy,
          });
          // Animated.Value 중지된 마지막 포지션 저장
          onPressInPosition.stopAnimation((val) => {
            balls[onPressInIndex].position.x = val.x;
            balls[onPressInIndex].position.y = val.y;
          });
        },
        onPanResponderRelease: () => {
          // 오프셋 + 이동거리 기본값 사용 후, 오프셋을 0으로 재설정
          onPressInPosition.flattenOffset();
        },
      }),
    [balls]
  );

  const makeAlphabets = () => {
    const arr = word.split("");
    const words = arr.map((alphabet, index) => {
      const position = getRandomPosition(
        WINDOW_WIDTH,
        (WINDOW_HEIGHT / ALL_CONTAINER_FLEX) * WORDS_CONTAINER_FLEX
      );
      const word = { index, position, alphabet };
      return word;
    });
    setData(words);
    // setLoading(false);
  };
  useEffect(() => {
    if (loading) {
      makeAlphabets();
    }
  }, [word, loading]);

  useEffect(() => {
    // const randomIndex = getRandomNumber(ICONS_LENGTH + 1);
    const randomIndex = getRandomNumber(1);
    setQuizIconIndex(randomIndex);
    setWord(icons[randomIndex]);
  }, []);

  return (
    <Container>
      <QuizIconContainer>
        <Ionicons name={icons[quizIconIndex]} size={90} color="white" />
      </QuizIconContainer>
      <WordsContainer>
        {balls?.map((ball) => (
          <AlphabetBall
            {...panResponder.panHandlers}
            key={ball.index}
            style={{
              left:
                ball.index !== onPressInIndex
                  ? ball.position.x
                  : onPressInPosition.x,
              top:
                ball.index !== onPressInIndex
                  ? ball.position.y
                  : onPressInPosition.y,
            }}
          >
            <TouchableAlphabet
              onPressIn={() => {
                setOnPressInIndex(ball.index);
              }}
              key={ball.index}
            >
              <AlphabetText key={ball.index}>{ball.alphabet}</AlphabetText>
            </TouchableAlphabet>
          </AlphabetBall>
        ))}
      </WordsContainer>
      <AnswerContainer>
        <AnswerBox>_</AnswerBox>
      </AnswerContainer>
    </Container>
  );
}

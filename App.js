import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Animated,
  PanResponder,
  View,
  Dimensions,
  TouchableOpacity,
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

const AlphabetBall = styled(Animated.createAnimatedComponent(View))`
  background-color: white;
  width: ${ALPHABET_BALL_SIZE}px;
  height: ${ALPHABET_BALL_SIZE}px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
`;
const TouchableAlphabet = styled(
  Animated.createAnimatedComponent(TouchableOpacity)
)`
  width: ${ALPHABET_BALL_SIZE}px;
  height: ${ALPHABET_BALL_SIZE}px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background-color: white;
  z-index: 900;
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
        onPanResponderRelease: (_, { dx, dy }) => {
          // 오프셋 + 이동거리 기본값 사용 후, 오프셋을 0으로 재설정
          onPressInPosition.flattenOffset();
        },
      }),

    [balls, onPressInIndex]
  );

  const makeAlphabets = () => {
    const wordArr = word.split("");
    const arr = wordArr.map((alphabet, index) => {
      const position = getRandomPosition(
        WINDOW_WIDTH - ALPHABET_BALL_SIZE,
        (WINDOW_HEIGHT / ALL_CONTAINER_FLEX) * WORDS_CONTAINER_FLEX -
          ALPHABET_BALL_SIZE
      );
      const obj = { index, position, alphabet };
      return obj;
    });
    setData(arr);
    // setLoading(false);
  };
  useEffect(() => {
    if (loading) {
      makeAlphabets();
    }
  }, [word, loading]);

  useEffect(() => {
    const randomIndex = getRandomNumber(0, ICONS_LENGTH + 1);
    setQuizIconIndex(randomIndex);
    setWord(icons[randomIndex]);
  }, []);

  return (
    <Container>
      <QuizIconContainer>
        <Ionicons name={icons[quizIconIndex]} size={90} color="white" />
      </QuizIconContainer>
      <WordsContainer>
        {balls?.map((ball) => {
          return (
            <AlphabetBall
              {...panResponder.panHandlers}
              key={ball.index}
              style={{
                position: "relative",
                left: ball.index !== onPressInIndex ? ball.position.x : 0,
                top: ball.index !== onPressInIndex ? ball.position.y : 0,
                transform:
                  ball.index === onPressInIndex
                    ? onPressInPosition.getTranslateTransform()
                    : null,
              }}
            >
              <TouchableAlphabet
                onPressIn={() => {
                  setOnPressInIndex(ball.index);
                }}
                key={ball.index}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                  position: "absolute",
                  borderColor: "blue",
                  borderWidth: 1,
                }}
              >
                <AlphabetText key={ball.index}>{ball.alphabet}</AlphabetText>
              </TouchableAlphabet>
            </AlphabetBall>
          );
        })}
      </WordsContainer>
      <AnswerContainer>
        <AnswerBox>_</AnswerBox>
      </AnswerContainer>
    </Container>
  );
}

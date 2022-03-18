import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Animated,
  PanResponder,
  View,
  Dimensions,
  Pressable,
  Text,
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
const AnswerBox = styled(Animated.createAnimatedComponent(View))`
  position: relative;
  border-radius: 10px;
  width: auto;
  min-width: 60px;
  height: 60px;
  margin-bottom: 20px;
`;
const AnswerBorder = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  border: 1px solid white;
  border-radius: 10px;
  min-width: 60px;
  height: 60px;
  align-self: center;
`;
const AnswerBg = styled(Animated.createAnimatedComponent(View))`
  position: absolute;
  border-radius: 10px;
  background-color: white;
  width: auto;
  min-width: 60px;
  height: 60px;
  align-self: center;
`;
const AnswerText = styled(Animated.createAnimatedComponent(Text))`
  position: absolute;
  min-width: 60px;
  padding: 0 15px;
  font-size: 30px;
  line-height: 60px;
  font-weight: 600;
  text-align: center;
  color: white;
  align-self: center;
`;
export default function App() {
  const [balls, setBalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [word, setWord] = useState("");
  const [quizIconIndex, setQuizIconIndex] = useState(0);

  const [correctIndex, setCorrectIndex] = useState(0);
  const [onPressInIndex, setOnPressInIndex] = useState(null);
  const [clickedIndex, setClickedIndex] = useState(null);

  const [wordContainerHeight, setWordContainerHeight] = useState();
  const [answer, setAnswer] = useState("");
  const [hiddenBalls, setHiddenBalls] = useState([]);

  const onPressInPosition = useRef(new Animated.ValueXY()).current;
  const correctIndexPosition = useRef(new Animated.ValueXY()).current;

  const ballScale = useRef(new Animated.Value(1)).current;
  const answerBgOpacity = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(1)).current;
  const answerBgWidth = useRef(new Animated.Value(60)).current;
  const answerBorderWidth = useRef(new Animated.Value(60)).current;

  const scaleOut = Animated.timing(ballScale, {
    toValue: 0,
    useNativeDriver: true,
  });
  const moveBallToCenter = Animated.timing(correctIndexPosition, {
    toValue: {
      x: WINDOW_WIDTH / 2 - ALPHABET_BALL_SIZE + 20,
      y: wordContainerHeight + 20,
    },
    useNativeDriver: true,
  });
  const answerBgFadeIn = Animated.timing(answerBgOpacity, {
    toValue: 0.5,
    duration: 200,
    useNativeDriver: false,
  });
  const answerBgFadeOut = Animated.timing(answerBgOpacity, {
    toValue: 0,
    duration: 200,
    useNativeDriver: false,
  });
  const answerFadeIn = Animated.timing(answerOpacity, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  });
  const answerFadeOut = Animated.timing(answerOpacity, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });
  const moveBallToBottom = Animated.timing(correctIndexPosition, {
    toValue: {
      x: WINDOW_WIDTH / 2 - ALPHABET_BALL_SIZE + 40,
      y: wordContainerHeight + 20,
    },
    duration: 10,
    useNativeDriver: true,
  });
  const contentFadeAnim = Animated.sequence([
    Animated.parallel([answerFadeOut, answerBgFadeIn]),
    Animated.parallel([answerFadeIn, answerBgFadeOut]),
  ]);
  const wrongIndexClickedAnim = Animated.spring(onPressInPosition, {
    toValue: {
      x: onPressInPosition.x._value + getRandomNumber(10),
      y: onPressInPosition.y._value + getRandomNumber(10),
    },
    useNativeDriver: true,
    tension: 1000,
  });
  const correctIndexClickedAnim = Animated.sequence([
    moveBallToBottom,
    Animated.parallel([scaleOut, moveBallToCenter, contentFadeAnim]),
  ]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { index } = evt._targetInst.memoizedProps;
          setOnPressInIndex(index);
          setClickedIndex(index);
          // 오프셋 설정 (현 위치 누적값으로 저장)
          onPressInPosition.setOffset({
            x: balls[index].position.x,
            y: balls[index].position.y,
          });
          correctIndexPosition.setValue({
            x: balls[index].position.x,
            y: balls[index].position.y,
          });
        },
        onPanResponderMove: (evt, { dx, dy }) => {
          const { index } = evt._targetInst.memoizedProps;
          onPressInPosition.setValue({
            x: dx,
            y: dy,
          });

          if (dx > 2 || dx < -2 || dy > 2 || dy < -2) {
            // if dragged ? not clicked
            setClickedIndex(null);
            // Animated.Value 중지된 마지막 포지션 저장
            onPressInPosition.stopAnimation((val) => {
              balls[index].position.x = val.x;
              balls[index].position.y = val.y;
            });
          }
        },
        onPanResponderRelease: (evt, { dx, dy }) => {
          const { index, alphabet } = evt._targetInst.memoizedProps;

          if (dx < 2 && dx > -2 && dy < 2 && dy > -2) {
            // if clicked ? not dragged
            if (correctIndex === clickedIndex) {
              //correctIndex는 디폴트 0으로 시작한다
              correctIndexClickedAnim.start(() => {
                setAnswer((prev) => prev + alphabet);
                ballScale.setValue(1);
                // // 알파벳 볼 제거
                setHiddenBalls([...hiddenBalls, index]);
                setCorrectIndex((prev) => prev + 1);
              });
            }
          }
        },
      }),
    [balls, onPressInIndex]
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
    setBalls(words);
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
      <WordsContainer
        onLayout={({
          nativeEvent: {
            layout: { height },
          },
        }) => setWordContainerHeight(height)}
      >
        {balls?.map(
          (ball) =>
            !hiddenBalls.includes(ball.index) && (
              <AlphabetBall
                {...panResponder.panHandlers}
                index={ball.index}
                alphabet={ball.alphabet}
                key={ball.index}
                style={{
                  left: ball.index !== onPressInIndex ? ball.position.x : 0,
                  top: ball.index !== onPressInIndex ? ball.position.y : 0,
                  transform:
                    ball.index === onPressInIndex && ball.index !== clickedIndex
                      ? [
                          { translateX: onPressInPosition.x },
                          { translateY: onPressInPosition.y },
                        ]
                      : ball.index === clickedIndex &&
                        ball.index === onPressInIndex
                      ? [
                          { translateX: correctIndexPosition.x },
                          { translateY: correctIndexPosition.y },
                          { scale: ballScale },
                        ]
                      : null,
                }}
              >
                <AlphabetText key={ball.index}>{ball.alphabet}</AlphabetText>
              </AlphabetBall>
            )
        )}
      </WordsContainer>
      <AnswerContainer>
        <AnswerBox>
          <AnswerText
            onLayout={(event) => {
              answerBorderWidth.setValue(event.nativeEvent.layout.width);
              answerBgWidth.setValue(event.nativeEvent.layout.width);
            }}
            style={{ opacity: answerOpacity }}
          >
            {answer}_
          </AnswerText>
          <AnswerBg
            style={{
              opacity: answerBgOpacity,
              width: answerBgWidth,
            }}
          />
          <AnswerBorder style={{ width: answerBorderWidth }} />
        </AnswerBox>
      </AnswerContainer>
    </Container>
  );
}

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Dimensions,
  Animated,
  PanResponder,
  View,
  Text,
  Easing,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import icons from "./icons";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const MAIN_COLOR = "#CE0C5C";
const ICONS_LENGTH = icons.length;
const ALPHABET_BALL_SIZE = "40";

const QUIZ_CONTAINER_FLEX = 2;
const WORDS_CONTAINER_FLEX = 5;
const ANSWER_CONTAINER_FLEX = 1;
const ALL_CONTAINER_FLEX =
  QUIZ_CONTAINER_FLEX + WORDS_CONTAINER_FLEX + ANSWER_CONTAINER_FLEX;

// max exclusive: should be ICONS_LENGTH + 1
const getRandomNumber = (max) => Math.floor(Math.random() * max);

const getRandomPosition = (maxX, maxY) => {
  const x = getRandomNumber(maxX - ALPHABET_BALL_SIZE);
  const y = getRandomNumber(maxY - ALPHABET_BALL_SIZE);
  return { x, y };
};
const Background = styled.View`
  background-color: ${MAIN_COLOR};
  flex: 1;
`;
const InteractiveContainer = styled.View`
  flex: 1;
`;
const FinalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const FinalCheckContainer = styled(Animated.createAnimatedComponent(View))`
  background-color: white;
  width: 200px;
  height: 200px;
  border-radius: 100px;
  justify-content: center;
  align-items: center;
`;

const FinalAnswerContainer = styled(Animated.createAnimatedComponent(View))`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FinalAnswerIconBg = styled(FinalCheckContainer)``;

const FinalWord = styled(Animated.createAnimatedComponent(Text))`
  color: white;
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  padding: 20px;
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
  const [success, setSuccess] = useState(false);
  const [final, setFinal] = useState(false);

  const onPressInPosition = useRef(new Animated.ValueXY()).current;
  const correctIndexPosition = useRef(new Animated.ValueXY()).current;
  const wrongIndexPosition = useRef(new Animated.ValueXY()).current;

  const ballScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(1)).current;
  const answerBgWidth = useRef(new Animated.Value(60)).current;
  const answerBorderWidth = useRef(new Animated.Value(60)).current;
  // FINAL ANSWER VALUES
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(1)).current;
  const finalAnswerOpacity = useRef(new Animated.Value(0)).current;
  const finalAnswerScale = useRef(new Animated.Value(0)).current;
  const finalAnswerPositionY = useRef(new Animated.Value(0)).current;

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
  const answerBgFadeIn = Animated.timing(bgOpacity, {
    toValue: 0.5,
    duration: 200,
    useNativeDriver: false,
  });
  const answerBgFadeOut = Animated.timing(bgOpacity, {
    toValue: 0,
    duration: 200,
    useNativeDriver: false,
  });
  const answerFadeOut = Animated.timing(answerOpacity, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });
  const answerFadeIn = Animated.timing(answerOpacity, {
    toValue: 1,
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
  const wordContentFadeAnim = Animated.sequence([
    Animated.parallel([answerFadeOut, answerBgFadeIn]),
    Animated.parallel([answerFadeIn, answerBgFadeOut]),
  ]);
  const correctIndexClickedAnim = Animated.sequence([
    moveBallToBottom,
    Animated.parallel([scaleOut, moveBallToCenter, wordContentFadeAnim]),
  ]);
  // FINAL ANSWER ANIM
  const checkScaleIn = Animated.timing(checkScale, {
    toValue: 1,
    easing: Easing.bounce,
    useNativeDriver: true,
  });
  const checkScaleMore = Animated.timing(checkScale, {
    toValue: 20,
    easing: Easing.linear,
    useNativeDriver: true,
  });
  const checkFadeOut = Animated.timing(checkOpacity, {
    toValue: 0,
    useNativeDriver: true,
  });
  const finalCheckAnim = Animated.sequence([
    checkScaleIn,
    Animated.parallel([checkScaleMore, checkFadeOut]),
  ]);
  const finalAnswerScaleIn = Animated.spring(finalAnswerScale, {
    toValue: 1,
    useNativeDriver: true,
    duration: 2000,
  });
  const finalAnswerFadeOut = Animated.spring(finalAnswerOpacity, {
    toValue: 1,
    useNativeDriver: true,
    duration: 2000,
  });
  const finalAnswerAnim = Animated.parallel([
    finalAnswerScaleIn,
    finalAnswerFadeOut,
  ]);
  const finalAnswerTranslateY = Animated.spring(finalAnswerPositionY, {
    toValue: WINDOW_HEIGHT,
    speed: 80,
    useNativeDriver: true,
    delay: 1000,
  });
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
          wrongIndexPosition.setValue({
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
          // if clicked
          if (dx < 2 && dx > -2 && dy < 2 && dy > -2) {
            return;
          }
          setClickedIndex(null);
          // Animated.Value 중지된 마지막 포지션 저장
          onPressInPosition.stopAnimation((val) => {
            balls[index].position.x = val.x;
            balls[index].position.y = val.y;
          });
        },
        onPanResponderRelease: (evt, { dx, dy }) => {
          const { index, alphabet } = evt._targetInst.memoizedProps;
          // if dragged
          if (dx > 2 || dx < -2 || dy > 2 || dy < -2) {
            return;
          }
          if (correctIndex === index) {
            opacity.setValue(1);
            correctIndexClickedAnim.start(() => {
              setAnswer((prev) => prev + alphabet);
              ballScale.setValue(1);
              setHiddenBalls([...hiddenBalls, index]);
              setCorrectIndex((prev) => prev + 1);
            });
          } else {
            // 정답이 아닌 볼을 클릭한다면
            Animated.spring(wrongIndexPosition, {
              toValue: {
                x: balls[index].position.x + getRandomNumber(15),
                y: balls[index].position.y + getRandomNumber(15),
              },
              useNativeDriver: true,
              tension: 1000,
              duration: 500,
            }).start(() => {
              wrongIndexPosition.setValue({
                x: balls[index].position.x,
                y: balls[index].position.y,
              });
            });
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
    const randomIndex = getRandomNumber(ICONS_LENGTH + 1);
    setQuizIconIndex(randomIndex);
    setWord(icons[randomIndex]);
  }, []);

  const resetFinal = () => {
    checkOpacity.setValue(0);
    checkScale.setValue(1);
    finalAnswerScale.setValue(0);
    finalAnswerOpacity.setValue(0);
  };
  useEffect(() => {
    console.log(word, answer);
    if (word === answer && word !== "" && answer !== "") {
      setSuccess(true);
      finalCheckAnim.start(() => {
        checkScale.stopAnimation(() => {
          setFinal(true);
          Animated.sequence([finalAnswerAnim, finalAnswerTranslateY]).start(
            resetFinal
          );
        });
      });
    }
  }, [word, answer]);

  return (
    <Background>
      {!success && (
        <InteractiveContainer>
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
                    alphabet={ball.alphabet} // passing to Pan Responder
                    key={ball.index}
                    style={{
                      left: ball.index !== onPressInIndex ? ball.position.x : 0,
                      top: ball.index !== onPressInIndex ? ball.position.y : 0,
                      transform:
                        ball.index === onPressInIndex &&
                        ball.index !== clickedIndex
                          ? onPressInPosition.getTranslateTransform()
                          : ball.index === clickedIndex &&
                            ball.index === correctIndex
                          ? [
                              ...correctIndexPosition.getTranslateTransform(),
                              { scale: ballScale },
                            ]
                          : ball.index !== correctIndex &&
                            ball.index === clickedIndex
                          ? wrongIndexPosition.getTranslateTransform()
                          : null,
                    }}
                  >
                    <AlphabetText key={ball.index}>
                      {ball.alphabet}
                    </AlphabetText>
                  </AlphabetBall>
                )
            )}
          </WordsContainer>
          <AnswerContainer>
            <AnswerBox>
              <AnswerText
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  answerBorderWidth.setValue(width);
                  answerBgWidth.setValue(width);
                }}
                style={{ opacity: answerOpacity }}
              >
                {answer}_
              </AnswerText>
              <AnswerBg
                style={{
                  opacity: bgOpacity,
                  width: answerBgWidth,
                }}
              />
              <AnswerBorder style={{ width: answerBorderWidth }} />
            </AnswerBox>
          </AnswerContainer>
        </InteractiveContainer>
      )}
      {success && (
        <FinalContainer>
          {!final && (
            <FinalCheckContainer
              style={{
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              }}
            >
              <Ionicons
                name="checkmark"
                color="#3EB747"
                size={120}
                style={{
                  lineHeight: 120,
                  textAlign: "center",
                  fontWeight: 600,
                }}
              />
            </FinalCheckContainer>
          )}
          {final && (
            <FinalAnswerContainer
              style={{
                opacity: final,
                transform: [
                  { scale: finalAnswerScale },
                  { translateY: finalAnswerPositionY },
                ],
              }}
            >
              <FinalAnswerIconBg>
                <Ionicons
                  name={word}
                  color={MAIN_COLOR}
                  size={120}
                  style={{
                    lineHeight: 120,
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                />
              </FinalAnswerIconBg>
              <FinalWord>{word}</FinalWord>
            </FinalAnswerContainer>
          )}
        </FinalContainer>
      )}
    </Background>
  );
}

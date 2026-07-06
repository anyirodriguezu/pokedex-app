import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'tamagui';

const BALL_SIZE = 110;
const BALL_BORDER = 4;
const HALF = BALL_SIZE / 2;
const BTN = BALL_SIZE * 0.22;

const DrawnPokeBallTop: React.FC = () => (
  <View style={styles.ballHalfTop}>
    <View style={styles.ballTopFill} />
  </View>
);

const DrawnPokeBallBottom: React.FC = () => (
  <View style={styles.ballHalfBottom}>
    <View style={styles.ballBottomFill} />
    <View style={styles.ballButton} />
    <View style={styles.ballButtonInner} />
  </View>
);

interface Props {
  visible:    boolean;
  onComplete: () => void;
}

export const EscapeEffect: React.FC<Props> = ({ visible, onComplete }) => {
  const { width, height } = useWindowDimensions();
  const cx = width  / 2;
  const cy = height / 2;

  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const ballScale    = useRef(new Animated.Value(0)).current;
  const ballOpacity  = useRef(new Animated.Value(0)).current;
  const topHalfY     = useRef(new Animated.Value(0)).current;
  const bottomHalfY  = useRef(new Animated.Value(0)).current;
  const ballRock     = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelScale   = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!visible) return;

    bgOpacity.setValue(0);
    ballScale.setValue(0);
    ballOpacity.setValue(0);
    topHalfY.setValue(0);
    bottomHalfY.setValue(0);
    ballRock.setValue(0);
    flashOpacity.setValue(0);
    glowOpacity.setValue(0);
    labelOpacity.setValue(0);
    labelScale.setValue(0.3);

    const rock = (v: number, ms: number) =>
      Animated.timing(ballRock, { toValue: v, duration: ms, useNativeDriver: true });

    Animated.sequence([
      Animated.parallel([
        Animated.timing(bgOpacity,   { toValue: 0.6,  duration: 250, useNativeDriver: true }),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ballScale,   { toValue: 1.15, duration: 180, useNativeDriver: true }),
            Animated.timing(ballOpacity, { toValue: 1,    duration: 180, useNativeDriver: true }),
          ]),
          Animated.timing(ballScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
        ]),
      ]),

      Animated.sequence([
        rock( 0.50, 100), rock(-0.50, 100),
        rock( 0.50, 100), rock(-0.50, 100),
        rock( 0.40,  90), rock(-0.40,  90),
        rock(    0,  80),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.55, duration: 180, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(glowOpacity,  { toValue: 0,           duration: 320, useNativeDriver: true }),
            Animated.timing(topHalfY,     { toValue: -HALF * 1.5, duration: 300, useNativeDriver: true }),
            Animated.timing(bottomHalfY,  { toValue:  HALF * 1.5, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flashOpacity, { toValue: 0.65, duration: 70,  useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0,    duration: 230, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(labelOpacity, { toValue: 1,    duration: 140, useNativeDriver: true }),
            Animated.timing(labelScale,   { toValue: 1.15, duration: 140, useNativeDriver: true }),
          ]),
          Animated.timing(labelScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
        ]),
      ]),

      Animated.delay(700),
      Animated.parallel([
        Animated.timing(bgOpacity,    { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(ballOpacity,  { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [visible]);

  if (!visible) return null;

  const rockRotate = ballRock.interpolate({
    inputRange:  [-1, 0, 1],
    outputRange: ['-55deg', '0deg', '55deg'],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: bgOpacity }]} />

      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#EF4444', opacity: glowOpacity }]} />

      <Animated.View
        style={{
          position: 'absolute',
          left:     cx - BALL_SIZE / 2,
          top:      cy - BALL_SIZE / 2,
          width:    BALL_SIZE,
          height:   BALL_SIZE,
          opacity:  ballOpacity,
          transform: [{ scale: ballScale }, { rotate: rockRotate }],
        }}
      >
        <Animated.View
          style={{
            position: 'absolute', top: 0, left: 0,
            width: BALL_SIZE, height: HALF, overflow: 'hidden',
            transform: [{ translateY: topHalfY }],
          }}
        >
          <DrawnPokeBallTop />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute', top: HALF, left: 0,
            width: BALL_SIZE, height: HALF, overflow: 'hidden',
            transform: [{ translateY: bottomHalfY }],
          }}
        >
          <DrawnPokeBallBottom />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute', left: 0, right: 0,
          top: cy + BALL_SIZE / 2 + 24,
          alignItems: 'center',
          opacity:   labelOpacity,
          transform: [{ scale: labelScale }],
        }}
      >
        <Text style={styles.escapeLabel}>¡Se escapó!</Text>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F97316', opacity: flashOpacity }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ballHalfTop: {
    width:              BALL_SIZE,
    height:             HALF,
    borderTopLeftRadius:  BALL_SIZE / 2,
    borderTopRightRadius: BALL_SIZE / 2,
    borderWidth:        BALL_BORDER,
    borderBottomWidth:  0,
    borderColor:        '#111',
    overflow:           'hidden',
  },
  ballTopFill:    { flex: 1, backgroundColor: '#E3350D' },
  ballHalfBottom: {
    width:                 BALL_SIZE,
    height:                HALF,
    borderBottomLeftRadius:  BALL_SIZE / 2,
    borderBottomRightRadius: BALL_SIZE / 2,
    borderWidth:           BALL_BORDER,
    borderTopWidth:        0,
    borderColor:           '#111',
    overflow:              'hidden',
    backgroundColor:       '#FAFAFA',
  },
  ballBottomFill: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FAFAFA',
  },
  ballButton: {
    position:        'absolute',
    top:             -BTN / 2,
    left:            HALF - BTN / 2 - BALL_BORDER,
    width:           BTN,
    height:          BTN,
    borderRadius:    BTN / 2,
    backgroundColor: '#FAFAFA',
    borderWidth:     3,
    borderColor:     '#111',
  },
  ballButtonInner: {
    position:        'absolute',
    top:             -BTN * 0.19,
    left:            HALF - BTN * 0.19 - BALL_BORDER,
    width:           BTN * 0.38,
    height:          BTN * 0.38,
    borderRadius:    (BTN * 0.38) / 2,
    backgroundColor: '#D0D0D0',
  },
  escapeLabel: {
    fontSize:         38,
    fontWeight:       '900',
    color:            '#FF4500',
    textShadowColor:  '#000',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    letterSpacing:    1,
  },
});

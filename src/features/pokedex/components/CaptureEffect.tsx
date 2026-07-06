import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'tamagui';

const BALL_SIZE = 110;
const BALL_BORDER = 4;
const HALF = BALL_SIZE / 2;
const BTN = BALL_SIZE * 0.22;
const RING_SIZE = 160;

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

const COLORS = [
  '#E3350D', '#F8D030', '#6890F0', '#78C850',
  '#EE99AC', '#F08030', '#A040A0', '#98D8D8',
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3',
];
const COUNT = 30;

interface Particle {
  tx:      Animated.Value;
  ty:      Animated.Value;
  opacity: Animated.Value;
  rotate:  Animated.Value;
  angle:    number;
  distance: number;
  color:    string;
  w: number;
  h: number;
}

function buildParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    tx:      new Animated.Value(0),
    ty:      new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate:  new Animated.Value(0),
    angle:    (i / COUNT) * Math.PI * 2,
    distance: 130 + (i % 6) * 30,
    color:    COLORS[i % COLORS.length],
    w: 8  + (i % 3) * 5,
    h: 5  + (i % 2) * 4,
  }));
}

const T_SHOW  = 280;
const T_CLOSE = 400;
const T_ROCK  = 700;
const T_FLASH = 160;
const T_BURST = 750;

interface Props {
  visible:    boolean;
  onComplete: () => void;
  label?:     string;
}

export const CaptureEffect: React.FC<Props> = ({ visible, onComplete, label = '¡Atrapado!' }) => {
  const { width, height } = useWindowDimensions();
  const cx = width  / 2;
  const cy = height / 2;

  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const ballScale    = useRef(new Animated.Value(0)).current;
  const ballOpacity  = useRef(new Animated.Value(0)).current;
  const topHalfY     = useRef(new Animated.Value(0)).current;
  const bottomHalfY  = useRef(new Animated.Value(0)).current;
  const beamOpacity  = useRef(new Animated.Value(0)).current;
  const ballRock     = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelScale   = useRef(new Animated.Value(0.3)).current;
  const ring1Scale   = useRef(new Animated.Value(0.3)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(0.3)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale   = useRef(new Animated.Value(0.3)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;
  const particles    = useRef<Particle[]>(buildParticles()).current;

  useEffect(() => {
    if (!visible) return;

    bgOpacity.setValue(0);
    ballScale.setValue(0);
    ballOpacity.setValue(0);
    topHalfY.setValue(-HALF * 1.3);
    bottomHalfY.setValue(HALF * 1.3);
    beamOpacity.setValue(0);
    ballRock.setValue(0);
    flashOpacity.setValue(0);
    labelOpacity.setValue(0);
    labelScale.setValue(0.3);
    ring1Scale.setValue(0.3); ring1Opacity.setValue(0);
    ring2Scale.setValue(0.3); ring2Opacity.setValue(0);
    ring3Scale.setValue(0.3); ring3Opacity.setValue(0);
    particles.forEach((p) => {
      p.tx.setValue(0); p.ty.setValue(0);
      p.opacity.setValue(0); p.rotate.setValue(0);
    });

    const rock = (v: number, ms: number) =>
      Animated.timing(ballRock, { toValue: v, duration: ms, useNativeDriver: true });

    const makeRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 4.2, duration: 620, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.8, duration: 1,   useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,   duration: 619, useNativeDriver: true }),
          ]),
        ]),
      ]);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(bgOpacity,   { toValue: 0.55, duration: T_SHOW, useNativeDriver: true }),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ballScale,   { toValue: 1.15, duration: T_SHOW * 0.65, useNativeDriver: true }),
            Animated.timing(ballOpacity, { toValue: 1,    duration: T_SHOW * 0.5,  useNativeDriver: true }),
            Animated.timing(beamOpacity, { toValue: 1,    duration: T_SHOW * 0.5,  useNativeDriver: true }),
          ]),
          Animated.timing(ballScale, { toValue: 1.0, duration: T_SHOW * 0.35, useNativeDriver: true }),
        ]),
      ]),

      Animated.parallel([
        Animated.timing(topHalfY,    { toValue: 0, duration: T_CLOSE, useNativeDriver: true }),
        Animated.timing(bottomHalfY, { toValue: 0, duration: T_CLOSE, useNativeDriver: true }),
        Animated.timing(beamOpacity, { toValue: 0, duration: T_CLOSE * 0.55, useNativeDriver: true }),
      ]),

      Animated.sequence([
        rock( 0.30, 110), rock(-0.30, 110),
        rock( 0.22, 100), rock(-0.22, 100),
        rock( 0.12,  90), rock(-0.12,  90),
        rock(    0,  70),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flashOpacity, { toValue: 0.9,  duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0.25, duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0.75, duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0,    duration: T_FLASH / 2, useNativeDriver: true }),
        ]),
        makeRing(ring1Scale, ring1Opacity, 0),
        makeRing(ring2Scale, ring2Opacity, 110),
        makeRing(ring3Scale, ring3Opacity, 220),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(labelOpacity, { toValue: 1,    duration: 160, useNativeDriver: true }),
            Animated.timing(labelScale,   { toValue: 1.15, duration: 160, useNativeDriver: true }),
          ]),
          Animated.timing(labelScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
        ]),
      ]),

      Animated.parallel([
        Animated.timing(bgOpacity,    { toValue: 0,   duration: T_BURST,        useNativeDriver: true }),
        Animated.timing(ballOpacity,  { toValue: 0,   duration: T_BURST * 0.45, useNativeDriver: true }),
        Animated.timing(ballScale,    { toValue: 1.4, duration: T_BURST * 0.45, useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 0,   duration: T_BURST * 0.65, useNativeDriver: true }),
        ...particles.map((p) =>
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 1, useNativeDriver: true }),
            Animated.parallel([
              Animated.timing(p.tx,      { toValue: Math.cos(p.angle) * p.distance, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.ty,      { toValue: Math.sin(p.angle) * p.distance, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.rotate,  { toValue: 5, duration: T_BURST, useNativeDriver: true }),
            ]),
          ])
        ),
      ]),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [visible]);

  if (!visible) return null;

  const rockRotate = ballRock.interpolate({
    inputRange:  [-1, 0, 1],
    outputRange: ['-45deg', '0deg', '45deg'],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: bgOpacity }]} />

      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({ inputRange: [0, 5], outputRange: ['0deg', '1800deg'] });
        return (
          <Animated.View
            key={i}
            style={{
              position:        'absolute',
              backgroundColor: p.color,
              width:           p.w,
              height:          p.h,
              borderRadius:    3,
              left:            cx - p.w / 2,
              top:             cy - p.h / 2,
              opacity:         p.opacity,
              transform: [{ translateX: p.tx }, { translateY: p.ty }, { rotate }],
            }}
          />
        );
      })}

      {([
        { scale: ring1Scale, opacity: ring1Opacity, color: '#E3350D' },
        { scale: ring2Scale, opacity: ring2Opacity, color: '#F8D030' },
        { scale: ring3Scale, opacity: ring3Opacity, color: '#FFFFFF' },
      ] as const).map((ring, i) => (
        <Animated.View
          key={`ring-${i}`}
          style={{
            position:    'absolute',
            width:       RING_SIZE,
            height:      RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth:  3,
            borderColor:  ring.color,
            left:  cx - RING_SIZE / 2,
            top:   cy - RING_SIZE / 2,
            opacity:   ring.opacity,
            transform: [{ scale: ring.scale }],
          }}
        />
      ))}

      <Animated.View
        style={{
          position:  'absolute',
          left:      cx - 30,
          top:       cy - HALF,
          width:     60,
          height:    HALF * 2,
          opacity:   beamOpacity,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        <View style={styles.beam} />
      </Animated.View>

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
            position: 'absolute',
            top:      0,
            left:     0,
            width:    BALL_SIZE,
            height:   HALF,
            overflow: 'hidden',
            transform: [{ translateY: topHalfY }],
          }}
        >
          <DrawnPokeBallTop />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            top:      HALF,
            left:     0,
            width:    BALL_SIZE,
            height:   HALF,
            overflow: 'hidden',
            transform: [{ translateY: bottomHalfY }],
          }}
        >
          <DrawnPokeBallBottom />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy + BALL_SIZE / 2 + 24,
          alignItems: 'center',
          opacity:   labelOpacity,
          transform: [{ scale: labelScale }],
        }}
      >
        <Text style={styles.captureLabel}>{label}</Text>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: flashOpacity }]}
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
  ballTopFill: {
    flex:            1,
    backgroundColor: '#E3350D',
  },
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
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
  beam: {
    flex:            1,
    backgroundColor: '#FFE0B2',
    opacity:         0.9,
    borderRadius:    30,
    marginHorizontal: 6,
  },
  captureLabel: {
    fontSize:         38,
    fontWeight:       '900',
    color:            '#FFD700',
    textShadowColor:  '#B22A00',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    letterSpacing:    1,
  },
});

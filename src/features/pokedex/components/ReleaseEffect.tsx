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

const COLD_COLORS = [
  '#60A5FA', '#818CF8', '#A78BFA', '#C4B5FD',
  '#93C5FD', '#E0F2FE', '#BAE6FD', '#7DD3FC',
  '#6EE7F7', '#B2EBF2', '#A5B4FC', '#DDD6FE',
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
    color:    COLD_COLORS[i % COLD_COLORS.length],
    w: 7 + (i % 3) * 4,
    h: 4 + (i % 2) * 4,
  }));
}

const T_OPEN  = 300;
const T_FLASH = 200;
const T_BURST = 700;

interface Props {
  visible:    boolean;
  onComplete: () => void;
}

export const ReleaseEffect: React.FC<Props> = ({ visible, onComplete }) => {
  const { width, height } = useWindowDimensions();
  const cx = width  / 2;
  const cy = height / 2;

  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const ballScale    = useRef(new Animated.Value(0)).current;
  const ballOpacity  = useRef(new Animated.Value(0)).current;
  const topHalfY     = useRef(new Animated.Value(0)).current;
  const bottomHalfY  = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const beamOpacity  = useRef(new Animated.Value(0)).current;
  const beamScale    = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelScale   = useRef(new Animated.Value(0.3)).current;
  const ring1Scale   = useRef(new Animated.Value(0.3)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(0.3)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const particles    = useRef<Particle[]>(buildParticles()).current;

  useEffect(() => {
    if (!visible) return;

    bgOpacity.setValue(0);
    ballScale.setValue(0);
    ballOpacity.setValue(0);
    topHalfY.setValue(0);
    bottomHalfY.setValue(0);
    flashOpacity.setValue(0);
    beamOpacity.setValue(0);
    beamScale.setValue(0);
    labelOpacity.setValue(0);
    labelScale.setValue(0.3);
    ring1Scale.setValue(0.3); ring1Opacity.setValue(0);
    ring2Scale.setValue(0.3); ring2Opacity.setValue(0);
    particles.forEach((p) => {
      p.tx.setValue(0); p.ty.setValue(0);
      p.opacity.setValue(0); p.rotate.setValue(0);
    });

    const makeRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 4.2, duration: 620, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.75, duration: 1,   useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0,    duration: 619, useNativeDriver: true }),
          ]),
        ]),
      ]);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(bgOpacity,   { toValue: 0.55, duration: T_OPEN * 0.6, useNativeDriver: true }),
        Animated.timing(ballScale,   { toValue: 1,    duration: T_OPEN * 0.6, useNativeDriver: true }),
        Animated.timing(ballOpacity, { toValue: 1,    duration: T_OPEN * 0.6, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(topHalfY,    { toValue: -HALF * 1.2, duration: T_OPEN, useNativeDriver: true }),
        Animated.timing(bottomHalfY, { toValue:  HALF * 1.2, duration: T_OPEN, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(beamOpacity, { toValue: 1, duration: T_OPEN * 0.4, useNativeDriver: true }),
          Animated.timing(beamScale,   { toValue: 1, duration: T_OPEN * 0.6, useNativeDriver: true }),
        ]),
        makeRing(ring1Scale, ring1Opacity, 0),
      ]),

      Animated.parallel([
        Animated.sequence([
          Animated.timing(flashOpacity, { toValue: 0.85, duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0.2,  duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0.65, duration: T_FLASH / 2, useNativeDriver: true }),
          Animated.timing(flashOpacity, { toValue: 0,    duration: T_FLASH / 2, useNativeDriver: true }),
        ]),
        makeRing(ring2Scale, ring2Opacity, 0),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(labelOpacity, { toValue: 1,    duration: 160, useNativeDriver: true }),
            Animated.timing(labelScale,   { toValue: 1.15, duration: 160, useNativeDriver: true }),
          ]),
          Animated.timing(labelScale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
        ]),
      ]),

      Animated.parallel([
        Animated.timing(bgOpacity,    { toValue: 0, duration: T_BURST,        useNativeDriver: true }),
        Animated.timing(ballOpacity,  { toValue: 0, duration: T_BURST * 0.4,  useNativeDriver: true }),
        Animated.timing(beamOpacity,  { toValue: 0, duration: T_BURST * 0.4,  useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 0, duration: T_BURST * 0.65, useNativeDriver: true }),
        ...particles.map((p) =>
          Animated.sequence([
            Animated.timing(p.opacity, { toValue: 1, duration: 1, useNativeDriver: true }),
            Animated.parallel([
              Animated.timing(p.tx,      { toValue: Math.cos(p.angle) * p.distance, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.ty,      { toValue: Math.sin(p.angle) * p.distance, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: T_BURST, useNativeDriver: true }),
              Animated.timing(p.rotate,  { toValue: 4, duration: T_BURST, useNativeDriver: true }),
            ]),
          ])
        ),
      ]),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', opacity: bgOpacity }]} />

      <Animated.View
        style={{
          position:  'absolute',
          left:      cx - 30,
          top:       cy - HALF,
          width:     60,
          height:    HALF * 2,
          opacity:   beamOpacity,
          transform: [{ scaleY: beamScale }],
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
          height:   HALF,
          overflow: 'hidden',
          opacity:  ballOpacity,
          transform: [{ scale: ballScale }, { translateY: topHalfY }],
        }}
      >
        <DrawnPokeBallTop />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          left:     cx - BALL_SIZE / 2,
          top:      cy,
          width:    BALL_SIZE,
          height:   HALF,
          overflow: 'hidden',
          opacity:  ballOpacity,
          transform: [{ scale: ballScale }, { translateY: bottomHalfY }],
        }}
      >
        <DrawnPokeBallBottom />
      </Animated.View>

      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '1440deg'] });
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
        { scale: ring1Scale, opacity: ring1Opacity, color: '#60A5FA' },
        { scale: ring2Scale, opacity: ring2Opacity, color: '#E0F9FF' },
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
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy + BALL_SIZE / 2 + 24,
          alignItems: 'center',
          opacity:   labelOpacity,
          transform: [{ scale: labelScale }],
        }}
      >
        <Text style={styles.releaseLabel}>¡Liberado!</Text>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#BAE6FD', opacity: flashOpacity }]}
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
    backgroundColor: '#E0F9FF',
    opacity:         0.95,
    borderRadius:    30,
    marginHorizontal: 6,
  },
  releaseLabel: {
    fontSize:         38,
    fontWeight:       '900',
    color:            '#E0F9FF',
    textShadowColor:  '#2563EB',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    letterSpacing:    1,
  },
});

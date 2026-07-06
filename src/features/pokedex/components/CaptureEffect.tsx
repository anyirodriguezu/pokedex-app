import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

// --- Pokébola dibujada con Views (nítida a cualquier tamaño) ---
const BALL_SIZE = 110;
const BALL_BORDER = 4;
const HALF = BALL_SIZE / 2;
const BTN = BALL_SIZE * 0.22;

const DrawnPokeBall: React.FC = () => (
  <View style={styles.ball}>
    <View style={styles.ballTop} />
    <View style={styles.ballBottom} />
    <View style={styles.ballDivider} />
    <View style={styles.ballButton} />
    <View style={styles.ballButtonInner} />
  </View>
);

// --- Partículas ---
const COLORS = [
  '#E3350D', '#F8D030', '#6890F0', '#78C850',
  '#EE99AC', '#F08030', '#A040A0', '#98D8D8',
];
const COUNT = 18;

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
    distance: 100 + (i % 5) * 28,
    color:    COLORS[i % COLORS.length],
    w: 8  + (i % 3) * 5,
    h: 5  + (i % 2) * 4,
  }));
}

// --- Duraciones (ms) ---
const T_APPEAR = 280;
const T_ROCK   = 700;
const T_FLASH  = 160;
const T_BURST  = 700;

interface Props {
  visible:    boolean;
  onComplete: () => void;
}

export const CaptureEffect: React.FC<Props> = ({ visible, onComplete }) => {
  const { width, height } = useWindowDimensions();
  const cx = width  / 2;
  const cy = height / 2;

  const ballScale    = useRef(new Animated.Value(0)).current;
  const ballOpacity  = useRef(new Animated.Value(0)).current;
  const ballRock     = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const particles    = useRef<Particle[]>(buildParticles()).current;

  useEffect(() => {
    if (!visible) return;

    // Reset
    ballScale.setValue(0);
    ballOpacity.setValue(0);
    ballRock.setValue(0);
    flashOpacity.setValue(0);
    particles.forEach((p) => {
      p.tx.setValue(0);
      p.ty.setValue(0);
      p.opacity.setValue(0);
      p.rotate.setValue(0);
    });

    const rock = (v: number, ms: number) =>
      Animated.timing(ballRock, { toValue: v, duration: ms, useNativeDriver: true });

    Animated.sequence([
      // Fase 1 — Pokébola aparece desde cero con rebote
      Animated.parallel([
        Animated.timing(ballScale,   { toValue: 1, duration: T_APPEAR, useNativeDriver: true }),
        Animated.timing(ballOpacity, { toValue: 1, duration: T_APPEAR, useNativeDriver: true }),
      ]),

      // Fase 2 — balanceo tipo juego (3 pares, decrecientes)
      Animated.sequence([
        rock( 0.30, 110), rock(-0.30, 110),
        rock( 0.22, 100), rock(-0.22, 100),
        rock( 0.12,  90), rock(-0.12,  90),
        rock(    0,  70),
      ]),

      // Fase 3 — destello blanco al "atrapar"
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.75, duration: T_FLASH / 2, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0,    duration: T_FLASH / 2, useNativeDriver: true }),
      ]),

      // Fase 4 — confeti + Pokébola desaparece
      Animated.parallel([
        Animated.timing(ballOpacity, { toValue: 0,   duration: T_BURST * 0.45, useNativeDriver: true }),
        Animated.timing(ballScale,   { toValue: 1.4, duration: T_BURST * 0.45, useNativeDriver: true }),
        ...particles.map((p) =>
          Animated.sequence([
            // Las partículas aparecen al instante y luego se desvanecen mientras vuelan
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
      {/* Partículas de confeti */}
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

      {/* Pokébola centrada */}
      <Animated.View
        style={{
          position: 'absolute',
          left:     cx - BALL_SIZE / 2,
          top:      cy - BALL_SIZE / 2,
          opacity:  ballOpacity,
          transform: [{ scale: ballScale }, { rotate: rockRotate }],
        }}
      >
        <DrawnPokeBall />
      </Animated.View>

      {/* Destello blanco */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: flashOpacity }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ball: {
    width:        BALL_SIZE,
    height:       BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    borderWidth:  BALL_BORDER,
    borderColor:  '#111',
    overflow:     'hidden',
  },
  ballTop: {
    position:        'absolute',
    top: 0, left: 0, right: 0,
    height:          HALF,
    backgroundColor: '#E3350D',
  },
  ballBottom: {
    position:        'absolute',
    bottom: 0, left: 0, right: 0,
    height:          HALF,
    backgroundColor: '#FAFAFA',
  },
  ballDivider: {
    position:        'absolute',
    top:             HALF - 3,
    left: 0, right: 0,
    height:          6,
    backgroundColor: '#111',
  },
  ballButton: {
    position:        'absolute',
    top:             HALF - BTN / 2,
    left:            HALF - BTN / 2,
    width:           BTN,
    height:          BTN,
    borderRadius:    BTN / 2,
    backgroundColor: '#FAFAFA',
    borderWidth:     3,
    borderColor:     '#111',
  },
  ballButtonInner: {
    position:        'absolute',
    top:             HALF - (BTN * 0.38) / 2,
    left:            HALF - (BTN * 0.38) / 2,
    width:           BTN * 0.38,
    height:          BTN * 0.38,
    borderRadius:    (BTN * 0.38) / 2,
    backgroundColor: '#D0D0D0',
  },
});

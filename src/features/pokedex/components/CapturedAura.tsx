import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

const TEAM_PALETTE = ['#22C55E', '#4ADE80', '#86EFAC', '#34D399', '#BBF7D0'];
const BOX_PALETTE  = ['#6366F1', '#818CF8', '#A5B4FC', '#8B5CF6', '#C7D2FE'];

const FLOAT_COUNT = 16;
const RING_SIZE   = 140;

interface FloatParticle {
  ty:        Animated.Value;
  tx:        Animated.Value;
  opacity:   Animated.Value;
  scale:     Animated.Value;
  rotate:    Animated.Value;
  baseX:     number;
  floatDur:  number;
  wobbleAmp: number;
  wobbleDur: number;
  pulseDur:  number;
  size:      number;
  color:     string;
  delay:     number;
  elongated: boolean;
}

interface Ring {
  scale:     Animated.Value;
  opacity:   Animated.Value;
  initDelay: number;
  loopGap:   number;
}

function makeParticles(isInTeam: boolean): FloatParticle[] {
  const palette = isInTeam ? TEAM_PALETTE : BOX_PALETTE;
  return Array.from({ length: FLOAT_COUNT }, (_, i) => ({
    ty:        new Animated.Value(0),
    tx:        new Animated.Value(0),
    opacity:   new Animated.Value(0),
    scale:     new Animated.Value(1),
    rotate:    new Animated.Value(0),
    baseX:     0.04 + (i / FLOAT_COUNT) * 0.92,
    floatDur:  3400 + i * 155,
    wobbleAmp: 14 + (i % 5) * 7,
    wobbleDur: 800 + (i % 4) * 250,
    pulseDur:  600 + (i % 5) * 180,
    size:      6 + (i % 4) * 3,
    color:     palette[i % palette.length],
    delay:     Math.round((i / FLOAT_COUNT) * 4800),
    elongated: i % 3 === 2,
  }));
}

function makeRings(): Ring[] {
  return [
    { scale: new Animated.Value(0.2), opacity: new Animated.Value(0), initDelay:  600, loopGap: 3200 },
    { scale: new Animated.Value(0.2), opacity: new Animated.Value(0), initDelay: 2000, loopGap: 4000 },
    { scale: new Animated.Value(0.2), opacity: new Animated.Value(0), initDelay: 3400, loopGap: 3600 },
  ];
}

interface Props {
  visible:  boolean;
  isInTeam: boolean;
}

export const CapturedAura: React.FC<Props> = ({ visible, isInTeam }) => {
  const { width, height } = useWindowDimensions();
  const cx = width  / 2;
  const cy = height / 2;

  const mounted    = useRef(true);
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tintPulse  = useRef(new Animated.Value(0.04)).current;
  const particles  = useRef(makeParticles(isInTeam)).current;
  const rings      = useRef(makeRings()).current;

  useEffect(() => {
    mounted.current = true;
    if (!visible) return;

    const push = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.current.push(t);
    };

    // Tinte de fondo que "respira"
    const runTint = () => {
      Animated.sequence([
        Animated.timing(tintPulse, { toValue: 0.10, duration: 2200, useNativeDriver: true }),
        Animated.timing(tintPulse, { toValue: 0.04, duration: 2200, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && mounted.current) runTint();
      });
    };

    // Flotación vertical + fade
    const runFloat = (p: FloatParticle) => {
      p.ty.setValue(0);
      p.opacity.setValue(0);
      Animated.parallel([
        Animated.timing(p.ty, {
          toValue:         -(height + 80),
          duration:        p.floatDur,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.opacity, { toValue: 0.60, duration: p.floatDur * 0.18, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0.45, duration: p.floatDur * 0.64, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0,    duration: p.floatDur * 0.18, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && mounted.current) runFloat(p);
      });
    };

    // Balanceo horizontal
    const runWobble = (p: FloatParticle) => {
      Animated.sequence([
        Animated.timing(p.tx, { toValue:  p.wobbleAmp, duration: p.wobbleDur, useNativeDriver: true }),
        Animated.timing(p.tx, { toValue: -p.wobbleAmp, duration: p.wobbleDur, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && mounted.current) runWobble(p);
      });
    };

    // Pulso de escala
    const runPulse = (p: FloatParticle) => {
      Animated.sequence([
        Animated.timing(p.scale, { toValue: 1.6, duration: p.pulseDur, useNativeDriver: true }),
        Animated.timing(p.scale, { toValue: 0.6, duration: p.pulseDur, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished && mounted.current) runPulse(p);
      });
    };

    // Rotación (solo partículas alargadas)
    const runRotate = (p: FloatParticle) => {
      p.rotate.setValue(0);
      Animated.timing(p.rotate, {
        toValue:         1,
        duration:        2200 + p.size * 100,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted.current) runRotate(p);
      });
    };

    // Anillos de ping periódicos
    const runRing = (ring: Ring) => {
      ring.scale.setValue(0.2);
      ring.opacity.setValue(0);
      Animated.parallel([
        Animated.timing(ring.scale, { toValue: 4.5, duration: 1800, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ring.opacity, { toValue: 0.4, duration: 1,    useNativeDriver: true }),
          Animated.timing(ring.opacity, { toValue: 0,   duration: 1800, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && mounted.current) {
          push(ring.loopGap, () => runRing(ring));
        }
      });
    };

    runTint();

    particles.forEach((p) => {
      push(p.delay, () => {
        runFloat(p);
        runWobble(p);
        runPulse(p);
        if (p.elongated) runRotate(p);
      });
    });

    rings.forEach((ring) => {
      push(ring.initDelay, () => runRing(ring));
    });

    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      tintPulse.stopAnimation();
      particles.forEach((p) => {
        p.ty.stopAnimation(); p.tx.stopAnimation();
        p.opacity.stopAnimation(); p.scale.stopAnimation();
        p.rotate.stopAnimation();
      });
      rings.forEach((r) => {
        r.scale.stopAnimation();
        r.opacity.stopAnimation();
      });
    };
  }, [visible, height]);

  if (!visible) return null;

  const tintColor = isInTeam ? '#22C55E' : '#6366F1';
  const ringColor = isInTeam ? '#4ADE80' : '#818CF8';

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Tinte de fondo que respira */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: tintColor, opacity: tintPulse }]}
      />

      {/* Anillos de ping desde el centro */}
      {rings.map((ring, i) => (
        <Animated.View
          key={`ring-${i}`}
          style={{
            position:     'absolute',
            width:        RING_SIZE,
            height:       RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth:  2,
            borderColor:  ringColor,
            left:         cx - RING_SIZE / 2,
            top:          cy - RING_SIZE / 2,
            opacity:      ring.opacity,
            transform:    [{ scale: ring.scale }],
          }}
        />
      ))}

      {/* Partículas flotantes */}
      {particles.map((p, i) => {
        const rotateInterp = p.rotate.interpolate({
          inputRange:  [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        const pw = p.elongated ? p.size * 0.55 : p.size;
        const ph = p.elongated ? p.size * 1.9  : p.size;
        const pr = p.elongated ? p.size * 0.28 : p.size / 2;

        return (
          <Animated.View
            key={i}
            style={{
              position:        'absolute',
              width:           pw,
              height:          ph,
              borderRadius:    pr,
              backgroundColor: p.color,
              left:            p.baseX * width - pw / 2,
              top:             height - ph,
              opacity:         p.opacity,
              transform: [
                { translateX: p.tx },
                { translateY: p.ty },
                { scale:      p.scale },
                { rotate:     rotateInterp },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({});

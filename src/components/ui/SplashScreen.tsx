import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import { Text } from 'tamagui';
import { Colors } from '../../constants/colors';
import { TrainerProfile } from '../../features/trainer/types/trainer.types';
import { getTrainerTypeColor } from '../../utils/pokemonHelpers';


const AnimatedPokeball: React.FC<{ spinAnim: Animated.Value; scaleAnim: Animated.Value }> = ({
  spinAnim,
  scaleAnim,
}) => {
  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View
      style={[styles.pokeball, { transform: [{ rotate }, { scale: scaleAnim }] }]}
    >
      <View style={styles.pokeballTop} />
      <View style={styles.pokeballBottom} />
      <View style={styles.pokeballDivider} />
      <View style={styles.pokeballBtn} />
      <View style={styles.pokeballBtnInner} />
    </Animated.View>
  );
};

interface GenericSplashProps {
  onFinish: () => void;
}

export const GenericSplash: React.FC<GenericSplashProps> = ({ onFinish }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }),
        Animated.loop(
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          { iterations: 2 }
        ),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onFinish, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Colors.primary }]}>
      <AnimatedPokeball spinAnim={spinAnim} scaleAnim={scaleAnim} />
      <Animated.View
        style={{ opacity: titleOpacity, transform: [{ translateY: titleY }], marginTop: 24 }}
      >
        <Text style={styles.genericTitle}>Pokédex App</Text>
      </Animated.View>
      <Animated.View style={{ opacity: subtitleOpacity }}>
        <Text style={styles.genericSubtitle}>Tu aventura Pokémon comienza aquí</Text>
      </Animated.View>
    </View>
  );
};

interface Props {
  profile: TrainerProfile;
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ profile, onFinish }) => {
  const typeColor = getTrainerTypeColor(profile.favoritePokemonType);

  const bgScale = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const spriteY = useRef(new Animated.Value(80)).current;
  const spriteOpacity = useRef(new Animated.Value(0)).current;
  const spriteScale = useRef(new Animated.Value(0.7)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleX = useRef(new Animated.Value(-30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleX = useRef(new Animated.Value(-20)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(bgScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.spring(spriteY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 55,
          friction: 8,
        }),
        Animated.timing(spriteOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(spriteScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ]),

      Animated.delay(100),

      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(titleX, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),

      Animated.delay(80),

      Animated.parallel([
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(subtitleX, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: typeColor }]}>
      <Animated.View
        style={[
          styles.typeBg,
          {
            backgroundColor: typeColor,
            opacity: bgOpacity,
            transform: [{ scale: bgScale }],
          },
        ]}
      />

      {profile.starterPokemon?.sprite ? (
        <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
      ) : null}

      {profile.starterPokemon?.sprite ? (
        <Animated.View
          style={{
            opacity: spriteOpacity,
            transform: [{ translateY: spriteY }, { scale: spriteScale }],
          }}
        >
          <Image
            source={{ uri: profile.starterPokemon.sprite }}
            style={styles.sprite}
            resizeMode="contain"
            accessibilityLabel={profile.starterPokemon.name}
          />
        </Animated.View>
      ) : (
        <View style={styles.spritePlaceholder} />
      )}

      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateX: titleX }],
          marginTop: 8,
        }}
      >
        <Text style={styles.welcomeText}>¡Bienvenido de vuelta,</Text>
        <Text style={styles.nameText}>{profile.fullName}!</Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: subtitleOpacity,
          transform: [{ translateX: subtitleX }],
          marginTop: 8,
        }}
      >
        <Text style={styles.subtitleText}>Tu aventura Pokémon continúa ✨</Text>
      </Animated.View>
    </View>
  );
};

const POKEBALL_SIZE = 100;
const POKEBALL_BTN = POKEBALL_SIZE * 0.22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    overflow: 'hidden',
  },
  pokeball: {
    width: POKEBALL_SIZE,
    height: POKEBALL_SIZE,
    borderRadius: POKEBALL_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#E3350D',
  },
  pokeballBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pokeballDivider: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    marginTop: -2,
    backgroundColor: '#fff',
  },
  pokeballBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: POKEBALL_BTN,
    height: POKEBALL_BTN,
    borderRadius: POKEBALL_BTN / 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: -POKEBALL_BTN / 2,
    marginLeft: -POKEBALL_BTN / 2,
  },
  pokeballBtnInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: POKEBALL_BTN * 0.38,
    height: POKEBALL_BTN * 0.38,
    borderRadius: (POKEBALL_BTN * 0.38) / 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: -(POKEBALL_BTN * 0.38) / 2,
    marginLeft: -(POKEBALL_BTN * 0.38) / 2,
  },
  genericTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  genericSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  typeBg: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  glowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fff',
  },
  sprite: {
    width: 200,
    height: 200,
  },
  spritePlaceholder: {
    width: 200,
    height: 80,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  nameText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});

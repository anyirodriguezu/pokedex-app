import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { Text } from 'tamagui';
import { Colors } from '../../constants/colors';
import { TrainerProfile } from '../../features/trainer/types/trainer.types';

interface Props {
  profile: TrainerProfile;
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ profile, onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        {profile.starterPokemon?.sprite ? (
          <Image
            source={{ uri: profile.starterPokemon.sprite }}
            style={styles.sprite}
            resizeMode="contain"
            accessibilityLabel={`${profile.starterPokemon.name}`}
          />
        ) : null}
        <Text fontSize={30} fontWeight="800" color="$textLight" style={styles.centered}>
          ¡Bienvenido, {profile.fullName}!
        </Text>
        <Text fontSize={16} color="$textLight" style={[styles.centered, styles.subtitle]}>
          Tu aventura Pokémon continúa
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  sprite: {
    width: 180,
    height: 180,
    marginBottom: 8,
  },
  centered: {
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.85,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Text } from 'tamagui';
import { Colors } from '../../constants/colors';
import { useTrainerStore } from '../../store/trainerStore';

interface Props {
  onFinish: () => void;
}

export const TrainerNameInputScreen: React.FC<Props> = ({ onFinish }) => {
  const { setTrainerName } = useTrainerStore();
  const [name, setName] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
    ]).start(() => {
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setTrainerName(trimmed);
    onFinish();
  };

  const canSubmit = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Pokéball decorativa */}
        <View style={styles.pokeball}>
          <View style={styles.pokeballTop} />
          <View style={styles.pokeballBottom} />
          <View style={styles.pokeballDivider} />
          <View style={styles.pokeballBtn} />
          <View style={styles.pokeballBtnInner} />
        </View>

        <Text style={styles.title}>¿Cómo te llamas,{'\n'}Entrenador?</Text>
        <Text style={styles.subtitle}>Tu nombre te identificará en tu aventura Pokémon</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ej: Ash Ketchum"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            maxLength={40}
          />
        </View>

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Comenzar aventura"
        >
          <Text style={styles.buttonText}>¡Comenzar aventura!</Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const POKEBALL_SIZE = 80;
const POKEBALL_BTN = POKEBALL_SIZE * 0.22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 0,
  },
  pokeball: {
    width: POKEBALL_SIZE,
    height: POKEBALL_SIZE,
    borderRadius: POKEBALL_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    marginBottom: 28,
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
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
  },
  input: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.2,
  },
});

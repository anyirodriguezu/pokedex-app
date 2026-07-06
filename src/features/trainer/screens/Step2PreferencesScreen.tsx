import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { StepIndicator } from '../components/StepIndicator';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { step2Schema, Step2FormValues } from '../schemas/step2Schema';
import { DISTRICTS, POKEMON_TYPES, PokemonType } from '../types/trainer.types';
import { Text, XStack, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Step2Preferences'>;

export const Step2PreferencesScreen: React.FC<Props> = ({ navigation, route }) => {
  const mode = route.params?.mode ?? 'create';
  const isEditPreferences = mode === 'edit-preferences';
  const { setStep2Data, profile, isEditing } = useTrainerStore();
  const [pendingData, setPendingData] = useState<Step2FormValues | null>(null);
  const [showPokemonChoice, setShowPokemonChoice] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Step2FormValues>({
    resolver: yupResolver(step2Schema),
    defaultValues: {
      district: undefined,
      favoritePokemonType: undefined,
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      if (isEditing) {
        reset({
          district: profile?.district ?? undefined,
          favoritePokemonType: profile?.favoritePokemonType ?? undefined,
        });
      } else {
        reset({ district: undefined, favoritePokemonType: undefined });
      }
    }, [isEditing, profile, reset])
  );

  const onSubmit = (data: Step2FormValues) => {
    if (!data.district || !data.favoritePokemonType) return;

    if (isEditPreferences && profile?.starterPokemon) {
      const typeChanged = data.favoritePokemonType !== profile.favoritePokemonType;
      if (typeChanged) {
        setPendingData(data);
        setShowPokemonChoice(true);
        return;
      }
      // Tipo no cambió: guardar y volver a Summary sin tocar el pokémon
      setStep2Data({ district: data.district, favoritePokemonType: data.favoritePokemonType });
      navigation.navigate('Summary', { fromEdit: true });
      return;
    }

    setStep2Data({ district: data.district, favoritePokemonType: data.favoritePokemonType });
    navigation.navigate('StarterPokemon', { mode });
  };

  const handleKeepPokemon = () => {
    if (!pendingData?.district || !pendingData?.favoritePokemonType) return;
    setStep2Data({
      district: pendingData.district,
      favoritePokemonType: pendingData.favoritePokemonType,
    });
    setShowPokemonChoice(false);
    navigation.navigate('Summary', { fromEdit: true });
  };

  const handleNewPokemon = () => {
    if (!pendingData?.district || !pendingData?.favoritePokemonType) return;
    setStep2Data({
      district: pendingData.district,
      favoritePokemonType: pendingData.favoritePokemonType,
    });
    setShowPokemonChoice(false);
    navigation.navigate('StarterPokemon', { mode });
  };

  const onError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const totalSteps = isEditPreferences ? 1 : 3;
  const title = isEditPreferences ? 'Editar Preferencias' : 'Preferencias';
  const subtitle = isEditPreferences
    ? 'Actualiza tu distrito y tipo favorito'
    : '¿Cuáles son tus preferencias?';

  const newTypeName = pendingData?.favoritePokemonType as PokemonType | undefined;
  const starterName = profile?.starterPokemon?.name ?? '';

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$5">
          <StepIndicator currentStep={isEditPreferences ? 1 : 2} totalSteps={totalSteps} />

          <YStack gap="$1">
            <Text fontSize={26} fontWeight="800" color="$appText">
              {title}
            </Text>
            <Text fontSize={15} color="$textSecondary">
              {subtitle}
            </Text>
          </YStack>

          <YStack gap="$2.5">
            <Text fontSize={16} fontWeight="700" color="$appText">
              Distrito
            </Text>
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value } }) => (
                <XStack flexWrap="wrap" gap="$2">
                  {DISTRICTS.map((district) => {
                    const selected = value === district;
                    return (
                      <YStack
                        key={district}
                        px="$4"
                        py="$2.5"
                        rounded={10}
                        borderWidth={1.5}
                        borderColor={selected ? '$primary' : '$appBorder'}
                        bg={selected ? '$primary' : '$surface'}
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => onChange(district)}
                        accessibilityRole="button"
                        accessibilityLabel={'Distrito ' + district}
                        accessibilityState={{ selected }}
                      >
                        <Text
                          fontSize={14}
                          fontWeight="600"
                          color={selected ? '$textLight' : '$appText'}
                        >
                          {district}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
              )}
            />
            {errors.district && (
              <Text fontSize={12} color="$error" accessibilityRole="alert">
                {errors.district.message}
              </Text>
            )}
          </YStack>

          <YStack gap="$2.5">
            <Text fontSize={16} fontWeight="700" color="$appText">
              Tipo Pokémon Favorito
            </Text>
            <Controller
              control={control}
              name="favoritePokemonType"
              render={({ field: { onChange, value } }) => (
                <XStack gap="$2.5">
                  {POKEMON_TYPES.map((type) => {
                    const selected = value === type;
                    return (
                      <YStack
                        key={type}
                        flex={1}
                        items="center"
                        py="$4"
                        rounded={12}
                        gap="$1.5"
                        borderWidth={1.5}
                        borderColor={selected ? '$primary' : '$appBorder'}
                        bg={selected ? '$primarySubtle' : '$surface'}
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => onChange(type)}
                        accessibilityRole="button"
                        accessibilityLabel={'Tipo ' + type}
                        accessibilityState={{ selected }}
                      >
                        <Text fontSize={28}>{TYPE_EMOJI[type]}</Text>
                        <Text
                          fontSize={13}
                          fontWeight="600"
                          color={selected ? '$primary' : '$textSecondary'}
                        >
                          {type}
                        </Text>
                      </YStack>
                    );
                  })}
                </XStack>
              )}
            />
            {errors.favoritePokemonType && (
              <Text fontSize={12} color="$error" accessibilityRole="alert">
                {errors.favoritePokemonType.message}
              </Text>
            )}
          </YStack>

          <XStack gap="$3" mt="$2">
            <YStack flex={1}>
              <Button
                label={isEditPreferences ? 'Cancelar' : 'Atrás'}
                onPress={() => navigation.goBack()}
                variant="outline"
              />
            </YStack>
            <YStack flex={1}>
              <Button
                label={isEditPreferences ? 'Guardar' : 'Confirmar'}
                onPress={handleSubmit(onSubmit, onError)}
              />
            </YStack>
          </XStack>
        </YStack>
      </ScrollView>

      <Modal
        visible={showPokemonChoice}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPokemonChoice(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.choiceCard}>
            <Text style={styles.choiceTitle}>¿Qué hacemos con tu compañero?</Text>
            <Text style={styles.choiceBody}>
              Cambiaste tu tipo favorito a{' '}
              <Text style={styles.choiceHighlight}>
                {newTypeName ? TYPE_EMOJI[newTypeName] : ''} {newTypeName}
              </Text>
              . ¿Quieres mantener a{' '}
              <Text style={styles.choiceHighlight}>{starterName}</Text> o recibir un nuevo
              Pokémon de tu tipo?
            </Text>
            <View style={styles.choiceActions}>
              <Pressable style={styles.btnKeep} onPress={handleKeepPokemon}>
                <Text style={styles.btnKeepText}>Mantener a {starterName}</Text>
              </Pressable>
              <Pressable style={styles.btnNew} onPress={handleNewPokemon}>
                <Text style={styles.btnNewText}>Nuevo Pokémon</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  choiceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 14,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  choiceBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  choiceHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  choiceActions: {
    gap: 10,
    marginTop: 4,
  },
  btnKeep: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnKeepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  btnNew: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnNewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

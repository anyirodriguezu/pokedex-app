import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text as RNText } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { StepIndicator } from '../components/StepIndicator';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { step2Schema, Step2FormValues } from '../schemas/step2Schema';
import { District, PokemonType } from '../types/trainer.types';
import { Text, XStack, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Step2Preferences'>;

const DISTRICTS: District[] = ['Ate', 'Breña', 'Miraflores', 'Kanto', 'Johto'];
const POKEMON_TYPES: PokemonType[] = ['Fuego', 'Agua', 'Planta'];

export const Step2PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const { setStep2Data, profile, isEditing } = useTrainerStore();

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
    setStep2Data({ district: data.district!, favoritePokemonType: data.favoritePokemonType! });
    navigation.navigate('Summary');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <YStack gap="$5">
        <StepIndicator currentStep={2} totalSteps={2} />

        <YStack gap="$1">
          <Text fontSize={26} fontWeight="800" color="$appText">
            Preferencias
          </Text>
          <Text fontSize={15} color="$textSecondary">
            ¿Cuáles son tus preferencias?
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
                    <Pressable
                      key={district}
                      onPress={() => onChange(district)}
                      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
                    >
                      <RNText style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                        {district}
                      </RNText>
                    </Pressable>
                  );
                })}
              </XStack>
            )}
          />
          {errors.district && (
            <Text fontSize={12} color="$error">
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
                    <Pressable
                      key={type}
                      onPress={() => onChange(type)}
                      style={[styles.typeButton, selected ? styles.typeButtonSelected : styles.typeButtonUnselected]}
                    >
                      <RNText style={styles.typeEmoji}>{TYPE_EMOJI[type]}</RNText>
                      <RNText style={[styles.typeText, selected ? styles.typeTextSelected : styles.typeTextUnselected]}>
                        {type}
                      </RNText>
                    </Pressable>
                  );
                })}
              </XStack>
            )}
          />
          {errors.favoritePokemonType && (
            <Text fontSize={12} color="$error">
              {errors.favoritePokemonType.message}
            </Text>
          )}
        </YStack>

        <XStack gap="$3" mt="$2">
          <YStack flex={1}>
            <Button label="Atrás" onPress={() => navigation.goBack()} variant="outline" />
          </YStack>
          <YStack flex={1}>
            <Button label="Confirmar" onPress={handleSubmit(onSubmit)} />
          </YStack>
        </XStack>
      </YStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  chipSelected: {
    borderColor: '#E3350D',
    backgroundColor: '#E3350D',
  },
  chipUnselected: {
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#212121',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  typeButtonSelected: {
    borderColor: '#E3350D',
    backgroundColor: '#FFF0EE',
  },
  typeButtonUnselected: {
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  typeTextSelected: {
    color: '#E3350D',
  },
  typeTextUnselected: {
    color: '#757575',
  },
});

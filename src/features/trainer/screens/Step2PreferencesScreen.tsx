import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { StepIndicator } from '../components/StepIndicator';
import { step2Schema, Step2FormValues } from '../schemas/step2Schema';
import { District, PokemonType } from '../types/trainer.types';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Step2Preferences'>;

const DISTRICTS: District[] = ['Ate', 'Breña', 'Miraflores', 'Kanto', 'Johto'];
const POKEMON_TYPES: PokemonType[] = ['Fuego', 'Agua', 'Planta'];

const typeEmoji: Record<PokemonType, string> = {
  Fuego: '🔥',
  Agua: '💧',
  Planta: '🌿',
};

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
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StepIndicator currentStep={2} totalSteps={2} />

      <Text style={styles.title}>Preferencias</Text>
      <Text style={styles.subtitle}>¿Cuáles son tus preferencias?</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distrito</Text>
        <Controller
          control={control}
          name="district"
          render={({ field: { onChange, value } }) => (
            <View style={styles.optionsGrid}>
              {DISTRICTS.map((district) => (
                <Pressable
                  key={district}
                  onPress={() => onChange(district)}
                  style={[
                    styles.optionButton,
                    value === district && styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === district && styles.optionTextSelected,
                    ]}
                  >
                    {district}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        {errors.district && (
          <Text style={styles.error}>{errors.district.message}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo Pokémon Favorito</Text>
        <Controller
          control={control}
          name="favoritePokemonType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeRow}>
              {POKEMON_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => onChange(type)}
                  style={[
                    styles.typeButton,
                    value === type && styles.typeButtonSelected,
                  ]}
                >
                  <Text style={styles.typeEmoji}>{typeEmoji[type]}</Text>
                  <Text
                    style={[
                      styles.typeText,
                      value === type && styles.typeTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
        {errors.favoritePokemonType && (
          <Text style={styles.error}>{errors.favoritePokemonType.message}</Text>
        )}
      </View>

      <View style={styles.buttons}>
        <Button label="Atrás" onPress={() => navigation.goBack()} variant="outline" />
        <Button label="Confirmar" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.textLight,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  typeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF0EE',
  },
  typeEmoji: {
    fontSize: 28,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeTextSelected: {
    color: Colors.primary,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

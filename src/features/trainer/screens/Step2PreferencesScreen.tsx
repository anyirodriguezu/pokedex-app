import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { StepIndicator } from '../components/StepIndicator';
import { TYPE_EMOJI } from '../constants/typeEmoji';
import { step2Schema, Step2FormValues } from '../schemas/step2Schema';
import { DISTRICTS, POKEMON_TYPES } from '../types/trainer.types';
import { Text, XStack, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Step2Preferences'>;

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
    if (!data.district || !data.favoritePokemonType) return;
    setStep2Data({ district: data.district, favoritePokemonType: data.favoritePokemonType });
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
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
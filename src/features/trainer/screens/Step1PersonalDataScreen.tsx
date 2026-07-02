import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { TrainerStackParamList } from '../../../navigation/types';
import { useTrainerStore } from '../../../store/trainerStore';
import { FormField } from '../components/FormField';
import { StepIndicator } from '../components/StepIndicator';
import { step1Schema, Step1FormValues } from '../schemas/step1Schema';
import { Text, YStack } from 'tamagui';

type Props = NativeStackScreenProps<TrainerStackParamList, 'Step1PersonalData'>;

export const Step1PersonalDataScreen: React.FC<Props> = ({ navigation }) => {
  const { setStep1Data, step1Data, isEditing } = useTrainerStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: yupResolver(step1Schema),
    defaultValues: {
      fullName: '',
      age: '' as unknown as number,
      email: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      if (isEditing) {
        reset({
          fullName: step1Data?.fullName ?? '',
          age: step1Data?.age ?? ('' as unknown as number),
          email: step1Data?.email ?? '',
        });
      } else {
        reset({ fullName: '', age: '' as unknown as number, email: '' });
      }
    }, [isEditing, step1Data, reset])
  );

  const onSubmit = (data: Step1FormValues) => {
    setStep1Data({ fullName: data.fullName, age: data.age, email: data.email });
    navigation.navigate('Step2Preferences');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$4">
          <StepIndicator currentStep={1} totalSteps={2} />

          <YStack gap="$1">
            <Text fontSize={26} fontWeight="800" color="$appText">
              Datos Personales
            </Text>
            <Text fontSize={15} color="$textSecondary">
              Cuéntanos un poco sobre ti
            </Text>
          </YStack>

          <YStack gap="$4">
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Nombre completo"
                  placeholder="Ej: Ash Ketchum"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.fullName?.message}
                  autoCapitalize="words"
                />
              )}
            />

            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Edad"
                  placeholder="Ej: 10"
                  onChangeText={(text) => onChange(text === '' ? '' : Number(text))}
                  onBlur={onBlur}
                  value={value !== undefined && value !== null ? String(value) : ''}
                  error={errors.age?.message}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Correo electrónico"
                  placeholder="Ej: ash@pokemon.com"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </YStack>

          <Button label="Siguiente" onPress={handleSubmit(onSubmit)} />
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});

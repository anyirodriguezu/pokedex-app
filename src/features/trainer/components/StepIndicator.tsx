import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Colors } from '../../../constants/colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <XStack items="center" justify="center" py="$4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const filled = isActive || isCompleted;

        return (
          <React.Fragment key={step}>
            <YStack
              width={36}
              height={36}
              rounded={18}
              borderWidth={2}
              borderColor={filled ? '$primary' : '$appBorder'}
              bg={filled ? '$primary' : '$surface'}
              items="center"
              justify="center"
              accessibilityLabel={
                isCompleted
                  ? 'Paso ' + step + ' completado'
                  : isActive
                  ? 'Paso ' + step + ' actual'
                  : 'Paso ' + step + ' pendiente'
              }
            >
              <Text
                style={[
                  styles.stepLabel,
                  filled ? styles.stepLabelFilled : styles.stepLabelEmpty,
                ]}
              >
                {isCompleted ? '✓' : step}
              </Text>
            </YStack>
            {step < totalSteps && (
              <YStack
                flex={1}
                height={2}
                maxW={60}
                bg={isCompleted ? '$primary' : '$appBorder'}
              />
            )}
          </React.Fragment>
        );
      })}
    </XStack>
  );
};

const styles = StyleSheet.create({
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabelFilled: {
    color: Colors.textLight,
  },
  stepLabelEmpty: {
    color: Colors.textSecondary,
  },
});
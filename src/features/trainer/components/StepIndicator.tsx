import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <View
            style={[
              styles.circle,
              step < currentStep && styles.completed,
              step === currentStep && styles.active,
            ]}
          >
            <Text
              style={[
                styles.circleText,
                (step <= currentStep) && styles.circleTextActive,
              ]}
            >
              {step < currentStep ? '✓' : step}
            </Text>
          </View>
          {step < totalSteps && (
            <View style={[styles.line, step < currentStep && styles.lineCompleted]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 0,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  active: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  completed: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  circleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  circleTextActive: {
    color: Colors.textLight,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    maxWidth: 60,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
});

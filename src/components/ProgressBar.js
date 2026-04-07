/**
 * ProgressBar — shared segmented progress indicator used across all 6 flow screens.
 * Renders 6 pill-shaped segments: filled amber for completed/active steps,
 * dark for future steps.
 * Always placed on its own row immediately below the nav header.
 *
 * @param {{ currentStep: number, totalSteps?: number }} props
 *   currentStep: 1-based index of the active step (1–6)
 *   totalSteps: optional override, defaults to 6
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Dimensions } from '../theme/index';

export default function ProgressBar({ currentStep, totalSteps = 6 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < currentStep ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.progressBarGap,
    height: Dimensions.progressBarHeight,
    width: '100%',
  },
  segment: {
    flex: 1,
    borderRadius: BorderRadius.full,
    height: Dimensions.progressBarHeight,
  },
  active: {
    backgroundColor: Colors.primaryContainer,
  },
  inactive: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBlock } from './SkeletonBlock';

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBlock width={72} height={72} borderRadius={36} />
    <SkeletonBlock width={80} height={14} borderRadius={7} />
    <SkeletonBlock width={50} height={12} borderRadius={6} />
  </View>
);

export const PokemonListSkeleton: React.FC = () => (
  <View style={styles.grid}>
    {Array.from({ length: 10 }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
  },
  card: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
});

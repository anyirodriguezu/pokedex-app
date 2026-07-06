import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { SkeletonBlock } from './SkeletonBlock';

export const PokemonDetailSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <SkeletonBlock width={60} height={16} borderRadius={8} />
      <SkeletonBlock width={180} height={32} borderRadius={10} />
      <SkeletonBlock width={80} height={28} borderRadius={14} />
    </View>

    <View style={styles.imageCard}>
      <SkeletonBlock width={220} height={220} borderRadius={16} />
    </View>

    <SkeletonBlock width="100%" height={44} borderRadius={10} />

    <View style={styles.infoCard}>
      <SkeletonBlock width={70} height={40} borderRadius={8} />
      <View style={styles.divider} />
      <SkeletonBlock width={70} height={40} borderRadius={8} />
    </View>

    <View style={styles.statsCard}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.statRow}>
          <SkeletonBlock width={80} height={13} borderRadius={6} />
          <SkeletonBlock width={`${35 + i * 8}%`} height={13} borderRadius={6} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  imageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});

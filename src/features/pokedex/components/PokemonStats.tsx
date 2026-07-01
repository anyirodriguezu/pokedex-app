import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';
import { formatStatName } from '../../../utils/pokemonHelpers';
import { PokemonStat } from '../types/pokemon.types';

interface PokemonStatsProps {
  stats: PokemonStat[];
}

export const PokemonStats: React.FC<PokemonStatsProps> = ({ stats }) => {
  const maxStat = 255;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas Base</Text>
      {stats.map((stat) => {
        const percentage = (stat.base_stat / maxStat) * 100;
        return (
          <View key={stat.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{formatStatName(stat.stat.name)}</Text>
            <Text style={styles.statValue}>{stat.base_stat}</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: `${percentage}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statName: {
    width: 80,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    width: 36,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'right',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
});

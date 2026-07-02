import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, XStack } from 'tamagui';
import { formatStatName } from '../../../utils/pokemonHelpers';
import { PokemonStat } from '../types/pokemon.types';

interface PokemonStatsProps {
  stats: PokemonStat[];
}

const MAX_STAT = 255;

export const PokemonStats: React.FC<PokemonStatsProps> = ({ stats }) => {
  return (
    <Card bg="$surface" rounded={16} p="$4" gap="$2.5">
      <Text fontSize={18} fontWeight="700" color="$appText" mb="$1">
        Estadísticas Base
      </Text>
      {stats.map((stat) => {
        const percentage = (stat.base_stat / MAX_STAT) * 100;
        return (
          <XStack key={stat.stat.name} items="center" gap="$2">
            <Text width={80} fontSize={13} color="$textSecondary" fontWeight="500">
              {formatStatName(stat.stat.name)}
            </Text>
            <Text width={36} fontSize={13} fontWeight="700" color="$appText" style={{ textAlign: 'right' }}>
              {stat.base_stat}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${percentage}%` }]} />
            </View>
          </XStack>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#E3350D',
    borderRadius: 4,
  },
});

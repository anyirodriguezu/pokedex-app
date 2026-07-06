import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import { Colors } from '../../../constants/colors';
import { formatStatName } from '../../../utils/pokemonHelpers';
import { PokemonStat } from '../types/pokemon.types';

interface PokemonStatsProps {
  stats: PokemonStat[];
}

const MAX_STAT = 255;

const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FA92B2',
};

export const PokemonStats: React.FC<PokemonStatsProps> = ({ stats }) => {
  const animatedValues = useRef(stats.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = stats.map((stat, index) => {
      const percentage = (stat.base_stat / MAX_STAT) * 100;
      return Animated.timing(animatedValues[index], {
        toValue: percentage,
        duration: 700,
        useNativeDriver: false,
      });
    });
    Animated.stagger(80, animations).start();
  }, [stats, animatedValues]);

  return (
    <Card bg="$surface" rounded={16} p="$4" gap="$2.5">
      <XStack items="center" gap="$2">
        <View style={styles.sectionBar} />
        <Text fontSize={16} fontWeight="700" color="$appText" letterSpacing={0.3}>
          Estadísticas base
        </Text>
      </XStack>
      {stats.map((stat, index) => {
        const barColor = STAT_COLORS[stat.stat.name] ?? Colors.primary;
        const animatedWidth = animatedValues[index].interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%'],
        });

        return (
          <XStack
            key={stat.stat.name}
            items="center"
            gap="$2"
            accessibilityLabel={formatStatName(stat.stat.name) + ': ' + stat.base_stat}
          >
            <Text width={80} fontSize={13} color="$textSecondary" fontWeight="500">
              {formatStatName(stat.stat.name)}
            </Text>
            <Text
              width={36}
              fontSize={13}
              fontWeight="700"
              color="$appText"
              style={{ textAlign: 'right' }}
            >
              {stat.base_stat}
            </Text>
            <View style={styles.barTrack} accessibilityRole="progressbar">
              <Animated.View
                style={[styles.barFill, { width: animatedWidth, backgroundColor: barColor }]}
              />
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
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionBar: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.primary },
});

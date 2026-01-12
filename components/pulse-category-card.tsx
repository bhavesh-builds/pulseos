import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type PulseCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: {
    light: string;
    dark: string;
  };
  count?: number;
};

type PulseCategoryCardProps = {
  category: PulseCategory;
  onPress?: () => void;
};

export function PulseCategoryCard({ category, onPress }: PulseCategoryCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = isDark ? category.color.dark : category.color.light;
  const iconColor = isDark ? '#fff' : '#fff';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}>
      <ThemedView style={styles.cardContent}>
        <ThemedView style={styles.iconContainer}>
          <Ionicons name={category.icon} size={32} color={iconColor} />
        </ThemedView>
        <ThemedText style={[styles.categoryName, { color: iconColor }]} type="defaultSemiBold">
          {category.name}
        </ThemedText>
        {category.count !== undefined && (
          <ThemedView style={styles.badge}>
            <ThemedText style={[styles.badgeText, { color: backgroundColor }]}>
              {category.count}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

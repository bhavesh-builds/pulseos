import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PulseUpdate = {
  app: string;
  message: string;
  time: string;
};

type PulseCategory = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  gradient: { from: string; to: string };
  updates: PulseUpdate[];
};

const PULSE_CATEGORIES: PulseCategory[] = [
  {
    id: 'social',
    name: 'Social',
    icon: 'people',
    count: 12,
    gradient: { from: '#3B82F6', to: '#22D3EE' }, // blue-500 to cyan-400
    updates: [
      { app: 'Instagram', message: 'Alex liked your photo', time: '2m ago' },
      { app: 'Twitter', message: '3 new mentions', time: '15m ago' },
      { app: 'WhatsApp', message: '5 unread messages', time: '1h ago' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'card',
    count: 3,
    gradient: { from: '#10B981', to: '#2DD4BF' }, // emerald-500 to teal-400
    updates: [
      { app: 'Bank', message: 'Payment of $120 received', time: '30m ago' },
      { app: 'Coinbase', message: 'BTC up 5% today', time: '2h ago' },
      { app: 'PayPal', message: 'New invoice from Acme Corp', time: '3h ago' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    icon: 'briefcase',
    count: 8,
    gradient: { from: '#F97316', to: '#FBBF24' }, // orange-500 to amber-400
    updates: [
      { app: 'Slack', message: '2 new messages in #general', time: '10m ago' },
      { app: 'Gmail', message: 'Meeting invite from Sarah', time: '45m ago' },
      { app: 'Asana', message: '3 tasks due today', time: '1h ago' },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'person',
    count: 5,
    gradient: { from: '#EC4899', to: '#FB7185' }, // pink-500 to rose-400
    updates: [
      { app: 'Calendar', message: 'Dentist appointment at 3pm', time: '20m ago' },
      { app: 'Reminders', message: 'Buy groceries', time: '2h ago' },
      { app: 'Weather', message: 'Rain expected tomorrow', time: '3h ago' },
    ],
  },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const totalNotifications = PULSE_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);
  const selectedCategoryData = PULSE_CATEGORIES.find((cat) => cat.id === selectedCategory);

  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const cardBackground = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const mutedTextColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>PulseOS</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Your unified updates</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color={mutedTextColor} />
              {totalNotifications > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: isDark ? '#3B82F6' : '#2563EB' }]}>
                  <ThemedText style={styles.notificationBadgeText}>
                    {totalNotifications > 9 ? '9+' : totalNotifications.toString()}
                  </ThemedText>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={20} color={mutedTextColor} />
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {!selectedCategory ? (
          <View style={styles.categoriesView}>
            <View style={styles.categoriesHeader}>
              <ThemedText style={styles.sectionTitle}>Pulse Categories</ThemedText>
              <View style={[styles.badge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <ThemedText style={styles.badgeText}>{totalNotifications} updates</ThemedText>
              </View>
            </View>

            <View style={styles.grid}>
              {PULSE_CATEGORIES.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    if (category.id === 'social') {
                      router.push('/social');
                    } else {
                      setSelectedCategory(category.id);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <View style={[styles.iconContainer, { backgroundColor: category.gradient.from }]}>
                    <Ionicons name={category.icon} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                    <ThemedText style={[styles.categoryCount, { color: mutedTextColor }]}>
                      {category.count} {category.count === 1 ? 'update' : 'updates'}
                    </ThemedText>
                  </View>
                  {category.count > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: category.gradient.from }]}>
                      <ThemedText style={styles.countBadgeText}>{category.count}</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Quick Stats */}
            <View style={[styles.statsCard, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor }]}>
              <View style={styles.statsItem}>
                <ThemedText style={styles.statsLabel}>Total Updates</ThemedText>
                <ThemedText style={styles.statsValue}>{totalNotifications}</ThemedText>
              </View>
              <View style={styles.statsItem}>
                <ThemedText style={styles.statsLabel}>Categories</ThemedText>
                <ThemedText style={styles.statsValue}>{PULSE_CATEGORIES.length}</ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.detailView}>
            {/* Back Button */}
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="chevron-back" size={20} color={mutedTextColor} />
              <ThemedText style={[styles.backButtonText, { color: mutedTextColor }]}>
                Back to categories
              </ThemedText>
            </Pressable>

            {/* Category Detail */}
            {selectedCategoryData && (
              <View style={styles.categoryDetail}>
                <View style={styles.categoryDetailHeader}>
                  <View style={[styles.detailIconContainer, { backgroundColor: selectedCategoryData.gradient.from }]}>
                    <Ionicons name={selectedCategoryData.icon} size={32} color="#FFFFFF" />
                  </View>
                  <View>
                    <ThemedText style={styles.detailCategoryName}>{selectedCategoryData.name}</ThemedText>
                    <ThemedText style={[styles.detailCategoryCount, { color: mutedTextColor }]}>
                      {selectedCategoryData.count} {selectedCategoryData.count === 1 ? 'update' : 'updates'}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.updatesList}>
                  {selectedCategoryData.updates.map((update, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.updateCard,
                        {
                          backgroundColor: cardBackground,
                          borderColor,
                        },
                      ]}>
                      <View style={styles.updateContent}>
                        <ThemedText style={styles.updateApp}>{update.app}</ThemedText>
                        <ThemedText style={[styles.updateMessage, { color: mutedTextColor }]}>
                          {update.message}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.updateTime, { color: mutedTextColor }]}>{update.time}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoriesView: {
    gap: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    position: 'relative',
    minHeight: 140,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    marginTop: 8,
  },
  statsItem: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailView: {
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDetail: {
    gap: 16,
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCategoryName: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailCategoryCount: {
    fontSize: 14,
    marginTop: 2,
  },
  updatesList: {
    gap: 8,
  },
  updateCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  updateContent: {
    flex: 1,
    marginRight: 12,
  },
  updateApp: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  updateMessage: {
    fontSize: 14,
  },
  updateTime: {
    fontSize: 12,
    marginTop: 2,
  },
});

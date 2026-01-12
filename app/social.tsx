import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Complete the web browser authentication session
WebBrowser.maybeCompleteAuthSession();

type SocialAccount = {
  id: string;
  name: string;
  type: 'facebook' | 'instagram';
  accessToken: string | null;
  isConnected: boolean;
};

type SocialUpdate = {
  id: string;
  account: string;
  accountType: 'facebook' | 'instagram';
  message: string;
  time: string;
  link?: string;
};

/**
 * META API CONFIGURATION
 * 
 * To set up Facebook and Instagram integration:
 * 1. Go to https://developers.facebook.com/
 * 2. Create a new app or use an existing one
 * 3. Add "Facebook Login" product and get your App ID
 * 4. Add "Instagram Basic Display" product and get your Instagram App ID
 * 5. Configure OAuth Redirect URIs in both products:
 *    - pulseos://social-auth
 *    - exp://YOUR_IP:8081/--/social-auth
 * 6. Replace the values below with your actual credentials
 * 
 * For detailed instructions, see: META_API_SETUP.md
 */
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID'; // Get from Facebook Developer Console > Settings > Basic
const INSTAGRAM_CLIENT_ID = 'YOUR_INSTAGRAM_CLIENT_ID'; // Get from Instagram Basic Display > App ID

const FACEBOOK_DISCOVERY = {
  authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
  revocationEndpoint: 'https://graph.facebook.com/v18.0/me/permissions',
};

const INSTAGRAM_DISCOVERY = {
  authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
  tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
};

export default function SocialScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { id: 'fb1', name: 'Facebook', type: 'facebook', accessToken: null, isConnected: false },
    { id: 'ig1', name: 'Instagram', type: 'instagram', accessToken: null, isConnected: false },
  ]);
  const [updates, setUpdates] = useState<SocialUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const cardBackground = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#E5E7EB';
  const mutedTextColor = isDark ? '#9CA3AF' : '#6B7280';

  // Set up redirect URI for auth
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'pulseos',
    path: 'social-auth',
  });

  const connectFacebook = async () => {
    try {
      setLoading(true);
      
      if (FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID') {
        Alert.alert(
          'Configuration Required',
          'Please set up your Facebook App ID in app/social.tsx. Visit https://developers.facebook.com/ to create an app.'
        );
        setLoading(false);
        return;
      }

      const request = new AuthSession.AuthRequest({
        clientId: FACEBOOK_APP_ID,
        scopes: ['public_profile', 'email', 'user_posts'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: {},
      });

      const result = await request.promptAsync(FACEBOOK_DISCOVERY, {
        showInRecents: true,
      });

      if (result.type === 'success' && result.params.access_token) {
        const token = result.params.access_token;
        
        // Fetch user info
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?access_token=${token}&fields=id,name,email`
        );
        const userInfo = await userInfoResponse.json();

        // Update account state
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.type === 'facebook'
              ? { ...acc, accessToken: token, isConnected: true, name: userInfo.name || 'Facebook' }
              : acc
          )
        );

        // Fetch updates
        await fetchFacebookUpdates(token);
      }
    } catch (error) {
      console.error('Facebook connection error:', error);
      Alert.alert('Error', 'Failed to connect Facebook account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    try {
      setLoading(true);
      
      if (INSTAGRAM_CLIENT_ID === 'YOUR_INSTAGRAM_CLIENT_ID') {
        Alert.alert(
          'Configuration Required',
          'Please set up your Instagram Client ID in app/social.tsx. Visit https://developers.facebook.com/ to create an app with Instagram Basic Display.'
        );
        setLoading(false);
        return;
      }

      const request = new AuthSession.AuthRequest({
        clientId: INSTAGRAM_CLIENT_ID,
        scopes: ['user_profile', 'user_media'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync(INSTAGRAM_DISCOVERY, {
        showInRecents: true,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for token (this should ideally be done on your backend)
        Alert.alert(
          'Note',
          'Instagram token exchange requires a backend server. Please implement the token exchange on your server.'
        );
      }
    } catch (error) {
      console.error('Instagram connection error:', error);
      Alert.alert('Error', 'Failed to connect Instagram account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacebookUpdates = async (token: string) => {
    try {
      setRefreshing(true);
      
      // Fetch user's posts
      const postsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/posts?access_token=${token}&fields=message,created_time,permalink_url&limit=10`
      );
      const postsData = await postsResponse.json();

      // Fetch notifications (requires additional permissions)
      const notificationsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/notifications?access_token=${token}&limit=10`
      );
      const notificationsData = await notificationsResponse.json().catch(() => ({ data: [] }));

      // Transform posts into updates
      const newUpdates: SocialUpdate[] = (postsData.data || []).map((post: any) => ({
        id: post.id,
        account: 'Facebook',
        accountType: 'facebook',
        message: post.message || 'Shared a post',
        time: formatTime(post.created_time),
        link: post.permalink_url,
      }));

      setUpdates((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        const uniqueUpdates = newUpdates.filter((u) => !existingIds.has(u.id));
        return [...uniqueUpdates, ...prev].slice(0, 50); // Keep last 50 updates
      });
    } catch (error) {
      console.error('Error fetching Facebook updates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const disconnectAccount = (accountId: string) => {
    Alert.alert(
      'Disconnect Account',
      'Are you sure you want to disconnect this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setAccounts((prev) =>
              prev.map((acc) =>
                acc.id === accountId ? { ...acc, accessToken: null, isConnected: false } : acc
              )
            );
            setUpdates((prev) => prev.filter((u) => u.id !== accountId));
          },
        },
      ]
    );
  };

  const refreshUpdates = async () => {
    const connectedAccounts = accounts.filter((acc) => acc.isConnected && acc.accessToken);
    for (const account of connectedAccounts) {
      if (account.type === 'facebook' && account.accessToken) {
        await fetchFacebookUpdates(account.accessToken);
      }
    }
  };

  useEffect(() => {
    // Auto-refresh updates when accounts are connected
    const connectedAccounts = accounts.filter((acc) => acc.isConnected && acc.accessToken);
    const fetchUpdates = async () => {
      for (const account of connectedAccounts) {
        if (account.type === 'facebook' && account.accessToken) {
          await fetchFacebookUpdates(account.accessToken);
        }
      }
    };
    if (connectedAccounts.length > 0) {
      fetchUpdates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>Social Updates</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Connect your accounts</ThemedText>
          </View>
          <Pressable onPress={refreshUpdates} style={styles.refreshButton} disabled={refreshing}>
            <Ionicons name="refresh" size={20} color={mutedTextColor} />
          </Pressable>
        </View>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Account Connection Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Connected Accounts</ThemedText>
          {accounts.map((account) => (
            <View
              key={account.id}
              style={[
                styles.accountCard,
                {
                  backgroundColor: cardBackground,
                  borderColor,
                },
              ]}>
              <View style={styles.accountInfo}>
                <View style={[styles.accountIcon, { backgroundColor: account.type === 'facebook' ? '#1877F2' : '#E4405F' }]}>
                  <Ionicons
                    name={account.type === 'facebook' ? 'logo-facebook' : 'logo-instagram'}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.accountDetails}>
                  <ThemedText style={styles.accountName}>{account.name}</ThemedText>
                  <ThemedText style={[styles.accountStatus, { color: account.isConnected ? '#10B981' : mutedTextColor }]}>
                    {account.isConnected ? 'Connected' : 'Not connected'}
                  </ThemedText>
                </View>
              </View>
              {account.isConnected ? (
                <Pressable
                  onPress={() => disconnectAccount(account.id)}
                  style={[styles.actionButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <ThemedText style={styles.actionButtonText}>Disconnect</ThemedText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={account.type === 'facebook' ? connectFacebook : connectInstagram}
                  style={[styles.actionButton, { backgroundColor: account.type === 'facebook' ? '#1877F2' : '#E4405F' }]}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Connect</ThemedText>
                  )}
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Updates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Updates</ThemedText>
            {refreshing && <ActivityIndicator size="small" color={mutedTextColor} style={styles.refreshIndicator} />}
          </View>
          {updates.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBackground, borderColor }]}>
              <Ionicons name="notifications-outline" size={48} color={mutedTextColor} />
              <ThemedText style={[styles.emptyStateText, { color: mutedTextColor }]}>
                No updates yet. Connect your accounts to see updates here.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.updatesList}>
              {updates.map((update) => (
                <View
                  key={update.id}
                  style={[
                    styles.updateCard,
                    {
                      backgroundColor: cardBackground,
                      borderColor,
                    },
                  ]}>
                  <View style={styles.updateHeader}>
                    <View
                      style={[
                        styles.updateAccountBadge,
                        {
                          backgroundColor: update.accountType === 'facebook' ? '#1877F2' : '#E4405F',
                        },
                      ]}>
                      <Ionicons
                        name={update.accountType === 'facebook' ? 'logo-facebook' : 'logo-instagram'}
                        size={12}
                        color="#FFFFFF"
                      />
                      <ThemedText style={styles.updateAccountText}>{update.account}</ThemedText>
                    </View>
                    <ThemedText style={[styles.updateTime, { color: mutedTextColor }]}>{update.time}</ThemedText>
                  </View>
                  <ThemedText style={styles.updateMessage}>{update.message}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
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
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  refreshIndicator: {
    marginLeft: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountStatus: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  updatesList: {
    gap: 12,
  },
  updateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  updateAccountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  updateTime: {
    fontSize: 12,
  },
  updateMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    padding: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});

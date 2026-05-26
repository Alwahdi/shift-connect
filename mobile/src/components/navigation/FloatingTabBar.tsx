import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/src/constants/theme';

type Route = {
  key: string;
  name: string;
};

/** Height of the floating tab bar in pixels. Screens inside tab navigators should add at least this as paddingBottom. */
export const FLOATING_TAB_BAR_HEIGHT = 72;

/** Safe padding bottom for screens inside a tab navigator with the floating bar on modern iPhones. */
export const FLOATING_TAB_BOTTOM_INSET = 128;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 8) + 8;

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route: Route, index: number) => {
          const { options } = descriptors[route.key];
          // Skip hidden tabs (href: null in expo-router)
          if ((options as Record<string, unknown>).href === null) return null;
          const isFocused = state.index === index;
          const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
          const label = typeof rawLabel === 'string' ? rawLabel : route.name;
          const badge = options.tabBarBadge;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, (route as { params?: Record<string, unknown> }).params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              focused={isFocused}
              label={label}
              icon={options.tabBarIcon}
              badge={badge}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

type TabItemProps = {
  focused: boolean;
  label: string;
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  badge?: number | string;
  onPress: () => void;
  onLongPress: () => void;
};

function shouldShowBadge(badge: number | string | undefined): boolean {
  if (badge == null) return false;
  if (typeof badge === 'number') return badge > 0;
  return badge.length > 0;
}

function formatBadge(badge: number | string): string {
  if (typeof badge === 'number' && badge > 99) return '99+';
  return String(badge);
}

function TabItem({ focused, label, icon, badge, onPress, onLongPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.84, { damping: 10, stiffness: 420 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 300 });
    });
    onPress();
  };

  const iconColor = focused ? theme.colors.primary : theme.colors.muted;
  const hasBadge = shouldShowBadge(badge);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Animated.View style={[styles.tabContent, animStyle]}>
        {focused ? <View style={styles.activeHighlight} /> : null}
        <View style={styles.iconWrap}>
          {icon?.({ focused, color: iconColor, size: 23 })}
          {hasBadge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatBadge(badge!)}</Text>
            </View>
          ) : null}
        </View>
        <Text
          style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    height: FLOATING_TAB_BAR_HEIGHT,
    backgroundColor: theme.colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 4,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1A0D1E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    minWidth: 54,
    position: 'relative',
  },
  activeHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(102, 60, 109, 0.10)',
    borderRadius: 18,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  labelInactive: {
    color: theme.colors.muted,
    fontWeight: '500',
  },
});

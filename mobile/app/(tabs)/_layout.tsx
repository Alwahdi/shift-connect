import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { View, useColorScheme } from 'react-native';
import { getPalette, radius } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
      <Ionicons name={name} size={22} color={color} />
      {focused ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 4 }} /> : <View style={{ height: 10 }} />}
    </View>
  );
}

export default function TabLayout() {
  const palette = getPalette(useColorScheme());
  const { role, isUnsupportedRole } = useAuth();

  if (isUnsupportedRole) {
    return <Redirect href="/unsupported" />;
  }

  if (!role) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="shifts" options={{ title: role === 'clinic' ? 'Coverage' : 'Shifts', tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color, focused }) => <TabIcon name="chatbubble-ellipses" color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <TabIcon name="person-circle" color={color} focused={focused} /> }} />
    </Tabs>
  );
}

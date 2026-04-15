import { StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { SectionHeader } from '@/src/components/SectionHeader';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { conversations } from '@/src/constants/mock-data';
import { getPalette, radius, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/providers/AuthProvider';

export default function MessagesScreen() {
  const palette = getPalette(useColorScheme());
  const { role: authRole } = useAuth();
  const role = authRole ?? 'professional';

  return (
    <Screen>
      <SectionHeader title="Focused communication" subtitle="Conversation previews keep mobile messaging fast, tidy, and easy to scan." />
      <TextInput placeholder="Search conversations" placeholderTextColor={palette.textMuted} style={[styles.search, { color: palette.text, backgroundColor: palette.surface, borderColor: palette.border }]} />
      <View style={styles.stack}>
        {conversations[role].map((item) => (
          <SurfaceCard key={`${item.name}-${item.time}`}>
            <View style={styles.topRow}>
              <View style={styles.copy}>
                <Text style={[styles.name, { color: palette.text }]}>{item.name}</Text>
                <Text style={[styles.roleLabel, { color: palette.secondaryDeep }]}>{item.role}</Text>
              </View>
              <View style={styles.metaWrap}>
                <Text style={[styles.time, { color: palette.textMuted }]}>{item.time}</Text>
                {item.unread > 0 ? <View style={[styles.unread, { backgroundColor: palette.primary }]}><Text style={styles.unreadText}>{item.unread}</Text></View> : null}
              </View>
            </View>
            <Text style={[styles.highlight, { color: palette.text }]}>{item.highlight}</Text>
            <Text style={[styles.message, { color: palette.textMuted }]}>{item.lastMessage}</Text>
          </SurfaceCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: typography.body },
  stack: { gap: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  copy: { flex: 1, gap: 4 },
  name: { fontSize: typography.body, fontWeight: '700' },
  roleLabel: { fontSize: typography.small, fontWeight: '700' },
  metaWrap: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: typography.small },
  unread: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#FFFFFF', fontSize: typography.small, fontWeight: '800' },
  highlight: { fontSize: typography.small, fontWeight: '700' },
  message: { fontSize: typography.body, lineHeight: 22 },
});

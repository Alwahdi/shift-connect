/**
 * Language settings screen.
 *
 * Radio selection for English and Arabic with RTL note.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { themeColors } = useTheme();

  const currentLanguage = i18n.language ?? "en";

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.heading, { color: themeColors.foreground }]}
          accessibilityRole="header"
        >
          {t("settings.language")}
        </Text>

        <View
          style={[styles.section, { backgroundColor: themeColors.card }]}
        >
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLanguage.startsWith(lang.code);
            const isLast = index === LANGUAGES.length - 1;

            return (
              <Pressable
                key={lang.code}
                style={[
                  styles.row,
                  !isLast && { borderBottomColor: themeColors.border },
                  !isLast && styles.rowBorder,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${lang.label} (${lang.nativeLabel})`}
              >
                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.rowLabel,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {lang.label}
                  </Text>
                  <Text
                    style={[
                      styles.rowNative,
                      { color: themeColors.mutedForeground },
                    ]}
                  >
                    {lang.nativeLabel}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    { borderColor: isSelected ? colors.primary : themeColors.border },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {currentLanguage.startsWith("ar") && (
          <View
            style={[
              styles.rtlNote,
              { backgroundColor: colors.warning + "15" },
            ]}
          >
            <Text style={styles.rtlNoteEmoji}>⚠️</Text>
            <Text style={[styles.rtlNoteText, { color: colors.warning }]}>
              Right-to-left layout changes may require an app restart to take
              full effect.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  heading: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: TOUCH_TARGET_SIZE,
    gap: spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  rowNative: {
    fontSize: typography.fontSize.sm,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rtlNote: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  rtlNoteEmoji: {
    fontSize: 16,
  },
  rtlNoteText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});

/**
 * Admin document verification screen.
 *
 * Queue of pending documents with approve/reject actions.
 */
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

interface DocumentItem {
  id: string;
  document_type: string;
  file_url: string;
  status: string;
  user_id: string;
  user_name?: string;
  created_at: string;
}

export default function AdminDocumentsScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: documents, refetch, isRefetching } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as DocumentItem[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      const { error } = await supabase
        .from("documents")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
    },
  });

  const handleAction = (id: string, action: "approved" | "rejected") => {
    const title = action === "approved" ? t("admin.approve") : t("admin.reject");
    Alert.alert(title, `Are you sure you want to ${action === "approved" ? "approve" : "reject"} this document?`, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: title,
        style: action === "rejected" ? "destructive" : "default",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          updateStatus.mutate({ id, status: action });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.docCard, { backgroundColor: themeColors.card }]}>
            <View style={styles.docInfo}>
              <Text style={[styles.docType, { color: themeColors.foreground }]}>
                📄 {item.document_type}
              </Text>
              <Text style={[styles.docMeta, { color: themeColors.mutedForeground }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.success + "15" }]}
                onPress={() => handleAction(item.id, "approved")}
                accessibilityRole="button"
                accessibilityLabel={t("admin.approve")}
              >
                <Text style={[styles.actionText, { color: colors.success }]}>
                  {t("admin.approve")}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.destructive + "15" }]}
                onPress={() => handleAction(item.id, "rejected")}
                accessibilityRole="button"
                accessibilityLabel={t("admin.reject")}
              >
                <Text style={[styles.actionText, { color: colors.destructive }]}>
                  {t("admin.reject")}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
              All documents have been reviewed
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    flexGrow: 1,
  },
  docCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  docInfo: {
    gap: spacing.xs,
  },
  docType: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  docMeta: {
    fontSize: typography.fontSize.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing["3xl"],
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
  },
});

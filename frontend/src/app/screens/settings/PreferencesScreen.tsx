import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeMode, useThemeStore } from "@/src/store/theme-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: "Light", value: "light", icon: "weather-sunny" },
  { label: "System", value: "system", icon: "theme-light-dark" },
  { label: "Dark", value: "dark", icon: "weather-night" },
];

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { mode, setMode } = useThemeStore();

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Preferences" });
  }, [navigation]);

  const s = styles(colors);

  return (
    <SafeAreaView style={s.screen}>
      <Text style={s.pageTitle}>Preferences</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Appearance</Text>

        {OPTIONS.map(({ label, value, icon }, index) => {
          const active = mode === value;
          return (
            <Pressable
              key={value}
              style={({ pressed }) => [
                s.row,
                index === 0 && s.firstRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setMode(value)}
            >
              <View style={[s.iconCircle, active && s.iconCircleActive]}>
                <MaterialCommunityIcons
                  name={icon as any}
                  size={20}
                  color={active ? "#fff" : colors.textSecondary}
                />
              </View>
              <Text style={[s.rowLabel, active && s.rowLabelActive]}>
                {label}
              </Text>
              {active && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={22}
                  color="#6C63FF"
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = (colors: ReturnType<typeof useAppTheme>["colors"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 20,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 28,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingBottom: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 14,
      marginBottom: 8,
    },
    firstRow: {
      borderTopWidth: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    iconCircleActive: {
      backgroundColor: "#6C63FF",
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    rowLabelActive: {
      color: "#6C63FF",
    },
  });

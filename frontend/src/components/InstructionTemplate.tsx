import { Button } from "@react-navigation/elements";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from 'expo-router';

interface JourneyParams {
  titles: string[];
  descriptions: string[];
  pathIDs: string[];
}

interface InstructionProps {
  instruction: string;
  title?: string;
  subtitle?: string;
  emoji?: string;
  tools?: string[];
  diagramImage?: string; // url
  diagramTitle?: string;
  legendItems?: Array<{ color: string; label: string }>;
  formulas?: string[];
  journeyParams?: JourneyParams;
}

export default function Instruction({
  instruction,
  title = "STEM Activity",
  subtitle = "Science & Engineering",
  emoji = "🔬",
  tools,
  diagramImage,
  diagramTitle = "Diagram",
  legendItems,
  formulas,
  journeyParams,
}: InstructionProps) {
  
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>STEM LAB</Text>
        </View>
        <Text style={styles.headerEmoji}>{emoji}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </View>

      {/* ── Tools ── */}
      <SectionCard accent="#4C9BE8" icon="🧰" title="Tools Required">
        <View>
          {tools && tools.length > 0 ? (
            tools.map((tool, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listItemText}>{tool}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>No tools required</Text>
          )}
        </View>
      </SectionCard>

      {/* ── Diagram ── */}
      {diagramImage && (
        <SectionCard accent="#7C5CBF" icon="📐" title={diagramTitle}>
          <View style={styles.diagramWrapper}>
            <Image
              source={{ uri: diagramImage }}
              style={styles.diagram}
              resizeMode="contain"
              accessibilityLabel={diagramTitle}
            />
            {legendItems && legendItems.length > 0 && (
              <View style={styles.legendRow}>
                {legendItems.map((item, index) => (
                  <LegendBadge key={index} color={item.color} label={item.label} />
                ))}
              </View>
            )}
          </View>
        </SectionCard>
      )}

      {/* ── Formula ── */}
      <SectionCard accent="#E87C4C" icon="🔢" title="Key Formulas">
        <View style={styles.formulaBox}>
          {formulas && formulas.length > 0 ? (
            formulas.map((formula, index) => (
              <Text key={index} style={styles.formulaItem}>
                {formula}
              </Text>
            ))
          ) : (
            <Text style={styles.bodyText}>No formulas available</Text>
          )}
        </View>
      </SectionCard>

      {/* ── Instructions ── */}
      <SectionCard accent="#4CBF7C" icon="📋" title="Instructions">
        <Text style={styles.bodyText}>{instruction}</Text>
      </SectionCard>

      <Button
        onPress={() => {
          if (!journeyParams) return;
          router.push({
            pathname: '/JourneyComponent',
            params: {
              journeyData: JSON.stringify({
                titles:       journeyParams.titles,
                descriptions: journeyParams.descriptions,
                pathIDs:      journeyParams.pathIDs,
              }),
            },
          });
        }}
      >
        Start Experiment
      </Button>

      {/* ── Safety Note ──
      <View style={styles.safetyBanner}>
        <Text style={styles.safetyIcon}>⚠️</Text>
        <Text style={styles.safetyText}>
          Always conduct this experiment under teacher supervision in a safe
          open area.
        </Text>
      </View> */}
    </ScrollView>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function SectionCard({
  accent,
  icon,
  title,
  children,
}: {
  accent: string;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
      <View style={styles.sectionInner}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconCircle, { backgroundColor: accent + "22" }]}>
            <Text style={styles.sectionIcon}>{icon}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    </View>
  );
}

function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={[
        styles.legendBadge,
        { backgroundColor: color + "18", borderColor: color },
      ]}
    >
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },

  // ── Header
  header: {
    alignItems: "center",
    backgroundColor: "#1A2F5A",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerBadge: {
    backgroundColor: "#4C9BE8",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  headerEmoji: { fontSize: 52, marginBottom: 10 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  headerSub: {
    fontSize: 13,
    color: "#A8C0E8",
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // ── Section card
  sectionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionAccent: {
    width: 5,
  },
  sectionInner: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A2F5A" },
  sectionBody: {},

  // ── Body text
  bodyText: {
    fontSize: 14,
    color: "#2D3748",
    lineHeight: 24,
  },

  // ── Diagram
  diagramWrapper: { alignItems: "center" },
  diagram: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    marginBottom: 14,
  },
  legendRow: {
    flexDirection: "row",
    gap: 10,
  },
  legendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontWeight: "600" },

  // ── Formula
  formulaBox: {
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C8E0F8",
  },
  formulaText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#1A2F5A",
    lineHeight: 30,
  },
  formulaItem: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2F5A",
    lineHeight: 24,
    marginBottom: 8,
  },

  // ── List Items
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  listBullet: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4C9BE8",
    marginTop: 2,
  },
  listItemText: {
    fontSize: 14,
    color: "#2D3748",
    lineHeight: 20,
    flex: 1,
  },

  // ── Safety
  safetyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginTop: 4,
  },
  safetyIcon: { fontSize: 18, marginTop: 1 },
  safetyText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 20,
    fontWeight: "500",
  },
});

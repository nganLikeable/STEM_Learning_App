import { Button } from "@react-navigation/elements";
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, View } from "react-native";
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
  formulas?: string[];
  journeyParams?: JourneyParams;
}

export default function Instruction({
  instruction,
  title = "STEM Activity",
  subtitle = "Science & Engineering",
  emoji = "🔬",
  tools,
  formulas,
  journeyParams,
}: InstructionProps) {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>STEM LAB</Text>
        </View>
        <Text style={styles.headerEmoji}>{emoji}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </View>

      {/* Tools */}
      <SectionCard
        title="Tools Required"
        characterRight={require('../../assets/images/mascot/ontheRight.png')}
      >
        <View>
          {tools && tools.length > 0 ? (
            tools.map((tool, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listDot} />
                <Text style={styles.listItemText}>{tool}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>No tools required</Text>
          )}
        </View>
      </SectionCard>

      {/* Formulas */}
      <SectionCard
        title="Key Formulas"
        characterLeft={require('../../assets/images/mascot/ontheLeft.png')}
      >
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

      {/* Instructions */}
      <SectionCard title="Instructions">
        <Text style={styles.bodyText}>{instruction}</Text>
      </SectionCard>

      <View style={styles.buttonWrapper}>
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
      </View>
    </ScrollView>
  );
}

function SectionCard({
  title,
  children,
  characterRight,
  characterLeft,
}: {
  title: string;
  children: React.ReactNode;
  characterRight?: ImageSourcePropType;
  characterLeft?: ImageSourcePropType;
}) {
  const hasCharacter = !!(characterRight || characterLeft);
  return (
    <View style={[styles.cardWrapper, hasCharacter && styles.cardWrapperRow]}>
      {/* Character on the left — separate from the white card */}
      {characterLeft && (
        <View style={styles.characterColumn}>
          <Image source={characterLeft} style={styles.characterImage} resizeMode="contain" />
        </View>
      )}

      {/* White card — 2/3 when character present, full width otherwise */}
      <View style={[styles.sectionCard, { flex: hasCharacter ? 2 : 1 }]}>
        <View style={styles.sectionInner}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <View>{children}</View>
        </View>
      </View>

      {/* Character on the right — separate from the white card */}
      {characterRight && (
        <View style={styles.characterColumn}>
          <Image source={characterRight} style={styles.characterImage} resizeMode="contain" />
        </View>
      )}
    </View>
  );
}

const NAVY = "#1A2F5A";
const SLATE = "#64748B";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },

  // Header
  header: {
    alignItems: "center",
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
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
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    letterSpacing: 0.5,
  },

  cardWrapper: {
    marginBottom: 14,
  },
  cardWrapperRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },

  // White card
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionInner: {
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
    backgroundColor: "#EEF1F7",
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: NAVY },

  // Character column — 1/3 of card width, stretches to card height
  characterColumn: {
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "flex-end",
  },
  characterImage: {
    width: "100%",
    height: 120,
  },

  // Body text
  bodyText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 24,
  },

  // Formula
  formulaBox: {
    backgroundColor: "#F8F9FB",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formulaItem: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    lineHeight: 24,
    marginBottom: 6,
    fontFamily: "monospace",
  },

  // List items
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SLATE,
    marginTop: 1,
  },
  listItemText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
    flex: 1,
  },

  // Button
  buttonWrapper: {
    marginTop: 4,
  },
});

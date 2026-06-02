import { useAppTheme } from "@/hooks/useAppTheme";
import { Button } from "@react-navigation/elements";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageSourcePropType, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  createSession,
  getActiveSessionByActivity,
} from "../../services/session";
import { useSessionStore } from "../../store/session-store";
import { useTeamStore } from "../../store/team-store";

interface JourneyParams {
  titles: string[];
  descriptions: string[];
  pathIDs: string[];
}

type PredictionPath = string;

interface InstructionProps {
  activityId?: number;
  instruction: string;
  image?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  emoji?: string;
  tools?: string[];
  formulas?: string[];
  journeyParams?: JourneyParams;
  setupPath?: PredictionPath;
  predictionPath?: PredictionPath;
}

export default function Instruction({
  activityId,
  instruction,
  image,
  tools,
  formulas,
  journeyParams,
  setupPath,
  predictionPath,
}: InstructionProps) {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { teamId } = useTeamStore();
  const { setSessionId } = useSessionStore();
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadActiveSession = async () => {
      if (!teamId || !activityId) {
        setHasProgress(false);
        return;
      }

      try {
        const activeSession = await getActiveSessionByActivity(
          teamId,
          activityId,
        );
        if (!cancelled) {
          // to track progress and show the appropriate screen
          // if predictions are made but no phases completed yet -> show path
          // if session started but no predictions made => show prediction screen instead
          setHasProgress(
            Boolean(
              activeSession &&
              ((activeSession.currentPhase ?? 1) > 1 ||
                activeSession.prediction != null ||
                (activeSession.designs?.length ?? 0) > 0),
            ),
          );
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setHasProgress(false);
      }
    };

    loadActiveSession();

    return () => {
      cancelled = true;
    };
  }, [teamId, activityId]);

  const handleStartExperiment = async () => {
    if (!teamId || !activityId) return;
    if (!journeyParams) return;

    try {
      let activeSessionId: string | null = null;

      const activeSession = await getActiveSessionByActivity(
        teamId,
        activityId,
      );
      if (activeSession?.id) {
        activeSessionId = activeSession.id;
        setSessionId(activeSessionId);

        const hasJourneyProgress =
          (activeSession.currentPhase ?? 1) > 1 ||
          activeSession.prediction != null;

        // Resume directly from the journey once the session has real progress.
        if (hasJourneyProgress) {
          router.push({
            pathname: "/JourneyComponent" as any,
            params: {
              journeyData: JSON.stringify({
                titles: journeyParams.titles,
                descriptions: journeyParams.descriptions,
                pathIDs: journeyParams.pathIDs,
                activityId,
              }),
            },
          });
          return;
        }
      }

      if (!activeSessionId) {
        activeSessionId = await createSession(teamId, activityId, null);
        // persist the newly created session id into the global store
        setSessionId(activeSessionId);
      }
      if (!predictionPath) return;

      const shouldResumePrediction =
        activityId === 2 && (activeSession?.designs?.length ?? 0) === 3;

      const nextPath = shouldResumePrediction
        ? predictionPath
        : (setupPath ?? predictionPath);

      router.push({
        pathname: nextPath as any,
        params: {
          journeyData: JSON.stringify({
            titles: journeyParams.titles,
            descriptions: journeyParams.descriptions,
            pathIDs: journeyParams.pathIDs,
            activityId,
          }),
        },
      });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.primary }]} contentContainerStyle={styles.content}>
      {/* Header image */}
      {image && (
        <ExpoImage source={image} style={styles.headerImage} contentFit="contain" transition={0} />
      )}

      {/* Tools */}
      <SectionCard
        title="Tools Required"
        characterRight={require('../../../assets/images/mascot/ontheRight.png')}
      >
        <View>
          {tools && tools.length > 0 ? (
            tools.map((tool, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listDot} />
                <Text style={[styles.listItemText, { color: colors.textSecondary }]}>{tool}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>No tools required</Text>
          )}
        </View>
      </SectionCard>

      {/* Formulas */}
      <SectionCard
        title="Key Formulas"
        characterLeft={require('../../../assets/images/mascot/ontheLeft.png')}
      >
        <View>
          {formulas && formulas.length > 0 ? (
            formulas.map((formula, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listDot} />
                <Text style={[styles.listItemText, { color: colors.textSecondary }]}>{formula}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>No formulas available</Text>
          )}
        </View>
      </SectionCard>

      {/* Instructions */}
      <SectionCard
        title="Instructions"
        characterTop={require('../../../assets/images/mascot/holdingDown.png')}
        characterTopOffset={-35}
        gapTop={50}
      >
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{instruction}</Text>
      </SectionCard>

      <Button onPress={handleStartExperiment}>
        {hasProgress ? "Resume Experiment" : "Start Experiment"}
      </Button>

    </ScrollView>
  );
}

function SectionCard({
  title,
  children,
  characterRight,
  characterLeft,
  characterTop,
  characterTopOffset,
  gapTop,
}: {
  title: string;
  children: React.ReactNode;
  characterRight?: ImageSourcePropType;
  characterLeft?: ImageSourcePropType;
  characterTop?: ImageSourcePropType;
  characterTopOffset?: number;
  gapTop?: number;
}) {
  const { colors } = useAppTheme();
  const hasCharacter = !!(characterRight || characterLeft);
  const topOffset = characterTopOffset ?? -40;
  const wrapperPaddingTop = Math.max(0, -topOffset);

  return (
    <View style={[styles.cardWrapper, hasCharacter && styles.cardWrapperRow]}>
      {/* Character on the left — separate from the white card */}
      {characterLeft && (
        <View style={styles.characterColumn}>
          <ExpoImage source={characterLeft} style={styles.characterImage} contentFit="contain" transition={0} />
        </View>
      )}

      {/* White card wrapper — allows absolutely-positioned top mascot without affecting siblings */}
      <View style={[styles.sectionCardWrapper, { flex: hasCharacter ? 2 : 1, paddingTop: wrapperPaddingTop, marginTop: gapTop ?? 0 }]}>
        {characterTop && (
          <View style={[styles.characterTopAbsoluteContainer, { top: topOffset }]} pointerEvents="none">
            <ExpoImage source={characterTop} style={styles.characterTopImage} contentFit="contain" transition={0} />
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View>{children}</View>
          </View>
        </View>
      </View>

      {/* Character on the right — separate from the white card */}
      {characterRight && (
        <View style={styles.characterColumn}>
          <ExpoImage source={characterRight} style={styles.characterImage} contentFit="contain" transition={0} />
        </View>
      )}
    </View>
  );
}

const NAVY = "#3779fd";
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

  headerImage: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    marginBottom: 20,
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
  sectionTitle: { fontSize: 16, fontWeight: "800", color: NAVY },

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

  characterTopWrapper: {
    alignItems: "center",
  },
  characterTopImage: {
    width: 120,
    height: 120,
  },
  sectionCardWrapper: {
    position: "relative",
  },
  characterTopAbsoluteContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
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

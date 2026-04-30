import Header from "@/src/components/header";
import TeamInfoCard from "@/src/components/TeamInfoCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getUserProfile, getTeam, getTeamMembers } from '../../services/firestore';
import { getAuth } from 'firebase/auth';


// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  title: string;
  description: string;
  nextScreen: string;
  icon: string; // MaterialCommunityIcons name
  iconColor: string; // icon tint colour
  iconBg: string; // icon background circle colour
}

// ─── Activity data ────────────────────────────────────────────────────────────

// First 4 → Engineering Challenges section
// Last 3  → Health & Medical Science section
const activities: Activity[] = [
  {
    id: "1",
    title: "Parachute Drop",
    description:
      "Design and test parachutes to reduce landing speed and impact force.",
    nextScreen: "parachute/InstructionScreen",
    icon: "parachute",
    iconColor: "#3977fd",
    iconBg: "#DBEAFE",
  },
  {
    id: "2",
    title: "Sound Pollution Hunter",
    description: "Measure and compare sound levels. Map loud and quiet zones.",
    nextScreen: "soundPollutionHunter/InstructionScreen",
    icon: "volume-high",
    iconColor: "#7C3AED",
    iconBg: "#EDE9FE",
  },
  {
    id: "3",
    title: "Hand Fan Challenge",
    description:
      "Test how air movement affects flexible materials with fan designs.",
    nextScreen: "handFanChallenge/InstructionScreen",
    icon: "fan",
    iconColor: "#0891B2",
    iconBg: "#CFFAFE",
  },
  {
    id: "4",
    title: "Earthquake Structure",
    description:
      "Build structures that withstand vibrations simulating earthquakes.",
    nextScreen: "earthquake/InstructionScreen",
    icon: "home-alert",
    iconColor: "#D97706",
    iconBg: "#FEF3C7",
  },
  {
    id: "5",
    title: "Performance Lab",
    description:
      "Measure speed, smoothness, and coordination during stretching.",
    nextScreen: "humanPerformanceLab/InstructionScreen",
    icon: "run-fast",
    iconColor: "#059669",
    iconBg: "#D1FAE5",
  },
  {
    id: "6",
    title: "Reaction Board",
    description:
      "Test reaction time and coordination with dominant and non-dominant hands.",
    nextScreen: "reactionBoardChallenge/InstructionScreen",
    icon: "lightning-bolt",
    iconColor: "#DC2626",
    iconBg: "#FEE2E2",
  },
  {
    id: "7",
    title: "Breathing Pace Trainer",
    description:
      "Analyse breathing patterns at rest and after exercise using phone sensors. Place phone on chest to record before and after physical activities.",
    nextScreen: "breathingPaceTrainer/InstructionScreen",
    icon: "lungs",
    iconColor: "#0284C7",
    iconBg: "#E0F2FE",
  },
];

// ─── Grid card component ──────────────────────────────────────────────────────

// Height of a standard square grid card — used to size the tall card (activity 7)
const CARD_H = 160;
const GAP = 12;

interface GridCardProps {
  activity: Activity;
}

/**
 * GridCard — a pressable card used in the activity grid sections.
 * Shows a coloured icon circle, title, and truncated description.
 */
const GridCard: React.FC<GridCardProps> = ({ activity }) => {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        gs.card,
        { height: CARD_H },
        pressed && { opacity: 0.75 },
      ]}
      onPress={() => router.navigate(`./screens/${activity.nextScreen}`)}
    >
      {/* Coloured icon circle */}
      <View style={[gs.iconCircle, { backgroundColor: activity.iconBg }]}>
        <MaterialCommunityIcons
          name={activity.icon as any}
          size={24}
          color={activity.iconColor}
        />
      </View>

      {/* Activity title */}
      <Text style={gs.cardTitle} numberOfLines={2}>
        {activity.title}
      </Text>

      {/* Truncated description */}
      <Text style={gs.cardDesc} numberOfLines={2}>
        {activity.description}
      </Text>

      {/* Bottom arrow */}
      <View style={gs.arrowRow}>
        <MaterialCommunityIcons name="arrow-right" size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
};



// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * HomeScreen — main landing screen with two activity sections:
 *   1. Engineering Challenges  (activities 1–4) — 2 × 2 grid
 *   2. Health & Medical Science (activities 5–7) — 2-col row + 1 tall full-width card
 */
export default function HomeScreen() {
  const engineering = activities.slice(0, 4);
  const health = activities.slice(4, 6);
  const healthTall = activities[6];

  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [grade, setGrade] = useState('');

  useEffect(() => {
    const load = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const profileSnap = await getUserProfile(user.uid);
      if (!profileSnap.exists()) return;

      const profile = profileSnap.data();
      setUserName(profile.name);
      setGrade(`Year ${profile.grade}`);

      if (profile.teamId) {
        setTeamId(profile.teamId);

        const [teamSnap, teamMembers] = await Promise.all([
          getTeam(profile.teamId),
          getTeamMembers(profile.teamId),
        ]);

        if (teamSnap.exists()) setTeamName(teamSnap.data().name);
        setMemberNames(teamMembers.map((m: any) => m.name));
      }
    };

    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header userName={userName} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <TeamInfoCard
          teamName={teamName}
          teamId={teamId}
          members={memberNames}
          grade={grade}
          points={450}
          rank={12}
        />

        {/* ── Section 1: Engineering Challenges ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engineering Challenges</Text>

          {/* Row 1: activities 1 & 2 */}
          <View style={styles.gridRow}>
            <GridCard activity={engineering[0]} />
            <GridCard activity={engineering[1]} />
          </View>

          {/* Row 2: activities 3 & 4 */}
          <View style={styles.gridRow}>
            <GridCard activity={engineering[2]} />
            <GridCard activity={engineering[3]} />
          </View>
        </View>

        {/* ── Section 2: Health & Medical Science ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Medical Science</Text>

          {/* Row 1: activities 5 & 6 side by side */}
          <View style={styles.gridRow}>
            {/* {health.map((a) => <GridCard key={a.id} activity={a} />)} */}
            <GridCard activity={health[0]} />
            <GridCard activity={health[1]} />
          </View>

          {/* Row 2: activity 7 full-width */}
          <GridCard activity={healthTall} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Grid card styles ─────────────────────────────────────────────────────────

const gs = StyleSheet.create({
  // Card container — flex:1 so both cards in a row split the width equally
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  // Rounded icon background circle
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  // Card title — bold, allows 2 lines
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    lineHeight: 18,
  },

  // Card description — muted, small
  cardDesc: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
    flex: 1,
  },

  // Arrow pinned to the bottom-right
  arrowRow: {
    alignItems: "flex-end",
    marginTop: 6,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },

  // Section wrapper with bottom margin
  section: {
    marginTop: 24,
  },

  // Bold section heading
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },

  // Two-card row with a gap between cards
  gridRow: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: GAP,
  },
});

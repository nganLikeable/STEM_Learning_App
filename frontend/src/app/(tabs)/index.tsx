import Header from "@/src/components/header";
import TeamInfoCard from "@/src/components/TeamInfoCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getAuth } from 'firebase/auth';
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getUserProfile, getTeam, getTeamMembers, getAllTeams, markTodayAttendance } from '../../services/firestore';

// ─── Image assets ─────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-var-requires */
const parachuteImg  = require('../../../assets/images/activityCards/parachute-experiment.png') as ImageSourcePropType;
const soundImg      = require('../../../assets/images/activityCards/sound-measurement.png') as ImageSourcePropType;
const fanImg        = require('../../../assets/images/activityCards/air-fan-experiment.png') as ImageSourcePropType;
const earthquakeImg = require('../../../assets/images/activityCards/vibration-platform.png') as ImageSourcePropType;
const perfLabImg    = require('../../../assets/images/activityCards/circular-motion.png') as ImageSourcePropType;
const reactionImg   = require('../../../assets/images/activityCards/reaction-time.png') as ImageSourcePropType;
const breathingImg  = require('../../../assets/images/activityCards/breathing-measurement.png') as ImageSourcePropType;
/* eslint-enable @typescript-eslint/no-var-requires */

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  title: string;
  description: string;
  nextScreen: string;
  image: ImageSourcePropType;
}

// ─── Activity data ────────────────────────────────────────────────────────────

const activities: Activity[] = [
  {
    id: "1",
    title: "Parachute Drop",
    description:
      "Design and test parachutes to reduce landing speed and impact force.",
    nextScreen: "parachute/InstructionScreen",
    image: parachuteImg,
  },
  {
    id: "2",
    title: "Sound Pollution Hunter",
    description: "Measure and compare sound levels. Map loud and quiet zones.",
    nextScreen: "soundPollutionHunter/InstructionScreen",
    image: soundImg,
  },
  {
    id: "3",
    title: "Hand Fan Challenge",
    description:
      "Test how air movement affects flexible materials with fan designs.",
    nextScreen: "handFanChallenge/InstructionScreen",
    image: fanImg,
  },
  {
    id: "4",
    title: "Earthquake Structure",
    description:
      "Build structures that withstand vibrations simulating earthquakes.",
    nextScreen: "earthquake/InstructionScreen",
    image: earthquakeImg,
  },
  {
    id: "5",
    title: "Performance Lab",
    description:
      "Measure speed, smoothness, and coordination during stretching.",
    nextScreen: "humanPerformanceLab/InstructionScreen",
    image: perfLabImg,
  },
  {
    id: "6",
    title: "Reaction Board",
    description:
      "Test reaction time and coordination with dominant and non-dominant hands.",
    nextScreen: "reactionBoardChallenge/InstructionScreen",
    image: reactionImg,
  },
  {
    id: "7",
    title: "Breathing Pace Trainer",
    description:
      "Analyse breathing patterns at rest and after exercise using phone sensors. Place phone on chest to record before and after physical activities.",
    nextScreen: "breathingPaceTrainer/InstructionScreen",
    image: breathingImg,
  },
];

// ─── Card dimensions ──────────────────────────────────────────────────────────

const SCREEN_W = Dimensions.get('window').width;
const H_PADDING = 32; // 16px on each side from contentContainer
const CARD_W = SCREEN_W - H_PADDING;
const CARD_H = 155;
const IMG_W = Math.round(CARD_W * 0.42);

// ─── SwipeCard ────────────────────────────────────────────────────────────────

const SwipeCard: React.FC<{ activity: Activity }> = ({ activity }) => {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [sc.card, pressed && { opacity: 0.82 }]}
      onPress={() => router.navigate(`./screens/${activity.nextScreen}`)}
    >
      {/* Left: image fills the full left column */}
      <Image source={activity.image} style={sc.image} resizeMode="cover" />

      {/* Right: text content */}
      <View style={sc.textBlock}>
        <Text style={sc.title} numberOfLines={2}>{activity.title}</Text>
        <Text style={sc.desc} numberOfLines={4}>{activity.description}</Text>

        {/* Arrow pinned to bottom-right */}
        <View style={sc.arrowRow}>
          <MaterialCommunityIcons name="arrow-right-circle" size={26} color="#6C63FF" />
        </View>
      </View>
    </Pressable>
  );
};

const sc = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: IMG_W,
    height: CARD_H,
  },
  textBlock: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 21,
  },
  desc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    flex: 1,
  },
  arrowRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
});

// ─── ActivityCarousel ─────────────────────────────────────────────────────────

const ActivityCarousel: React.FC<{ activities: Activity[] }> = ({ activities: items }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item }) => <SwipeCard activity={item} />}
      />

      {/* Dot indicators */}
      {items.length > 1 && (
        <View style={carousel.dots}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[carousel.dot, i === activeIndex && carousel.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const carousel = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#6C63FF',
    width: 18,
  },
});

// ─── Weekly Calendar ──────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDays(): { label: string; dateStr: string; dayNum: number }[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun … 6=Sat
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));

  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      dateStr: d.toISOString().slice(0, 10),
      dayNum: d.getDate(),
    };
  });
}

const WeeklyCalendar: React.FC<{ attendanceDates: string[] }> = ({ attendanceDates }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekDays = getWeekDays();

  return (
    <View style={wc.card}>
      <View style={wc.row}>
        {weekDays.map(({ label, dateStr, dayNum }) => {
          const isAttended = attendanceDates.includes(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;

          const circleStyle = isAttended
            ? wc.circleAttended
            : isToday
            ? wc.circleToday
            : isFuture
            ? wc.circleFuture
            : wc.circlePast;

          const numStyle = isAttended || isToday
            ? wc.numWhite
            : isFuture
            ? wc.numFuture
            : wc.numPast;

          return (
            <View key={dateStr} style={wc.dayCol}>
              <Text style={[wc.dayLabel, isFuture && wc.dayLabelFuture]}>
                {label}
              </Text>
              <View style={[wc.circle, circleStyle]}>
                <Text style={[wc.dayNum, numStyle]}>{dayNum}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const wc = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  dayLabelFuture: {
    color: '#D1D5DB',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleAttended: {
    backgroundColor: '#4ADE80',
  },
  circleToday: {
    backgroundColor: '#6C63FF',
  },
  circlePast: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  circleFuture: {
    // no border, transparent
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
  },
  numWhite: {
    color: '#fff',
  },
  numPast: {
    color: '#9CA3AF',
  },
  numFuture: {
    color: '#D1D5DB',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const engineering = activities.slice(0, 4);
  const health = activities.slice(4);

  const [userName, setUserName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [rank, setRank] = useState<number | null>(null);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    const user = getAuth().currentUser;
    if (!user) return;

    const profileSnap = await getUserProfile(user.uid);
    if (!profileSnap.exists()) return;

    const profile = profileSnap.data();
    setUserName(profile.name);
    setAttendanceDates(profile.attendanceDates ?? []);
    markTodayAttendance(user.uid);

    if (profile.teamId) {
      setTeamId(profile.teamId);

      const [teamSnap, teamMembers, allTeams] = await Promise.all([
        getTeam(profile.teamId),
        getTeamMembers(profile.teamId),
        getAllTeams(),
      ]);

      if (teamSnap.exists()) {
        const teamData = teamSnap.data();
        setTeamName(teamData.name);
        setPoints(teamData.points ?? 0);
      }

      setMemberNames(teamMembers.map((m: any) => m.name));

      const sorted = [...allTeams].sort((a: any, b: any) => (b.points ?? 0) - (a.points ?? 0));
      const idx = sorted.findIndex((t: any) => t.id === profile.teamId);
      setRank(idx >= 0 ? idx + 1 : null);
      return;
    }

    setTeamId("");
    setTeamName("");
    setMemberNames([]);
    setPoints(0);
    setRank(null);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

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
          points={points}
          rank={rank ?? undefined}
        />

        <WeeklyCalendar attendanceDates={attendanceDates} />

        {/* ── Section 1: Engineering Challenges ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engineering Challenges</Text>
          <ActivityCarousel activities={engineering} />
        </View>

        {/* ── Section 2: Health & Medical Science ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Medical Science</Text>
          <ActivityCarousel activities={health} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
});

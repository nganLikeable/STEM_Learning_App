import Header from "@/src/components/header";
import TeamInfoCard from "@/src/components/TeamInfoCard";
import { useAppTheme } from "@/hooks/useAppTheme";
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
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  ViewToken,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { SafeAreaView } from "react-native-safe-area-context";

import CompletedSessionsSection from '@/src/components/CompletedSessionsSection';
import { getUserProfile, getTeam, getTeamMembers, markTodayAttendance } from '../../services/firestore';
import { subscribeToTeamScores } from '../../services/teamScore';

// ─── Image assets ─────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-var-requires */
const fireImg = require('../../../assets/images/fire.png') as ImageSourcePropType;
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
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        sc.card,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.82 },
      ]}
      onPress={() => router.navigate(`./screens/${activity.nextScreen}`)}
    >
      {/* Left: image fills the full left column */}
      <Image source={activity.image} style={sc.image} resizeMode="cover" />

      {/* Right: text content */}
      <View style={sc.textBlock}>
        <Text style={[sc.title, { color: colors.text }]} numberOfLines={2}>{activity.title}</Text>
        <Text style={[sc.desc, { color: colors.textSecondary }]} numberOfLines={4}>{activity.description}</Text>

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
    fontSize: 13.6,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 21,
  },
  desc: {
    fontSize: 12,
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

// ─── Attendance Calendar ──────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getWeekDays(baseDate: Date): { label: string; dateStr: string; dayNum: number }[] {
  const dow = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((dow + 6) % 7));
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, dateStr: d.toISOString().slice(0, 10), dayNum: d.getDate() };
  });
}

function getMonthGrid(year: number, month: number): (string | null)[] {
  // Returns 42 slots (6 weeks), null = padding from prev/next month
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(dateStr);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const AttendanceCalendar: React.FC<{ attendanceDates: string[] }> = ({ attendanceDates }) => {
  const { colors } = useAppTheme();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [expanded, setExpanded] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const weekDays = getWeekDays(today);
  const monthGrid = getMonthGrid(viewYear, viewMonth);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };
  const canGoNext = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const DayCircle = ({ dateStr, dayNum, label }: { dateStr: string; dayNum: number; label?: string }) => {
    const isAttended = attendanceDates.includes(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const circleStyle = isToday ? wc.circleToday : isFuture ? wc.circleFuture : wc.circlePast;
    const numStyle = isToday ? wc.numWhite : isFuture ? wc.numFuture : wc.numPast;
    return (
      <View style={wc.dayCol}>
        {label !== undefined && (
          <Text style={[wc.dayLabel, isFuture && wc.dayLabelFuture]}>{label}</Text>
        )}
        {isAttended ? (
          <Image source={fireImg} style={wc.fireIcon} resizeMode="contain" />
        ) : (
          <View style={[wc.circle, circleStyle]}>
            <Text style={[wc.dayNum, numStyle]}>{dayNum}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Pressable onPress={toggle} style={[wc.card, { backgroundColor: colors.surface }]}>
      {/* Header row */}
      <View style={wc.cardHeader}>
        <Text style={[wc.cardTitle, { color: colors.textSecondary }]}>🔥Streak</Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </View>

      {/* Collapsed: week strip */}
      {!expanded && (
        <View style={wc.row}>
          {weekDays.map(({ label, dateStr, dayNum }) => (
            <DayCircle key={dateStr} dateStr={dateStr} dayNum={dayNum} label={label} />
          ))}
        </View>
      )}

      {/* Expanded: full month */}
      {expanded && (
        <View>
          {/* Month navigation */}
          <View style={wc.monthNav}>
            <Pressable onPress={prevMonth} hitSlop={10}>
              <MaterialCommunityIcons name="chevron-left" size={22} color="#6C63FF" />
            </Pressable>
            <Text style={[wc.monthLabel, { color: colors.text }]}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={canGoNext ? nextMonth : undefined} hitSlop={10}>
              <MaterialCommunityIcons name="chevron-right" size={22} color={canGoNext ? '#6C63FF' : '#D1D5DB'} />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View style={wc.row}>
            {DAY_LABELS.map(l => (
              <View key={l} style={wc.dayCol}>
                <Text style={wc.dayLabel}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Grid rows */}
          {Array.from({ length: monthGrid.length / 7 }, (_, row) => (
            <View key={row} style={wc.row}>
              {monthGrid.slice(row * 7, row * 7 + 7).map((dateStr, col) => (
                <View key={col} style={wc.dayCol}>
                  {dateStr ? (
                    <DayCircle dateStr={dateStr} dayNum={parseInt(dateStr.slice(8))} />
                  ) : (
                    <View style={wc.circle} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

const wc = StyleSheet.create({
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dayLabelFuture: {
    color: '#D1D5DB',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireIcon: { width: 30, height: 30 },
  circleToday: { backgroundColor: '#6C63FF' },
  circlePast: { borderWidth: 1.5, borderColor: '#E5E7EB' },
  circleFuture: {},
  dayNum: { fontSize: 12, fontWeight: '600' },
  numWhite: { color: '#fff' },
  numPast: { color: '#9CA3AF' },
  numFuture: { color: '#D1D5DB' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { colors } = useAppTheme();
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

      const [teamSnap, teamMembers] = await Promise.all([
        getTeam(profile.teamId),
        getTeamMembers(profile.teamId),
      ]);

      if (teamSnap.exists()) setTeamName(teamSnap.data().name);
      setMemberNames(teamMembers.map((m: any) => m.name));
      return;
    }

    setTeamId("");
    setTeamName("");
    setMemberNames([]);
    setPoints(0);
    setRank(null);
  }, []);

  // Real-time points + rank — re-subscribes whenever teamId becomes known
  useEffect(() => {
    if (!teamId) return;
    const unsub = subscribeToTeamScores((scores) => {
      const sorted = [...scores].sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
      const idx = sorted.findIndex((s) => s.teamId === teamId);
      const myScore = scores.find((s) => s.teamId === teamId);
      setPoints(Math.round((myScore?.totalScore ?? 0) * 100) / 100);
      setRank(idx >= 0 ? idx + 1 : null);
    });
    return unsub;
  }, [teamId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
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

        <AttendanceCalendar attendanceDates={attendanceDates} />

        {/* ── Completed Sessions ── */}
        {teamId ? <CompletedSessionsSection teamId={teamId} /> : null}

        {/* ── Section 1: Engineering Challenges ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Engineering Challenges</Text>
          <ActivityCarousel activities={engineering} />
        </View>

        {/* ── Section 2: Health & Medical Science ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health & Medical Science</Text>
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

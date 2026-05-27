import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useAppStore } from '../store/app-store';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Slide data ───────────────────────────────────────────────────────────────

type Slide = {
  mascot?: ImageSourcePropType;
  title: string;
  subtitle: string;
  bg: [string, string];
};

const SLIDES: Slide[] = [
  {
    title: 'STEMMission',
    subtitle: 'Your lab is everywhere.\nLet\'s get experimenting!',
    bg: ['#ffffff', '#ffffffe1'],
  },
  {
    mascot: require('../../assets/images/mascot/heyjo.png'),
    title: 'Hello,\nExplorer!',
    subtitle: 'Science adventures made for curious minds like yours',
    bg: ['#F0EEFF', '#E0D8FF'],
  },
  {
    mascot: require('../../assets/images/mascot/deokinhCool.png'),
    title: '7 Epic\nChallenges',
    subtitle: 'Build parachutes, hunt sound pollution, train your breathing and more',
    bg: ['#E6F4FE', '#C8E6FF'],
  },
  {
    mascot: require('../../assets/images/mascot/nhayVuiMung.png'),
    title: 'Team Up\n& Compete',
    subtitle: 'Join friends, earn points and top the leaderboard together',
    bg: ['#E8F9EF', '#C8F0DA'],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function IntroScreen() {
  const [index, setIndex] = useState(0);
  const opacities = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  const router = useRouter();
  const markIntroSeen = useAppStore((state) => state.markIntroSeen);

  const goTo = (next: number) => {
    const prev = index;
    setIndex(next);
    Animated.parallel([
      Animated.timing(opacities[prev], { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(opacities[next], { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();
  };

  const finish = (dest: '/login' | '/register') => {
    markIntroSeen();
    router.replace(dest);
  };

  return (
    <View style={styles.root}>

      {SLIDES.map((slide, i) => (
        <Animated.View
          key={i}
          style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}
          pointerEvents={i === index ? 'auto' : 'none'}
        >
          <LinearGradient colors={slide.bg} style={styles.gradient}>
            {slide.mascot ? (
              // ── Mascot slides: illustration top, text bottom-left ──────────
              <SafeAreaView edges={['top']} style={styles.slideContent}>
                <View style={styles.mascotArea}>
                  <Image source={slide.mascot} style={styles.mascot} resizeMode="contain" />
                </View>

                <View style={styles.textArea}>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>

                </View>
              </SafeAreaView>
            ) : (
              // ── Hero slide: centered brand intro ───────────────────────────
              <SafeAreaView edges={['top']} style={styles.heroContent}>
                <Text style={styles.heroTitle}>{slide.title}</Text>
                <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
              </SafeAreaView>
            )}
          </LinearGradient>
        </Animated.View>
      ))}

      {/* Buttons pinned to bottom, always on top */}
      <View style={styles.buttonOverlay} pointerEvents="box-none">
        <SafeAreaView edges={['bottom']} pointerEvents="box-none">
          <View style={styles.buttonRow}>
            {index === SLIDES.length - 1 ? (
              <>
                <Pressable
                  style={({ pressed }) => [styles.btnOutline, pressed && styles.pressed]}
                  onPress={() => finish('/login')}
                >
                  <Text style={styles.btnOutlineText}>Log In</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.btnFill, pressed && styles.pressed]}
                  onPress={() => finish('/register')}
                >
                  <Text style={styles.btnFillText}>Sign Up</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.btnFill, styles.btnFull, pressed && styles.pressed]}
                onPress={() => goTo(index + 1)}
              >
                <Text style={styles.btnFillText}>Next</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1 },

  // ── Hero slide ──────────────────────────────────────────────────────────────
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 140,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#5500ff',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight:'700',
    color: 'rgba(0, 0, 0, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },

  // ── Mascot slides ───────────────────────────────────────────────────────────
  slideContent: {
    flex: 1,
    paddingBottom: 130,
  },

  // Top ~60% — illustration centered
  mascotArea: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    width: 280,
    height: 280,
  },

  // Bottom ~40% — title left, subtitle left, dots
  textArea: {
    flex: 2,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 44,
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 23,
    textAlign: 'left',
    marginBottom: 20,
  },

  // Pagination dots
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3977FD',
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  buttonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnFill: {
    flex: 1,
    height: 54,
    backgroundColor: '#3977FD',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3977FD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnFull: { flex: 1 },
  btnOutline: {
    flex: 1,
    height: 54,
    borderWidth: 2,
    borderColor: '#3977FD',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFillText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  btnOutlineText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3977FD',
  },
  pressed: { opacity: 0.75 },
});

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
    bg: ['#3b80db', '#6380ff'],
  },
  {
    mascot: require('../../assets/images/mascot/heyjo.png'),
    title: 'Hello, Explorer!',
    subtitle: 'Science adventures made for curious minds like yours',
    bg: ['#F0EEFF', '#E0D8FF'],
  },
  {
    mascot: require('../../assets/images/mascot/deokinhCool.png'),
    title: '7 Epic Challenges',
    subtitle: 'Build parachutes, hunt sound pollution, train your breathing and more',
    bg: ['#E6F4FE', '#C8E6FF'],
  },
  {
    mascot: require('../../assets/images/mascot/nhayVuiMung.png'),
    title: 'Team Up & Compete',
    subtitle: 'Join friends, earn points and top the leaderboard together',
    bg: ['#E8F9EF', '#C8F0DA'],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function IntroScreen() {
  const [index, setIndex] = useState(0);
  // One opacity value per slide — slide 0 starts visible, rest hidden
  const opacities = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  const router = useRouter();
  const markIntroSeen = useAppStore((state) => state.markIntroSeen);

  const goTo = (next: number) => {
    const prev = index;
    setIndex(next); // update immediately so buttons/pointerEvents flip at once
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

      {/* All slides pre-rendered — only active one is visible */}
      {SLIDES.map((slide, i) => (
        <Animated.View
          key={i}
          style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}
          pointerEvents={i === index ? 'auto' : 'none'}
        >
          <LinearGradient colors={slide.bg} style={styles.gradient}>
            <SafeAreaView edges={['top']} style={styles.slideContent}>
              {slide.mascot && (
                <Image source={slide.mascot} style={styles.mascot} resizeMode="contain" />
              )}
              <Text style={[styles.title, !slide.mascot && styles.heroTitle]}>
                {slide.title}
              </Text>
              <Text style={[styles.subtitle, !slide.mascot && styles.heroSubtitle]}>
                {slide.subtitle}
              </Text>
            </SafeAreaView>
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
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 140, // leave room for buttons overlay
  },
  mascot: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 23,
  },
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
  btnFull: {
    flex: 1,
  },
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
  pressed: {
    opacity: 0.75,
  },
  heroTitle: {
    fontSize: 40,
    color: '#fff',
    letterSpacing: 1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 17,
  },
});

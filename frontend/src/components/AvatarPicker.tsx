import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AVATARS } from "../app/constants/avatars";

interface AvatarPickerProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

// for avatar tab switching
type avatarCategory = "adventurer" | "neutral";

export default function AvatarPicker({
  selected,
  onSelect,
}: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<avatarCategory>("adventurer"); //

  // get list of avatar group
  const currentAvatars = AVATARS[activeTab];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select your avatar</Text>
      </View>
      {/* catgory toggle buttons*/}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "adventurer" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("adventurer")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "adventurer" && styles.activeTabText,
            ]}
          >
            Adventurer
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "neutral" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("neutral")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "neutral" && styles.activeTabText,
            ]}
          >
            Neutral
          </Text>
        </Pressable>
      </View>

      {/* grid layout */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {currentAvatars.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => onSelect(a.id)}
              style={styles.avatarWrapper}
            >
              <View
                style={[
                  styles.avatarRing,
                  selected === a.id && styles.avatarRingSelected,
                  activeTab === "adventurer" && styles.advImage,
                ]}
              >
                <Image style={styles.avatarImage} source={a.source} />
                {selected === a.id && (
                  <View style={styles.checkOverlay}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 30,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#d3ccff",
  },
  tabText: {},
  activeTabText: {},
  activeTab: {
    backgroundColor: "#b2a7ff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 25,
  },
  avatarWrapper: {
    width: "40%",
    alignItems: "center",
  },
  selectedCircle: {
    borderColor: "white",
  },
  avatarImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    borderRadius: 100,
  },
  selectedAvatar: {
    transform: [{ scale: 1.1 }],
  },
  // add background to pics with transparent background
  advImage: {
    backgroundColor: "rgb(180, 196, 199)",
  },
  checkOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#103736ce",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  avatarRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "transparent",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarRingSelected: {
    borderColor: "#c5caff",
    shadowColor: "#3e4eff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 3,
    shadowRadius: 10,
    elevation: 6,
  },
});

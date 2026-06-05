import { useAppTheme } from "@/hooks/useAppTheme";
import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, saveUserProfile } from "../../../services/firestore";

const GRADE_OPTIONS = ["5", "6", "7", "8", "9", "10", "11", "12"];
const ACCENT = "#6b76ee";

export default function ChangeProfile() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const avatar = useGetUserAvatar();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("5");
  const [email, setEmail] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialGrade, setInitialGrade] = useState("5");
  const [initialEmail, setInitialEmail] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Edit Profile" });
  }, [navigation]);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) { setLoading(false); return; }
    getUserProfile(user.uid)
      .then((snap) => {
        const data = snap.data() || {};
        const n = String(data.name || "");
        const g = String(data.grade || "5");
        const e = String(data.email || user.email || "");
        setName(n); setGrade(g); setEmail(e);
        setInitialName(n); setInitialGrade(g); setInitialEmail(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasUnsavedChanges = useMemo(
    () => name.trim() !== initialName.trim() || grade !== initialGrade || email.trim() !== initialEmail.trim(),
    [name, grade, email, initialName, initialGrade, initialEmail],
  );

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      Alert.alert("Discard changes?", "Leave without saving?", [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
    return unsub;
  }, [navigation, hasUnsavedChanges]);

  const handleSave = async () => {
    const user = getAuth().currentUser;
    if (!user) { Alert.alert("Error", "You must be logged in."); return; }
    if (!name.trim()) { Alert.alert("Missing Name", "Please enter your name."); return; }
    setSaving(true);
    try {
      await saveUserProfile(user.uid, { name: name.trim(), grade, email: email.trim() });
      setInitialName(name.trim()); setInitialGrade(grade); setInitialEmail(email.trim());
      Alert.alert("Saved", "Profile updated.", [{ text: "OK", onPress: () => router.replace("/(tabs)/setting") }]);
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.primary }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: colors.primary }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={92}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={s.avatarSection}>
            <View style={[s.avatarRing, { borderColor: ACCENT + "55" }]}>
              <View style={s.avatarCircle}>
                {avatar
                  ? <Image source={avatar} style={s.avatarImage} />
                  : <Text style={s.avatarInitial}>{name?.[0]?.toUpperCase() || "?"}</Text>}
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/screens/profile/PickUserAvatarScreen")}
              style={({ pressed }) => [s.changeBtn, { borderColor: ACCENT }, pressed && { opacity: 0.7 }]}
            >
              <Text style={[s.changeBtnText, { color: ACCENT }]}>Change avatar</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={[s.card, { backgroundColor: colors.surface }]}>
            <Text style={[s.label, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              style={[s.input, { backgroundColor: colors.primary, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[s.label, { color: colors.textSecondary }]}>Grade</Text>
            <Pressable
              style={({ pressed }) => [
                s.input, s.dropdownRow,
                { backgroundColor: colors.primary, borderColor: colors.border },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setGradeModalVisible(true)}
            >
              <Text style={[s.dropdownText, { color: colors.text }]}>Grade {grade}</Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.textSecondary} />
            </Pressable>

            <Text style={[s.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              value={email}
              editable={false}
              style={[s.input, { borderColor: colors.border, color: colors.textSecondary, backgroundColor: colors.border + "44" }]}
            />

            <Pressable
              onPress={handleSave}
              disabled={saving || !hasUnsavedChanges}
              style={({ pressed }) => [
                s.saveBtn,
                (!hasUnsavedChanges || saving) && s.saveBtnDisabled,
                pressed && hasUnsavedChanges && { opacity: 0.85 },
              ]}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={s.saveBtnText}>Save Changes</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Grade modal */}
      <Modal transparent animationType="fade" visible={gradeModalVisible} onRequestClose={() => setGradeModalVisible(false)}>
        <Pressable style={s.backdrop} onPress={() => setGradeModalVisible(false)}>
          <Pressable style={[s.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <Text style={[s.modalTitle, { color: colors.textSecondary }]}>Select Grade</Text>
            {GRADE_OPTIONS.map((item) => (
              <Pressable
                key={item}
                style={[s.modalRow, { borderTopColor: colors.border }]}
                onPress={() => { setGrade(item); setGradeModalVisible(false); }}
              >
                <Text style={[s.modalRowText, { color: colors.text }]}>Grade {item}</Text>
                {grade === item && <MaterialCommunityIcons name="check" size={18} color={ACCENT} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },

  avatarSection: { alignItems: "center", marginBottom: 28, marginTop: 8, gap: 12 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  avatarCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: "#facc15",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImage: { width: 92, height: 92 },
  avatarInitial: { fontSize: 32, fontWeight: "800", color: "#fff" },
  changeBtn: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  changeBtnText: { fontSize: 13, fontWeight: "700" },

  card: {
    borderRadius: 18, padding: 20, gap: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  label: {
    fontSize: 11, fontWeight: "800",
    textTransform: "uppercase", letterSpacing: 1,
    marginTop: 12, marginBottom: 6,
  },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 15,
  },
  dropdownRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  dropdownText: { fontSize: 15 },

  saveBtn: {
    backgroundColor: ACCENT, borderRadius: 999,
    paddingVertical: 15, alignItems: "center", marginTop: 20,
  },
  saveBtnDisabled: { backgroundColor: "#a5b4fc", opacity: 0.6 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },

  backdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 18, padding: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
  },
  modalTitle: {
    fontSize: 11, fontWeight: "800", textTransform: "uppercase",
    letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 10,
  },
  modalRow: {
    height: 46, borderTopWidth: 1,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 8,
  },
  modalRowText: { fontSize: 15 },
});

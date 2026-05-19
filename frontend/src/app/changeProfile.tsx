import useGetUserAvatar from "@/hooks/user/useGetUserAvatar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { getAuth, verifyBeforeUpdateEmail } from "firebase/auth";
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
import { getUserProfile, saveUserProfile } from "../services/firestore";

const GRADE_OPTIONS = ["5", "6", "7", "8", "9", "10", "11", "12"];

export default function ChangeProfile() {
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
    navigation.setOptions({ title: "Profile" });
  }, [navigation]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    getUserProfile(user.uid)
      .then((snap) => {
        const data = snap.data() || {};
        const nextName = String(data.name || "");
        const nextGrade = String(data.grade || "5");
        const nextEmail = String(data.email || user.email || "");

        setName(nextName);
        setGrade(nextGrade);
        setEmail(nextEmail);

        setInitialName(nextName);
        setInitialGrade(nextGrade);
        setInitialEmail(nextEmail);
      })
      .finally(() => setLoading(false));
  }, []);

  const hasUnsavedChanges = useMemo(() => {
    return (
      name.trim() !== initialName.trim() ||
      grade !== initialGrade ||
      email.trim() !== initialEmail.trim()
    );
  }, [name, grade, email, initialName, initialGrade, initialEmail]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "Are you sure you want to proceed without saving?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Exit without saving",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your name.");
      return;
    }

    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        name: name.trim(),
        grade,
        email: email.trim(),
      });

      setInitialName(name.trim());
      setInitialGrade(grade);
      setInitialEmail(email.trim());

      Alert.alert("Success", "Profile updated successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/setting"),
        },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    router.push("/pickAvatar");
  };

  if (loading) {
    return (
      <SafeAreaView style={s.loadingScreen}>
        <ActivityIndicator size="large" color="#3977fd" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={s.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={92}
      >
        <ScrollView
          contentContainerStyle={s.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.avatarWrap}>
            <View style={s.avatarRing}>
              <View style={s.avatarCircle}>
                {avatar ? (
                  <Image source={avatar} style={s.avatarImage} />
                ) : (
                  <Text style={s.avatarText}>
                    {name?.[0]?.toUpperCase() || "?"}
                  </Text>
                )}
              </View>
            </View>

            <Pressable onPress={handleChangeAvatar} style={s.changeAvatarBtn}>
              <Text style={s.changeAvatarText}>CHANGE AVATAR</Text>
            </Pressable>
          </View>

          <View style={s.formCard}>
            <Text style={s.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#9CA3AF"
              style={s.input}
            />

            <Text style={s.label}>Grade</Text>
            <Pressable
              style={({ pressed }) => [
                s.dropdown,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setGradeModalVisible(true)}
            >
              <Text style={s.dropdownText}>Grade {grade}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color="#6B7280"
              />
            </Pressable>

            <Text style={s.label}>Email</Text>
            <TextInput
              value={email}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor="#9CA3AF"
              style={[s.input, s.disabledInput]}
            />

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                s.saveBtn,
                (pressed || saving) && { opacity: 0.85 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={gradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <Pressable
          style={s.modalBackdrop}
          onPress={() => setGradeModalVisible(false)}
        >
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Text style={s.modalTitle}>Select Grade</Text>
            {GRADE_OPTIONS.map((item) => (
              <Pressable
                key={item}
                style={({ pressed }) => [
                  s.modalRow,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setGrade(item);
                  setGradeModalVisible(false);
                }}
              >
                <Text style={s.modalRowText}>Grade {item}</Text>
                {grade === item ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={18}
                    color="#3977fd"
                  />
                ) : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8F4EF",
  },
  keyboardWrap: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 72,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: "#c5caff",
    shadowColor: "#3e4eff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fde039",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 120,
    height: 120,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },
  changeAvatarBtn: {
    paddingVertical: 4,
  },
  changeAvatarText: {
    color: "#3977fd",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#fff",
    color: "#1F2937",
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  dropdownText: {
    fontSize: 15,
    color: "#1F2937",
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3977fd",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  modalRow: {
    height: 42,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  modalRowText: {
    fontSize: 15,
    color: "#1F2937",
  },
});

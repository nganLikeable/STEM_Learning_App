import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AvatarPicker from "../components/AvatarPicker";
import { saveUserProfile } from "../services/firestore";

export default function PickAvatarScreen() {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      setLoading(true);
      const user = getAuth().currentUser;
      await saveUserProfile(user?.uid, { avatarId: selected });
      router.replace("./(tabs)");
    } catch (e) {
      console.error("Error saving profile", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AvatarPicker selected={selected} onSelect={handleSelect} />
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          disabled={!selected}
          style={[styles.saveBtn, !selected && styles.saveBtnDisabled]}
        >
          <Text style={styles.saveBtnText}>
            {selected ? "Confirm Avatar" : "Pick an avatar to continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
    borderTopWidth: 0,
  },
  saveBtn: {
    backgroundColor: "#3977fd",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

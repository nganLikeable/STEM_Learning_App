import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AvatarPicker from "../../../components/Avatar/AvatarPicker";
import { updateTeamAvatar } from "../../../services/firestore";

export default function PickTeamAvatarScreen() {
  const params = useLocalSearchParams<{ teamId?: string }>();
  const teamId = params.teamId as string | undefined;
  const router = useRouter();

  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = (id: string) => setSelected(id);

  const handleSave = async () => {
    if (!selected || !teamId) return;
    try {
      setLoading(true);
      await updateTeamAvatar(teamId, selected);
      // After saving team avatar, navigate to user avatar picker
      router.replace("/screens/profile/PickUserAvatarScreen");
    } catch (e) {
      console.error("Error saving team avatar", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AvatarPicker
        selected={selected}
        onSelect={handleSelect}
        category={"teamAvatar"}
        title="Select Team Avatar"
      />
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          disabled={!selected}
          style={[styles.saveBtn, !selected && styles.saveBtnDisabled]}
        >
          <Text style={styles.saveBtnText}>
            {selected
              ? "Confirm Team Avatar"
              : "Pick your team avatar to continue"}
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

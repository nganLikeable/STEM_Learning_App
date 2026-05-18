import { getAvatarSource } from "@/src/app/constants/avatars";
import { getCurrentUser } from "@/src/services/auth";
import { getUserAvatar } from "@/src/services/firestore";
import { useEffect, useState } from "react";

export default function useGetUserAvatar() {
  const [avatar, setAvatar] = useState<any>(null);
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;
        const avatarId = await getUserAvatar(user?.uid);
        const avatarSource = getAvatarSource(avatarId);
        setAvatar(avatarSource);
      } catch (e) {
        console.log("Error fetching avatar,", e);
      }
    };
    fetchAvatar();
  }, []);

  return avatar;
}

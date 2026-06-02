import { getAvatarSource } from "@/src/app/constants/avatars";
import { getTeamAvatar } from "@/src/services/firestore";
import { useTeamStore } from "@/src/store/team-store";
import { useEffect, useState } from "react";

export default function useGetTeamAvatar() {
  const teamId = useTeamStore((state) => state.teamId);
  const [avatar, setAvatar] = useState<any>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        if (!teamId) {
          setAvatar(null);
          return;
        }

        const avatarId = await getTeamAvatar(teamId);
        const avatarSource = avatarId ? getAvatarSource(avatarId) : null;
        setAvatar(avatarSource);
      } catch (e) {
        console.log("Error fetching team avatar,", e);
      }
    };

    fetchAvatar();
  }, [teamId]);

  return avatar;
}

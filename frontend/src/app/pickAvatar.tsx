import { useState } from "react";
import AvatarPicker from "../components/AvatarPicker";

export default function PickAvatarScreen() {
  const [avatar, setAvatar] = useState("");

  const handleSelect = (id: string) => {
    setAvatar(id);
  };

  return <AvatarPicker selected={avatar} onSelect={handleSelect} />;
}

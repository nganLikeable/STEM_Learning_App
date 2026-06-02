type AvatarItem = {
  id: string;
  source: any;
};

// define avatars - src: dicebear
export const AVATARS = {
  // group by category
  alien: [
    // generated from files in assets/images/avatars/alien
    { id: "alien_0", source: require("@/assets/images/avatars/alien/0.png") },
    { id: "alien_1", source: require("@/assets/images/avatars/alien/1.png") },
    { id: "alien_2", source: require("@/assets/images/avatars/alien/2.png") },
    { id: "alien_3", source: require("@/assets/images/avatars/alien/3.png") },
    { id: "alien_4", source: require("@/assets/images/avatars/alien/4.png") },
    { id: "alien_5", source: require("@/assets/images/avatars/alien/5.png") },
    { id: "alien_6", source: require("@/assets/images/avatars/alien/6.png") },
    { id: "alien_7", source: require("@/assets/images/avatars/alien/7.png") },
    { id: "alien_8", source: require("@/assets/images/avatars/alien/8.png") },
    { id: "alien_9", source: require("@/assets/images/avatars/alien/9.png") },
    { id: "alien_10", source: require("@/assets/images/avatars/alien/10.png") },
    { id: "alien_11", source: require("@/assets/images/avatars/alien/11.png") },
    { id: "alien_12", source: require("@/assets/images/avatars/alien/12.png") },
    { id: "alien_13", source: require("@/assets/images/avatars/alien/13.png") },
    { id: "alien_14", source: require("@/assets/images/avatars/alien/14.png") },
    { id: "alien_15", source: require("@/assets/images/avatars/alien/15.png") },
    { id: "alien_16", source: require("@/assets/images/avatars/alien/16.png") },
    { id: "alien_17", source: require("@/assets/images/avatars/alien/17.png") },
    { id: "alien_18", source: require("@/assets/images/avatars/alien/18.png") },
    { id: "alien_19", source: require("@/assets/images/avatars/alien/19.png") },
  ],
  teamAvatar: [
    {
      id: "team_0",
      source: require("@/assets/images/avatars/teamAvatar/0.png"),
    },
    {
      id: "team_1",
      source: require("@/assets/images/avatars/teamAvatar/1.png"),
    },
    {
      id: "team_2",
      source: require("@/assets/images/avatars/teamAvatar/2.png"),
    },
    {
      id: "team_3",
      source: require("@/assets/images/avatars/teamAvatar/3.png"),
    },
    {
      id: "team_4",
      source: require("@/assets/images/avatars/teamAvatar/4.png"),
    },
    {
      id: "team_5",
      source: require("@/assets/images/avatars/teamAvatar/5.png"),
    },
    {
      id: "team_6",
      source: require("@/assets/images/avatars/teamAvatar/6.png"),
    },
    {
      id: "team_7",
      source: require("@/assets/images/avatars/teamAvatar/7.png"),
    },
    {
      id: "team_8",
      source: require("@/assets/images/avatars/teamAvatar/8.png"),
    },
    {
      id: "team_9",
      source: require("@/assets/images/avatars/teamAvatar/9.png"),
    },
    {
      id: "team_10",
      source: require("@/assets/images/avatars/teamAvatar/10.png"),
    },
    {
      id: "team_11",
      source: require("@/assets/images/avatars/teamAvatar/11.png"),
    },
    {
      id: "team_12",
      source: require("@/assets/images/avatars/teamAvatar/12.png"),
    },
    {
      id: "team_alien",
      source: require("@/assets/images/avatars/teamAvatar/12.png"),
    },
  ],
};

// get avatar by id - name of image
export const getAvatarSource = (id: string) => {
  const allAvatars = [...AVATARS.teamAvatar, ...AVATARS.alien];
  return allAvatars.find((avatar) => avatar.id === id)?.source ?? null;
};

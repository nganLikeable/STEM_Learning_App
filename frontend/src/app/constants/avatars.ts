type AvatarItem = {
  id: string;
  source: any;
};

// define avatars - src: dicebear
export const AVATARS = {
  // group by category
  adventurer: [
    {
      id: "adv_1",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777468732396.png"),
    },
    {
      id: "adv_2",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470393256.png"),
    },
    {
      id: "adv_3",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470400112.png"),
    },
    {
      id: "adv_4",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470402929.png"),
    },
    {
      id: "adv_5",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470408051.png"),
    },
    {
      id: "adv_6",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470410824.png"),
    },
    {
      id: "adv_7",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470413339.png"),
    },
    {
      id: "adv_8",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470462158.png"),
    },
    {
      id: "adv_9",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470471376.png"),
    },
    {
      id: "adv_10",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470475526.png"),
    },
    {
      id: "adv_11",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470498406.png"),
    },
    {
      id: "adv_12",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470512968.png"),
    },
    {
      id: "adv_13",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470523581.png"),
    },
    {
      id: "adv_14",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470530861.png"),
    },
    {
      id: "adv_15",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470694910.png"),
    },
    {
      id: "adv_16",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470698417.png"),
    },
    {
      id: "adv_17",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470702306.png"),
    },
    {
      id: "adv_18",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470707513.png"),
    },
    {
      id: "adv_19",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470723104.png"),
    },
    {
      id: "adv_20",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470736021.png"),
    },
    {
      id: "adv_21",
      source: require("@/assets/images/avatars/adventurer/adventurer-1777470749040.png"),
    },
  ],
  neutral: [
    {
      id: "neu_1",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471230118.png"),
    },
    {
      id: "neu_2",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471232877.png"),
    },
    {
      id: "neu_3",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471235109.png"),
    },
    {
      id: "neu_4",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471237290.png"),
    },
    {
      id: "neu_5",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471240109.png"),
    },
    {
      id: "neu_6",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471243476.png"),
    },
    {
      id: "neu_7",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471245544.png"),
    },
    {
      id: "neu_8",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471247522.png"),
    },
    {
      id: "neu_9",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471252188.png"),
    },
    {
      id: "neu_10",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471255339.png"),
    },
    {
      id: "neu_11",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471257912.png"),
    },
    {
      id: "neu_12",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471260374.png"),
    },
    {
      id: "neu_13",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471264295.png"),
    },
    {
      id: "neu_14",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471267355.png"),
    },
    {
      id: "neu_15",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471269042.png"),
    },
    {
      id: "neu_16",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471272244.png"),
    },
    {
      id: "neu_17",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471274592.png"),
    },
    {
      id: "neu_18",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471276608.png"),
    },
    {
      id: "neu_19",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471279008.png"),
    },
    {
      id: "neu_20",
      source: require("@/assets/images/avatars/neutral/adventurerNeutral-1777471281048.png"),
    },
  ],
};

// get avatar by id - name of image
export const getAvatarSource = (id: string) => {
  const allAvatars = [...AVATARS.adventurer, ...AVATARS.neutral];
  return allAvatars.find((avatar) => avatar.id === id)?.source ?? null;
};

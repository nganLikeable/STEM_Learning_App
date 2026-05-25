export const parachuteActivity = {
  phases: [
    {
      id: 1,
      title: "Minimal canopy",
      description: "A bare setup with little surface area to slow the fall",
    },
    {
      id: 2,
      title: "Balanced canopy",
      description: "A mid-sized canopy with a simple support layout",
    },
    {
      id: 3,
      title: "Wide canopy",
      description: "A broader canopy and denser support pattern for more drag",
    },
  ],
};

export const soundPollutionActivity = {
  phases: [
    {
      id: 1,
      title: "Drop a book on the table",
      description:
        "A softer event that should stay close to the lower end of the meter",
    },
    {
      id: 2,
      title: "Drop a book on the ground",
      description:
        "A clearer event that may sit in the middle of the expected range",
    },
    {
      id: 3,
      title: "Drop a full bottle of water on the table",
      description:
        "A stronger event that is likely to push the reading toward the top end",
    },
  ],
};

export const handFanActivity = {
  phases: [
    {
      id: 1,
      title: "Far setup",
      description:
        "The airflow is weaker here, so the material may only move slightly",
    },
    {
      id: 2,
      title: "Middle setup",
      description:
        "The airflow is stronger here and may create a noticeable bend",
    },
    {
      id: 3,
      title: "Close setup",
      description:
        "The airflow is strongest here, but the stiffer material may still resist movement",
    },
  ],
};

export const earthquakeActivity = {
  phases: [
    {
      id: 1,
      title: "Light frame",
      description: "A simpler build that may shift more when vibration starts",
    },
    {
      id: 2,
      title: "Reinforced frame",
      description:
        "A build with added support that should reduce the motion somewhat",
    },
    {
      id: 3,
      title: "Stabilized frame",
      description:
        "A wider base and extra bracing that should hold the structure best",
    },
  ],
};

export const reactionBoardActivity = {
  phases: [
    {
      id: 1,
      title: "Fast start",
      description: "A phase where the response may feel familiar and immediate",
    },
    {
      id: 2,
      title: "Steady control",
      description: "A phase where accuracy may matter more than raw speed",
    },
    {
      id: 3,
      title: "Tracking challenge",
      description:
        "A phase that may demand the most focus because the target keeps changing",
    },
  ],
};

export const breathingPaceActivity = {
  phases: [
    {
      id: 1,
      title: "Settled breathing",
      description:
        "A calm baseline where the body is still easing into the test",
    },
    {
      id: 2,
      title: "Raised breathing",
      description:
        "A phase where the rhythm may become noticeably faster after movement",
    },
    {
      id: 3,
      title: "Peak breathing",
      description:
        "A phase where the breathing rate is likely to be at its highest",
    },
  ],
};

export const humanPerformanceActivity = {
  phases: [
    {
      id: 1,
      title: "Controlled motion",
      description:
        "A gentler movement pattern that may keep the sensor reading lower",
    },
    {
      id: 2,
      title: "Mixed motion",
      description:
        "A middle-ground movement pattern that may create a moderate response",
    },
    {
      id: 3,
      title: "Dynamic motion",
      description:
        "A faster movement pattern that may create the largest sensor response",
    },
  ],
};

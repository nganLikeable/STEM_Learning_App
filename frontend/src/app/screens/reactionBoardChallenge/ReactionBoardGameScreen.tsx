import TapReactionGame from "@/src/features/reactionBoard/tap/TapReactionGame";
import TracingGame from "@/src/features/reactionBoard/tracing/TracingGame";
import { useState } from "react";

type Phase = "dominant" | "non-dominant" | "tracing";

export default function ReactionBoardGameScreen() {
  const [phase, setPhase] = useState<Phase>("dominant");

  const handleNext = () => {
    if (phase === "dominant") setPhase("non-dominant");
    else if (phase === "non-dominant") setPhase("tracing");
  };

  if (phase === "dominant" || phase === "non-dominant")
    return <TapReactionGame phase={phase} onNext={handleNext} />;
  else return <TracingGame />;
}

import { getActiveSession } from "@/src/services/session";
import { useEffect, useState } from "react";

interface JourneyParams {
  titles: string[];
  pathIDs: string[];
  activityId?: number;
}

// extract user design inputs to show
export function usePatchedJourneyData(
  teamId: string | null,
  rawJourneyData?: string,
) {
  const [patchedString, setPatchedString] = useState<string>(
    rawJourneyData || "",
  );
  const [patchedObject, setPatchedObject] = useState<JourneyParams | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const patchData = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        const activeSession = await getActiveSession(teamId);
        const savedDesigns = activeSession?.designs ?? [];

        // Parse baseline incoming journey data if it exists
        let baseObj: JourneyParams = rawJourneyData
          ? JSON.parse(rawJourneyData)
          : { titles: [], pathIDs: [] };

        if (savedDesigns.length === 3) {
          const cleanTitles = savedDesigns.map(
            (d) => d.title.trim() || `Design ${d.id}`,
          );

          // Patch the titles array
          baseObj.titles = cleanTitles;

          setPatchedObject(baseObj);
          setPatchedString(JSON.stringify(baseObj));
        } else if (rawJourneyData) {
          // If no database designs found, fallback to parsed raw stream parameters
          setPatchedObject(baseObj);
        }
      } catch (e) {
        console.error("Error patching journey data inside hook:", e);
      } finally {
        setIsLoading(false);
      }
    };

    patchData();
  }, [teamId, rawJourneyData]);

  return { patchedString, patchedObject, isLoading };
}

import { MutableRefObject, useRef, useState } from "react";
import { PanResponder } from "react-native";
import { Point } from "./types";

type Layout = { x: number; y: number; width: number };
type StatusRef = MutableRefObject<string>;

const VIEWBOX_SIZE = 100;

function screenToSvg(screenX: number, screenY: number, layout: Layout): Point {
  const scale = VIEWBOX_SIZE / layout.width;
  return {
    x: (screenX - layout.x) * scale,
    y: (screenY - layout.y) * scale,
  };
}

// track tracing finger points
// listen to finger gestures => convert to svg coord => store trail points => return panresponder
export default function useTracingInput(
  statusRef: StatusRef,
  layoutRef: MutableRefObject<Layout>,
) {
  const [trail, setTrail] = useState<Point[]>([]);
  const trailRef = useRef<Point[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      // call when user first touches screen
      onStartShouldSetPanResponder: () => statusRef.current === "tracing",

      // called when finger moves
      onMoveShouldSetPanResponder: () => statusRef.current === "tracing",

      // called when tracing begins
      onPanResponderGrant: (e) => {
        const pt = screenToSvg(
          e.nativeEvent.pageX,
          e.nativeEvent.pageY,
          layoutRef.current,
        );
        trailRef.current = [pt];
        setTrail([pt]);
      },

      // called repeatedly when finger moves
      onPanResponderMove: (e) => {
        const pt = screenToSvg(
          e.nativeEvent.pageX,
          e.nativeEvent.pageY,
          layoutRef.current,
        );
        trailRef.current.push(pt);

        // updates every 3 points
        if (trailRef.current.length % 3 === 0) {
          setTrail([...trailRef.current]);
        }
      },
    }),
  ).current;
  const resetTrail = () => {
    trailRef.current = [];
    setTrail([]);
  };

  return {
    trail,
    trailRef,
    panResponder,
    resetTrail,
  };
}

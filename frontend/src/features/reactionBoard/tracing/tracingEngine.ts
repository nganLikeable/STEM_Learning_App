import { svgPathProperties } from "svg-path-properties";
import { Point, TracingResult } from "./types";

const ACCURACY_THRESHOLD = 5;

// sample svg path d string into N evenly-spaced {x,y} points
export function samplePath(d: string, samples = 300): Point[] {
  const props = new svgPathProperties(d);
  const length = props.getTotalLength();
  const result: Point[] = [];

  if (samples <= 1) {
    const p = props.getPointAtLength(0);
    return [{ x: p.x, y: p.y }];
  }

  for (let i = 0; i < samples; i++) {
    const p = props.getPointAtLength((length * i) / (samples - 1));
    result.push({ x: p.x, y: p.y });
  }

  return result;
}

// compare finger point to the shape
export function getNearestDistance(a: Point, samples: Point[]) {
  // a: finger point
  // samples: list of points of svg shape

  // start with nothing
  let min = Infinity;

  // check every single point
  for (const p of samples) {
    // distance of point with finger point
    const d = Math.hypot(a.x - p.x, a.y - p.y);
    min = Math.min(d, min);
  }
  return min;
}

// calculate the tracing result
export function getTracingResult(
  trail: Point[],
  samples: Point[],
): TracingResult {
  if (trail.length === 0)
    return { accuracy: 0, avgOffsetPx: 0, totalTracingPoints: 0 };

  // n.o on-track points
  let onPath = 0;
  let totalDistance = 0;

  for (const fp of trail) {
    const d = getNearestDistance(fp, samples);
    totalDistance += d;
    if (d <= ACCURACY_THRESHOLD) onPath++;
  }

  return {
    accuracy: Math.round((onPath / trail.length) * 100),
    avgOffsetPx: Math.round(totalDistance / trail.length), // average error per point
    totalTracingPoints: trail.length,
  };
}

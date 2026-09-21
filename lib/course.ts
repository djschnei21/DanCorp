import { ICE, ISOBATHS, LAND, LAKES, PLACARDS, RELIEF, RIVERS, type Placard, type Ring } from "./chart";
import type { Place } from "./places";

export const CHART_WIDTH = 800;
export const CHART_HEIGHT = 440;
const PAD = 72;

export type Point = { x: number; y: number };

export type Frame = {
  project(lon: number, lat: number): Point;
  unproject(point: Point): { lon: number; lat: number };
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number };
  from: Point;
  to: Point;
};

export type CourseLayout = {
  frame: Frame;
  bend: Point;
  progress: number;
  marker: Point;
  degrees: number;
  flownPath: string;
  aheadPath: string;
};

// Screen y grows downward, so this angle is the SVG rotate() for a marker that points along +x.
export function headingDegrees(from: Point, bend: Point, to: Point, t: number): number {
  const vector = tangent(from, bend, to, t);
  const length = Math.hypot(vector.x, vector.y);
  const dx = length > 1e-4 ? vector.x : to.x - from.x;
  const dy = length > 1e-4 ? vector.y : to.y - from.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function layCourse(origin: Place, destination: Place, flown: number): CourseLayout {
  const frame = frameBetween(origin, destination);
  const bend = control(frame.from, frame.to);
  const progress = Math.min(1, Math.max(0, flown));
  return {
    frame,
    bend,
    progress,
    marker: quad(frame.from, bend, frame.to, progress),
    degrees: headingDegrees(frame.from, bend, frame.to, progress),
    flownPath: progress > 0 ? track(frame.from, bend, frame.to, 0, progress) : "",
    aheadPath: progress < 1 ? track(frame.from, bend, frame.to, progress, 1) : "",
  };
}

export function frameBetween(origin: Place, destination: Place): Frame {
  const minX = Math.min(origin.lon, destination.lon);
  const maxX = Math.max(origin.lon, destination.lon);
  const minY = Math.min(-origin.lat, -destination.lat);
  const maxY = Math.max(-origin.lat, -destination.lat);
  const spanX = Math.max(maxX - minX, 8);
  const spanY = Math.max(maxY - minY, 8);
  const scale = Math.min((CHART_WIDTH - PAD * 2) / spanX, (CHART_HEIGHT - PAD * 2) / spanY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const project = (lon: number, lat: number): Point => ({
    x: CHART_WIDTH / 2 + (lon - cx) * scale,
    y: CHART_HEIGHT / 2 + (-lat - cy) * scale,
  });
  const halfW = CHART_WIDTH / 2 / scale;
  const halfH = CHART_HEIGHT / 2 / scale;
  return {
    project,
    unproject(point: Point) {
      return {
        lon: cx + (point.x - CHART_WIDTH / 2) / scale,
        lat: -(cy + (point.y - CHART_HEIGHT / 2) / scale),
      };
    },
    from: project(origin.lon, origin.lat),
    to: project(destination.lon, destination.lat),
    bounds: {
      minLon: cx - halfW,
      maxLon: cx + halfW,
      minLat: -cy - halfH,
      maxLat: -cy + halfH,
    },
  };
}

export function onLand(lon: number, lat: number): boolean {
  return LAND.some((ring) => inside(ring, lon, lat));
}

export function onIce(lon: number, lat: number): boolean {
  return inside(ICE, lon, lat);
}

export function shoreDistance(lon: number, lat: number): number {
  let best = Number.POSITIVE_INFINITY;
  for (const ring of LAND) {
    for (let i = 0; i < ring.length; i += 1) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      best = Math.min(best, segmentDistance(lon, lat, a[0], a[1], b[0], b[1]));
    }
  }
  return best;
}

export function chartLabels(frame: Frame, from: Point, bend: Point, to: Point): Placard[] {
  return PLACARDS.filter((placard) => {
    if (placard.water === onLand(placard.lon, placard.lat) || onIce(placard.lon, placard.lat)) {
      return false;
    }
    const point = frame.project(placard.lon, placard.lat);
    if (point.x < 24 || point.x > CHART_WIDTH - 24 || point.y < 22 || point.y > CHART_HEIGHT - 22) {
      return false;
    }
    if (Math.hypot(point.x - from.x, point.y - from.y) < 32 || Math.hypot(point.x - to.x, point.y - to.y) < 32) {
      return false;
    }
    for (let i = 0; i <= 28; i += 1) {
      const sample = quad(from, bend, to, i / 28);
      if (Math.hypot(sample.x - point.x, sample.y - point.y) < 30) {
        return false;
      }
    }
    return true;
  });
}

export function stipple(frame: Frame): Point[] {
  const { minLon, maxLon, minLat, maxLat } = frame.bounds;
  const step = Math.max((maxLon - minLon) / 46, 0.8);
  const dots: Point[] = [];
  for (let lon = Math.floor(minLon / step) * step; lon <= maxLon; lon += step) {
    for (let lat = Math.floor(minLat / step) * step; lat <= maxLat; lat += step) {
      if (hash(lon, lat) < 0.62) {
        continue;
      }
      const jLon = lon + (hash(lon + 2, lat) - 0.5) * step * 0.7;
      const jLat = lat + (hash(lon, lat + 5) - 0.5) * step * 0.7;
      if (onLand(jLon, jLat) || onIce(jLon, jLat)) {
        continue;
      }
      const point = frame.project(jLon, jLat);
      if (point.x < 0 || point.x > CHART_WIDTH || point.y < 0 || point.y > CHART_HEIGHT) {
        continue;
      }
      dots.push(point);
    }
  }
  return dots;
}

export function graticule(frame: Frame): { meridians: Array<[Point, Point]>; parallels: Array<[Point, Point]> } {
  const { minLon, maxLon, minLat, maxLat } = frame.bounds;
  const step = gridStep(Math.max(maxLon - minLon, maxLat - minLat));
  const meridians: Array<[Point, Point]> = [];
  const parallels: Array<[Point, Point]> = [];
  for (let lon = Math.ceil(minLon / step) * step; lon < maxLon; lon += step) {
    meridians.push([frame.project(lon, minLat), frame.project(lon, maxLat)]);
  }
  for (let lat = Math.ceil(minLat / step) * step; lat < maxLat; lat += step) {
    parallels.push([frame.project(minLon, lat), frame.project(maxLon, lat)]);
  }
  return { meridians, parallels };
}

export function projectRing(frame: Frame, ring: Ring): Point[] {
  return ring.map(([lon, lat]) => frame.project(lon, lat));
}

export function smoothClosed(points: Point[]): string {
  if (points.length < 3) {
    return "";
  }
  const commands: string[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    if (i === 0) {
      commands.push(`M${n(p1.x)} ${n(p1.y)}`);
    }
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    commands.push(`C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2.x)} ${n(p2.y)}`);
  }
  commands.push("Z");
  return commands.join(" ");
}

export function smoothOpen(points: Point[]): string {
  if (points.length < 2) {
    return "";
  }
  const commands = [`M${n(points[0].x)} ${n(points[0].y)}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    commands.push(`C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2.x)} ${n(p2.y)}`);
  }
  return commands.join(" ");
}

export function landDrawings(frame: Frame): string[] {
  return LAND.map((ring) => smoothClosed(projectRing(frame, ring)));
}

export function reliefDrawings(frame: Frame): string[] {
  return RELIEF.map((ring) => smoothClosed(projectRing(frame, ring)));
}

export function lakeDrawings(frame: Frame): string[] {
  return LAKES.map((ring) => smoothClosed(projectRing(frame, ring)));
}

export function riverDrawings(frame: Frame): string[] {
  return RIVERS.map((ring) => smoothOpen(projectRing(frame, ring)));
}

export function isobathDrawings(frame: Frame): string[] {
  return ISOBATHS.map((ring) => smoothOpen(projectRing(frame, ring)));
}

export function iceDrawing(frame: Frame): string {
  return smoothClosed(projectRing(frame, ICE));
}

export function shelfWidth(frame: Frame, ring: Ring): number {
  const points = projectRing(frame, ring);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  return Math.min(22, Math.max(6, Math.hypot(maxX - minX, maxY - minY) * 0.045));
}

function gridStep(span: number): number {
  if (span > 70) {
    return 15;
  }
  if (span > 36) {
    return 10;
  }
  if (span > 16) {
    return 5;
  }
  return 2;
}

function control(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = -dy / len;
  let py = dx / len;
  if (py > 0) {
    px = -px;
    py = -py;
  }
  const bend = len * 0.16;
  return { x: (from.x + to.x) / 2 + px * bend, y: (from.y + to.y) / 2 + py * bend };
}

export function quad(from: Point, bend: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * bend.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * bend.y + t * t * to.y,
  };
}

function tangent(from: Point, bend: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: 2 * u * (bend.x - from.x) + 2 * t * (to.x - bend.x),
    y: 2 * u * (bend.y - from.y) + 2 * t * (to.y - bend.y),
  };
}

function track(from: Point, bend: Point, to: Point, start: number, end: number): string {
  const steps = Math.max(8, Math.round(28 * (end - start)));
  const parts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = start + ((end - start) * i) / steps;
    const point = quad(from, bend, to, t);
    parts.push(`${i === 0 ? "M" : "L"}${n(point.x)} ${n(point.y)}`);
  }
  return parts.join(" ");
}

function inside(ring: Ring, lon: number, lat: number): boolean {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const crosses = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) {
      hit = !hit;
    }
  }
  return hit;
}

function segmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function hash(a: number, b: number): number {
  const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function n(value: number): string {
  return value.toFixed(1);
}

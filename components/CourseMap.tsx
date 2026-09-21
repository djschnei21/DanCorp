import { PLACES, type Place } from "@/lib/places";

const WIDTH = 800;
const HEIGHT = 380;
const PAD = 78;

const GREY = "#8d8b84";
const ORANGE = "#f54e00";
const INK = "#edecec";

type Point = { x: number; y: number };

function project(place: Place): Point {
  return { x: place.lon, y: -place.lat };
}

function fit(a: Point, b: Point): { from: Point; to: Point } {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const spanX = Math.max(maxX - minX, 8);
  const spanY = Math.max(maxY - minY, 8);
  const scale = Math.min((WIDTH - PAD * 2) / spanX, (HEIGHT - PAD * 2) / spanY);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const map = (point: Point): Point => ({
    x: WIDTH / 2 + (point.x - cx) * scale,
    y: HEIGHT / 2 + (point.y - cy) * scale,
  });
  return { from: map(a), to: map(b) };
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
  const bend = len * 0.28;
  return { x: (from.x + to.x) / 2 + px * bend, y: (from.y + to.y) / 2 + py * bend };
}

function quad(from: Point, bend: Point, to: Point, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * bend.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * bend.y + t * t * to.y,
  };
}

function path(from: Point, bend: Point, to: Point, start: number, end: number): string {
  const steps = Math.max(8, Math.round(28 * (end - start)));
  const parts: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = start + ((end - start) * i) / steps;
    const point = quad(from, bend, to, t);
    parts.push(`${i === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }
  return parts.join(" ");
}

function labelAnchor(point: Point): "start" | "middle" | "end" {
  if (point.x < 130) {
    return "start";
  }
  if (point.x > WIDTH - 130) {
    return "end";
  }
  return "middle";
}

export function CourseMap({
  origin,
  destination,
  flown,
}: {
  origin: string;
  destination: string;
  flown: number;
}) {
  const originPlace = PLACES[origin];
  const destinationPlace = PLACES[destination];
  if (!originPlace || !destinationPlace) {
    return null;
  }

  const progress = Math.min(1, Math.max(0, flown));
  const { from, to } = fit(project(originPlace), project(destinationPlace));
  const bend = control(from, to);
  const marker = quad(from, bend, to, progress);
  const grey = path(from, bend, to, progress, 1);
  const orange = progress > 0 ? path(from, bend, to, 0, progress) : "";
  const percent = Math.round(progress * 100);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Course from ${origin} to ${destination}, ${percent}% flown`}
      className="h-auto w-full"
    >
      <rect width={WIDTH} height={HEIGHT} fill="#14120b" />
      {Array.from({ length: 9 }, (_, index) => {
        const x = (WIDTH / 8) * index;
        const y = (HEIGHT / 6) * index;
        return (
          <g key={index} stroke="rgba(237,236,236,0.08)" strokeWidth="1">
            {x <= WIDTH ? <line x1={x} y1="0" x2={x} y2={HEIGHT} /> : null}
            {y <= HEIGHT ? <line x1="0" y1={y} x2={WIDTH} y2={y} /> : null}
          </g>
        );
      })}
      {progress < 1 ? (
        <path d={grey} fill="none" stroke={GREY} strokeWidth="4" strokeLinecap="round" />
      ) : null}
      {orange ? (
        <path d={orange} fill="none" stroke={ORANGE} strokeWidth="10" strokeLinecap="round" opacity="0.35" />
      ) : null}
      {orange ? <path d={orange} fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" /> : null}
      <CourseEnd point={from} place={originPlace} label={origin} arrived={false} />
      <CourseEnd point={to} place={destinationPlace} label={destination} arrived={progress === 1} />
      {progress > 0 && progress < 1 ? (
        <g>
          <circle cx={marker.x} cy={marker.y} r="11" fill={ORANGE} opacity="0.28" />
          <circle cx={marker.x} cy={marker.y} r="5.5" fill={ORANGE} stroke="#14120b" strokeWidth="2" />
        </g>
      ) : null}
    </svg>
  );
}

function CourseEnd({
  point,
  place,
  label,
  arrived,
}: {
  point: Point;
  place: Place;
  label: string;
  arrived: boolean;
}) {
  const fill = arrived ? ORANGE : INK;
  const labelY = point.y > HEIGHT - 52 ? point.y - 16 : point.y + 22;
  return (
    <g>
      {place.kind === "station" ? (
        <circle cx={point.x} cy={point.y} r="9" fill="none" stroke={fill} strokeWidth="1.5" />
      ) : null}
      <circle cx={point.x} cy={point.y} r="4.5" fill={fill} />
      <text
        x={point.x}
        y={labelY}
        textAnchor={labelAnchor(point)}
        fill={INK}
        fontSize="15"
        fontFamily="Manrope, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

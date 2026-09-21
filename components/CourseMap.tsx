import {
  CHART_HEIGHT,
  CHART_WIDTH,
  chartLabels,
  graticule,
  iceDrawing,
  isobathDrawings,
  lakeDrawings,
  landDrawings,
  layCourse,
  projectRing,
  reliefDrawings,
  riverDrawings,
  shelfWidth,
  smoothClosed,
  stipple,
} from "@/lib/course";
import { LAND } from "@/lib/chart";
import { PLACES, type Place } from "@/lib/places";

const GREY = "#8d8b84";
const ORANGE = "#f54e00";
const INK = "#edecec";
const SEA = "#0c1214";

type Point = { x: number; y: number };

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

  const course = layCourse(originPlace, destinationPlace, flown);
  const { frame, progress, marker, degrees } = course;
  const lands = landDrawings(frame);
  const shelves = LAND.map((ring) => ({
    d: smoothClosed(projectRing(frame, ring)),
    width: shelfWidth(frame, ring),
  }));
  const grid = graticule(frame);
  const labels = chartLabels(frame, frame.from, course.bend, frame.to);
  const dots = stipple(frame);
  const slug = `${origin}-${destination}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const percent = Math.round(progress * 100);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={`Course map from ${origin} to ${destination}, ${percent}% flown`}
      className="h-auto w-full"
    >
      <defs>
        <radialGradient id={`${slug}-sea`} cx="48%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#17323a" />
          <stop offset="100%" stopColor={SEA} />
        </radialGradient>
        <mask id={`${slug}-water`}>
          <rect width={CHART_WIDTH} height={CHART_HEIGHT} fill="white" />
          {lands.map((d) => (
            <path key={d} d={d} fill="black" />
          ))}
          <path d={iceDrawing(frame)} fill="black" />
        </mask>
      </defs>
      <rect width={CHART_WIDTH} height={CHART_HEIGHT} fill={`url(#${slug}-sea)`} />
      <g mask={`url(#${slug}-water)`}>
        {dots.map((dot) => (
          <circle key={`${dot.x.toFixed(1)}-${dot.y.toFixed(1)}`} cx={dot.x} cy={dot.y} r="1.05" fill="#9bb0b4" opacity="0.45" />
        ))}
        {isobathDrawings(frame).map((d) => (
          <path key={d} d={d} fill="none" stroke="#7ea4ae" strokeWidth="1" opacity="0.35" />
        ))}
      </g>
      <path d={iceDrawing(frame)} fill="#d5e0dc" opacity="0.22" stroke="#e7eeea" strokeWidth="1" />
      {shelves.map((shelf) => (
        <path key={shelf.d} d={shelf.d} fill="none" stroke="#1a4550" strokeWidth={shelf.width} strokeLinejoin="round" />
      ))}
      {lands.map((d) => (
        <path key={d} d={d} fill="#3e4633" />
      ))}
      {reliefDrawings(frame).map((d) => (
        <path key={d} d={d} fill="#4d5840" />
      ))}
      {lakeDrawings(frame).map((d) => (
        <path key={d} d={d} fill="#14343c" />
      ))}
      {riverDrawings(frame).map((d) => (
        <path key={d} d={d} fill="none" stroke="#1a4c56" strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {lands.map((d) => (
        <path key={`coast-${d}`} d={d} fill="none" stroke="#0c1214" strokeWidth="2.4" />
      ))}
      {lands.map((d) => (
        <path key={`shore-${d}`} d={d} fill="none" stroke="#e4ecd8" strokeWidth="1.15" />
      ))}
      <g stroke="rgba(232,226,210,0.14)" strokeWidth="1">
        {grid.meridians.map(([a, b]) => (
          <line key={`m-${a.x.toFixed(0)}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
        {grid.parallels.map(([a, b]) => (
          <line key={`p-${a.y.toFixed(0)}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>
      <g
        fill="rgba(217,211,197,0.72)"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="12"
        letterSpacing="1.6"
      >
        {labels.map((label) => {
          const point = frame.project(label.lon, label.lat);
          return (
            <text key={label.text} x={point.x} y={point.y} textAnchor="middle">
              {label.text}
            </text>
          );
        })}
      </g>
      {progress < 1 ? (
        <path d={course.aheadPath} fill="none" stroke={GREY} strokeWidth="4" strokeLinecap="round" />
      ) : null}
      {course.flownPath ? (
        <path d={course.flownPath} fill="none" stroke={ORANGE} strokeWidth="10" strokeLinecap="round" opacity="0.35" />
      ) : null}
      {course.flownPath ? (
        <path d={course.flownPath} fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
      ) : null}
      <CourseEnd point={frame.from} place={originPlace} label={origin} arrived={false} />
      <CourseEnd point={frame.to} place={destinationPlace} label={destination} arrived={progress === 1} />
      <g transform={`translate(${CHART_WIDTH - 48} 52)`} fill="none" stroke="rgba(237,236,236,0.55)" strokeWidth="1.1">
        <circle r="13" />
        <path d="M0 -16 L0 16" />
        <path d="M-7 0 L7 0" opacity="0.45" />
        <path d="M0 -16 L4 -8 L-4 -8 Z" fill="rgba(237,236,236,0.8)" stroke="none" />
        <text y="-22" textAnchor="middle" fill={INK} stroke="none" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace">
          N
        </text>
      </g>
      {progress > 0 && progress < 1 ? (
        <g transform={`translate(${marker.x.toFixed(1)} ${marker.y.toFixed(1)}) rotate(${degrees.toFixed(1)})`}>
          <circle r="16" fill={SEA} />
          <polygon points="22,0 -14,9.2 -5.5,0 -14,-9.2" fill={ORANGE} stroke="#0c1214" strokeWidth="1.4" strokeLinejoin="round" />
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
  const labelY = point.y > CHART_HEIGHT - 52 ? point.y - 16 : point.y + 22;
  const anchor = point.x < 130 ? "start" : point.x > CHART_WIDTH - 130 ? "end" : "middle";
  return (
    <g>
      {place.kind === "station" ? (
        <circle cx={point.x} cy={point.y} r="9" fill="none" stroke={fill} strokeWidth="1.5" />
      ) : null}
      <circle cx={point.x} cy={point.y} r="4.5" fill={fill} />
      <text x={point.x} y={labelY} textAnchor={anchor} fill={INK} fontSize="15" fontFamily="Manrope, sans-serif">
        {label}
      </text>
    </g>
  );
}

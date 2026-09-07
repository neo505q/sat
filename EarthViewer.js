import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const IconBase = ({ children, size = 18, strokeWidth = 1.75, filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const svgProps = (size, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

const House = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const MousePointer2 = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
  </svg>
);

const Ruler = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
);

const LayersIcon = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </svg>
);

const Eye = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RotateCw = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

const Sun = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const Earth = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" />
    <path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17" />
    <path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const OrbitIcon = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M20.341 6.484A10 10 0 0 1 10.266 21.85" />
    <path d="M3.659 17.516A10 10 0 0 1 13.74 2.152" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="19" cy="5" r="2" />
    <circle cx="5" cy="19" r="2" />
  </svg>
);

const RefreshCcw = ({ size = 18, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
const FastForward = (props) => (
  <IconBase {...props}>
    <path d="M5 5l7 7-7 7V5z" />
    <path d="M13 5l7 7-7 7V5z" />
  </IconBase>
);

const RewindIcon = (props) => (
  <IconBase {...props}>
    <path d="M19 5l-7 7 7 7V5z" />
    <path d="M11 5l-7 7 7 7V5z" />
  </IconBase>
);

const Pause = (props) => (
  <IconBase {...props}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </IconBase>
);

const Play = (props) => (
  <IconBase {...props}>
    <path d="M6 4l14 8-14 8V4z" />
  </IconBase>
);

const ChevronLeftIcon = ({ size = 16, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = ({ size = 16, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}><path d="m9 18 6-6-6-6" /></svg>
);
const AlignJustifyIcon = ({ size = 16, strokeWidth = 2 }) => (
  <svg {...svgProps(size, strokeWidth)}>
    <path d="M3 5h18" /><path d="M3 12h18" /><path d="M3 19h18" />
  </svg>
);

const CAMERA_DESTINATION = Cesium.Cartesian3.fromDegrees(77, 13, 20000000);
const POSITION_UPDATE_INTERVAL_MS = 250;
const MAX_SELECTED = 20;
const TRAIL_MINUTES = 100;
const GLOBAL_ORBIT_MAX = 2000; // perf cap — drawing all ~2000 objects' full paths at once will tank frame rate
const GLOBAL_ORBIT_STEP_MINUTES = 2;
const LOOKAHEAD_MINUTES = 2880;
const COARSE_STEP_MIN = 5;

function selectionKey(entry) {
  return entry?.entity?.name ?? entry?.entity?.id;
}

function dedupeSelection(entries) {
  const unique = new Map();
  entries.forEach((entry) => {
    const key = selectionKey(entry);
    if (key != null && !unique.has(key)) unique.set(key, entry);
  });
  return Array.from(unique.values()).slice(0, MAX_SELECTED);
}

const TRAIL_COLORS = [
  '#38bdf8', '#f59e0b', '#f472b6', '#a78bfa', '#34d399', '#fb7185', '#fbbf24', '#60a5fa',
  '#22d3ee', '#c084fc', '#facc15', '#4ade80', '#fb923c', '#f87171', '#818cf8', '#2dd4bf',
  '#e879f9', '#a3e635', '#38bdf8', '#f472b6',
];

const glowTextureCache = new Map();
function getGlowTexture(hexColor) {
  if (glowTextureCache.has(hexColor)) return glowTextureCache.get(hexColor);
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `${hexColor}ff`);
  gradient.addColorStop(0.25, `${hexColor}cc`);
  gradient.addColorStop(0.6, `${hexColor}33`);
  gradient.addColorStop(1, `${hexColor}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const url = canvas.toDataURL();
  glowTextureCache.set(hexColor, url);
  return url;
}

async function loadCountryBorderLines(url, viewer, strokeColor, attemptsLeft = 3) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson = await response.json();
    const entities = [];
    geojson.features.forEach((feature) => {
      const geometry = feature.geometry;
      if (!geometry) return;
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
      polygons.forEach((polygon) => {
        polygon.forEach((ring) => {
          if (ring.length < 2) return;
          const positions = ring.flatMap(([lon, lat]) => [lon, lat]);
          entities.push(viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(positions),
              width: 1,
              material: strokeColor,
              arcType: Cesium.ArcType.GEODESIC,
            },
          }));
        });
      });
    });
    return entities;
  } catch (error) {
    if (attemptsLeft <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, 800));
    return loadCountryBorderLines(url, viewer, strokeColor, attemptsLeft - 1);
  }
}

const COLOR_MODES = [
  { value: 'inclination', label: 'Inclination' },
  { value: 'orbit', label: 'Orbit' },
  { value: 'starlink-shell', label: 'Starlink Shells' },
  { value: 'launch-age', label: 'Launch Age' },
  { value: 'mass', label: 'Satellite Mass' },
];

const MODE_LEGENDS = {
  inclination: [
    ['Equatorial', '#38bdf8'], ['Low-inclination', '#a3e635'], ['Mid-inclination', '#f59e0b'],
    ['Polar / Sun-sync', '#f472b6'], ['Retrograde', '#a78bfa'], ['Debris', '#ef6674'],
  ],
  orbit: [
    ['LEO', '#3b82f6'], ['MEO', '#06b6d4'], ['GEO', '#f59e0b'], ['HEO / Elliptical', '#a855f7'], ['Debris', '#ef6674'],
  ],
  'starlink-shell': [
    ['Gen1-I', '#3b82f6'], ['Gen1-II', '#10b981'], ['Gen1-Transit', '#60a5fa'], ['Gen2', '#f97316'],
    ['Gen2-Transit', '#d4a373'], ['Polar', '#c026d3'], ['SSO Shell 1', '#f43f5e'], ['SSO Shell 2', '#f472b6'], ['Other', '#6b7280'],
  ],
  'launch-age': [
    ['≤ 7 days', '#22c55e'], ['≤ 30 days', '#84cc16'], ['≤ 90 days', '#facc15'], ['≤ 1 year', '#f97316'],
    ['≤ 5 years', '#ef4444'], ['> 5 years', '#7e57c2'], ['Unknown', '#6b7280'],
  ],
  mass: [
    ['Pico/Nano 0–10 kg', '#22d3ee'], ['Small 10–100 kg', '#22c55e'], ['Mid-size 100–500 kg', '#facc15'],
    ['Medium 500–1,000 kg', '#d97706'], ['Large 1,000–10,000 kg', '#ef4444'], ['Unknown', '#6b7280'],
  ],
};

function stableHash(value = '') {
  return Array.from(value).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
}

// --- LEO Structures (shell explode view) -----------------------------------
// Real LEO shells sit only tens/hundreds of km apart, which is invisible from
// a global camera. "Structures" mode buckets every visible satellite into an
// altitude shell, then exaggerates the radius of each shell outward so the
// constellation's layered geometry becomes readable, while keeping each
// satellite's true longitude/latitude/inclination so the shell's shape
// (polar ring, walker pattern, etc.) is still accurate.
const STRUCTURE_SHELL_BUCKET_KM = 40; // altitudes within this band count as one shell
const STRUCTURE_ALTITUDE_EXPANSION = 9; // how much to exaggerate real altitude
const STRUCTURE_BASE_LIFT_KM = 300; // minimum lift so the innermost shell clears the globe/atmosphere
const STRUCTURE_MAX_POINTS = 6000; // perf ceiling for point primitives in structures mode

function shellKeyForAltitude(altitudeKm) {
  const safeAltitude = Number.isFinite(altitudeKm) ? altitudeKm : 550;
  return Math.round(safeAltitude / STRUCTURE_SHELL_BUCKET_KM) * STRUCTURE_SHELL_BUCKET_KM;
}

function structureDisplayAltitudeM(shellAltitudeKm) {
  return (STRUCTURE_BASE_LIFT_KM + shellAltitudeKm * STRUCTURE_ALTITUDE_EXPANSION) * 1000;
}

function structureColorForShell(shellAltitudeKm) {
  return TRAIL_COLORS[stableHash(String(shellAltitudeKm)) % TRAIL_COLORS.length];
}

function getDisplayCartesian(entry, mode, time) {
  const cartesian = entry.entity.position?.getValue(time ?? Cesium.JulianDate.now());
  if (!cartesian) return undefined;
  if (mode !== 'structures') return cartesian;
  const carto = Cesium.Cartographic.fromCartesian(cartesian);
  if (!carto) return cartesian;
  const shellAltitudeKm = shellKeyForAltitude(carto.height / 1000);
  return Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, structureDisplayAltitudeM(shellAltitudeKm));
}

function entryColor(entry, mode) {
  const name = (entry.entity.name || '').toUpperCase();
  const metadata = entry.entity.sourceObject || {};
  if (entry.objectType === 'debris') return '#ef6674';
  const legend = MODE_LEGENDS[mode] || MODE_LEGENDS.inclination;
  if (mode === 'inclination') return inclinationBand(Cesium.Math.toDegrees(entry.satrec.inclo)).color;
  if (mode === 'orbit') {
    const altitude = Number(entry.entity.currentAltitudeKm || 550);
    if (altitude < 2000) return '#3b82f6';
    if (altitude < 30000) return '#06b6d4';
    if (altitude < 36000) return '#f59e0b';
    return '#a855f7';
  }
  if (mode === 'starlink-shell') {
    if (!name.includes('STARLINK')) return legend[legend.length - 1][1];
    return legend[stableHash(name) % (legend.length - 1)][1];
  }
  if (mode === 'launch-age') {
    const ageDays = Number(metadata.launch_age_days ?? metadata.launchAgeDays);
    if (!Number.isFinite(ageDays)) return legend[legend.length - 1][1];
    if (ageDays <= 7) return legend[0][1];
    if (ageDays <= 30) return legend[1][1];
    if (ageDays <= 90) return legend[2][1];
    if (ageDays <= 365) return legend[3][1];
    if (ageDays <= 1825) return legend[4][1];
    return legend[5][1];
  }
  if (mode === 'mass') {
    const mass = Number(metadata.mass_kg ?? metadata.massKg);
    if (!Number.isFinite(mass)) return legend[legend.length - 1][1];
    if (mass <= 10) return legend[0][1];
    if (mass <= 100) return legend[1][1];
    if (mass <= 500) return legend[2][1];
    if (mass <= 1000) return legend[3][1];
    return legend[4][1];
  }
  return legend[0][1];
}

function matchesFilter(name, objectType, mode) {
  const normalized = (name || '').toUpperCase();
  switch (mode) {
    case 'satellite': return objectType === 'satellite';
    case 'debris': return objectType === 'debris';
    case 'starlink': return normalized.includes('STARLINK');
    case 'station': return normalized.includes('ISS') || normalized.includes('STATION') || normalized.includes('TIANGONG');
    case 'gps': return normalized.includes('GPS') || normalized.includes('NAVSTAR') || normalized.includes('GLONASS') || normalized.includes('GALILEO');
    default: return true;
  }
}

function distanceKm(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function inclinationBand(degrees) {
  if (degrees < 30) return { name: 'Equatorial', color: '#38bdf8' };
  if (degrees < 60) return { name: 'Low-inclination', color: '#a3e635' };
  if (degrees < 85) return { name: 'Mid-inclination', color: '#f59e0b' };
  if (degrees <= 100) return { name: 'Polar / Sun-sync', color: '#f472b6' };
  return { name: 'Retrograde', color: '#a78bfa' };
}

function severityOf(km) {
  if (km < 5) return 'critical';
  if (km < 50) return 'warning';
  return 'safe';
}

function formatWhen(time, from) {
  if (!time) return '—';
  const difference = time - from;
  if (difference <= 90000) return 'NOW';
  const totalMinutes = Math.round(difference / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `in ${hours}h ${minutes}m` : `in ${minutes}m`;
}

function findClosestApproach(satrecA, satrecB, startDate) {
  let best = { distanceKm: Infinity, time: null };
  for (let minute = 0; minute <= LOOKAHEAD_MINUTES; minute += COARSE_STEP_MIN) {
    const time = new Date(startDate.getTime() + minute * 60000);
    const pvA = satellite.propagate(satrecA, time);
    const pvB = satellite.propagate(satrecB, time);
    if (!pvA?.position || !pvB?.position) continue;
    const distance = distanceKm(pvA.position, pvB.position);
    if (distance < best.distanceKm) best = { distanceKm: distance, time };
  }
  if (best.time) {
    const refineStart = new Date(best.time.getTime() - COARSE_STEP_MIN * 60000);
    for (let second = 0; second <= COARSE_STEP_MIN * 2 * 60; second += 15) {
      const time = new Date(refineStart.getTime() + second * 1000);
      const pvA = satellite.propagate(satrecA, time);
      const pvB = satellite.propagate(satrecB, time);
      if (!pvA?.position || !pvB?.position) continue;
      const distance = distanceKm(pvA.position, pvB.position);
      if (distance < best.distanceKm) best = { distanceKm: distance, time };
    }
  }
  return best;
}

const EarthViewer = React.forwardRef(({ objects, onObjectClick, tcaMarker, avoidancePath }, ref) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const handlerRef = useRef(null);
  const onObjectClickRef = useRef(onObjectClick);
  const orbitEntitiesRef = useRef([]);
  const animatedOrbitEntitiesRef = useRef([]);
  const structureEntitiesRef = useRef([]);
  const globalOrbitEntitiesRef = useRef([]);
  const selectionHaloEntitiesRef = useRef([]);
  const riskHighlightEntitiesRef = useRef([]);
  const tcaMarkerEntitiesRef = useRef([]);
  const avoidancePathEntitiesRef = useRef([]);
  const hoverHighlightRef = useRef(null);
  const mapSettingEntitiesRef = useRef([]);
  const baseImageryLayerRef = useRef(null);
  const nightLightsLayerRef = useRef(null);
  const simpleMapLayerRef = useRef(null);
  const bordersDataSourceRef = useRef(null);
  const satelliteEntriesRef = useRef([]);
  const lastPositionUpdateRef = useRef(0);
  const setSelectedRef = useRef(null);
  const selectedIdsRef = useRef(new Set());
  const hoveredEntityRef = useRef(null);
  const leoModeRef = useRef('normal');
  const showLabelsRef = useRef(true);
  const interactionModeRef = useRef('normal');
  const measurePointsRef = useRef([]);
  const measureEntitiesRef = useRef([]);
  const panelPositionRef = useRef({ x: typeof window === 'undefined' ? 1000 : Math.max(24, window.innerWidth - 270), y: 118 });
  const conjunctionPositionRef = useRef({
    x: typeof window === 'undefined' ? 420 : Math.max(320, window.innerWidth - 730),
    y: typeof window === 'undefined' ? 570 : Math.max(180, window.innerHeight - 360),
  });

  const [selected, setSelected] = useState([]);
  const [conjunctions, setConjunctions] = useState([]);
  const objectSignature = (objects ?? [])
    .map((object) => `${object.name}|${object.type}|${object.line1}|${object.line2}`)
    .join('||');
  const stableObjectsRef = useRef({ signature: '', value: [] });
  if (stableObjectsRef.current.signature !== objectSignature) {
    stableObjectsRef.current = { signature: objectSignature, value: objects ?? [] };
  }
  const stableObjects = stableObjectsRef.current.value;
  const [computing, setComputing] = useState(false);

  const filterMode = 'all';
  const [interactionMode, setInteractionMode] = useState('normal');
  const [colorMode, setColorMode] = useState('inclination');
  const [lightingMode, setLightingMode] = useState('sun');
  const [leoMode, setLeoMode] = useState('normal');
  const [layersOpen, setLayersOpen] = useState(false);
  const [lightingMenuOpen, setLightingMenuOpen] = useState(false);
  const [leoMenuOpen, setLeoMenuOpen] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    latitudeLongitude: true,
    borders: true,
    simpleMap: true,
    groundStations: false,
    reentries: false,
    closestApproach: true,
    spaceBases: false,
    planes: false,
  });
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [selectorCollapsed, setSelectorCollapsed] = useState(false);
  const [selectorHidden, setSelectorHidden] = useState(false);
  const [collisionWatchHidden, setCollisionWatchHidden] = useState(false);
  const [collisionWatchCollapsed, setCollisionWatchCollapsed] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({ x: typeof window === 'undefined' ? 1000 : Math.max(24, window.innerWidth - 270), y: 118 });
  const [conjunctionPosition, setConjunctionPosition] = useState(conjunctionPositionRef.current);
  const [showLegend, setShowLegend] = useState(true);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [orbitsEnabled, setOrbitsEnabled] = useState(false);
  const [legendPosition, setLegendPosition] = useState({ x: typeof window === 'undefined' ? 24 : Math.max(24, window.innerWidth - 270), y: 420 });
  const [legendMenuOpen, setLegendMenuOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  setSelectedRef.current = setSelected;
  hoveredEntityRef.current = hoveredEntity;
  leoModeRef.current = leoMode;
  showLabelsRef.current = showLabels;
  interactionModeRef.current = interactionMode;

  useEffect(() => {
    selectedIdsRef.current = new Set(dedupeSelection(selected).map(selectionKey));
  }, [selected]);

  useEffect(() => {
    onObjectClickRef.current = onObjectClick;
  }, [onObjectClick]);

  const movePanel = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = panelPositionRef.current;
    const handleMove = (moveEvent) => {
      const width = 240;
      const height = 420;
      const next = {
        x: Math.min(Math.max(10, window.innerWidth - width - 10), Math.max(10, origin.x + moveEvent.clientX - startX)),
        y: Math.min(
          Math.max(76, window.innerHeight - 18 - height),
          Math.max(76, origin.y + moveEvent.clientY - startY)
        ),
      };
      panelPositionRef.current = next;
      setSelectorPosition(next);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);

  const moveConjunctionPanel = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = conjunctionPositionRef.current;
    const handleMove = (moveEvent) => {
      const width = 680;
      const height = 190;
      const next = {
        x: Math.min(Math.max(10, window.innerWidth - width - 10), Math.max(10, origin.x + moveEvent.clientX - startX)),
        y: Math.min(
          Math.max(76, window.innerHeight - 18 - height),
          Math.max(76, origin.y + moveEvent.clientY - startY)
        ),
      };
      conjunctionPositionRef.current = next;
      setConjunctionPosition(next);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);

  const legendPositionRef = useRef(legendPosition);
  const moveLegendPanel = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = legendPositionRef.current;
    const handleMove = (moveEvent) => {
      const width = 240;
      const height = 260;
      const next = {
        x: Math.min(Math.max(10, window.innerWidth - width - 10), Math.max(10, origin.x + moveEvent.clientX - startX)),
        y: Math.min(
          Math.max(76, window.innerHeight - 18 - height),
          Math.max(76, origin.y + moveEvent.clientY - startY)
        ),
      };
      legendPositionRef.current = next;
      setLegendPosition(next);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const token = process.env.REACT_APP_CESIUM_TOKEN;
    const hasIonToken = Boolean(token && token !== 'your_token_here');
    if (hasIonToken) Cesium.Ion.defaultAccessToken = token;

    const viewer = new Cesium.Viewer(containerRef.current, {
      infoBox: false,
      selectionIndicator: false,
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      sceneModePicker: false,
      baseLayerPicker: hasIonToken,
      baseLayer: hasIonToken
        ? undefined
        : Cesium.ImageryLayer.fromProviderAsync(
            Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
          ),
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.dynamicAtmosphereLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyAtmosphere.hueShift = -0.02;
    viewer.scene.skyAtmosphere.saturationShift = 0.15;
    viewer.scene.skyAtmosphere.brightnessShift = 0.1;
    viewer.scene.globe.atmosphereLightIntensity = 12.0;

    viewer.imageryLayers.layerAdded.addEventListener((layer) => {
      layer.saturation = 0.75;
      layer.contrast = 1.15;
      layer.brightness = 0.92;
      layer.gamma = 1.0;
    });
    nightLightsLayerRef.current = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default//GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
        maximumLevel: 8,
        credit: "NASA GIBS — VIIRS City Lights 2012",
      })
    );
    nightLightsLayerRef.current.dayAlpha = 0.0;
    nightLightsLayerRef.current.nightAlpha = 1.0;
    nightLightsLayerRef.current.brightness = 1.4;

    simpleMapLayerRef.current = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png",
        maximumLevel: 20,
        credit: "© Stadia Maps © OpenMapTiles © OpenStreetMap contributors",
      })
    );
    simpleMapLayerRef.current.show = false;
    simpleMapLayerRef.current.saturation = 1.0;
    simpleMapLayerRef.current.contrast = 1.0;
    simpleMapLayerRef.current.brightness = 1.0;
    simpleMapLayerRef.current.gamma = 1.0;

    viewer.scene.logarithmicDepthBuffer = true;
    viewer.scene.fog.enabled = true;
    viewer.scene.fog.density = 0.00028;
    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    viewer.scene.msaaSamples = 4;
    try {
      viewer.scene.postProcessStages.bloom.enabled = true;
      viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
      viewer.scene.postProcessStages.bloom.uniforms.contrast = 180;
      viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.3;
      viewer.scene.postProcessStages.bloom.uniforms.delta = 1;
      viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.2;
      viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5.0;
    } catch (error) {
      // Bloom is optional and may not be supported by every browser/GPU.
    }

    viewer.camera.setView({ destination: CAMERA_DESTINATION });
    viewer.clock.shouldAnimate = true;
    viewer.clock.multiplier = 1;
    viewerRef.current = viewer;
    baseImageryLayerRef.current = viewer.imageryLayers.get(0);

    const updateSelectedObject = (entry) => {
      if (!entry || !onObjectClickRef.current) return;
      onObjectClickRef.current({
        id: entry.entity.name ?? entry.entity.id,
        type: entry.objectType,
        altitude: Number(entry.entity.currentAltitudeKm ?? 0).toFixed(2),
        velocity: Number(entry.entity.currentVelocityKmS ?? 0).toFixed(3),
      });
    };

    const updateSatellitePositions = () => {
      const nowMs = Date.now();
      if (nowMs - lastPositionUpdateRef.current < POSITION_UPDATE_INTERVAL_MS) return;
      lastPositionUpdateRef.current = nowMs;
      const now = new Date(nowMs);
      satelliteEntriesRef.current.forEach((entry) => {
        const pv = satellite.propagate(entry.satrec, now);
        if (!pv?.position) return;
        const geo = satellite.eciToGeodetic(pv.position, satellite.gstime(now));
        if (!geo) return;
        const longitude = Cesium.Math.toDegrees(geo.longitude);
        const latitude = Cesium.Math.toDegrees(geo.latitude);
        const altitude = geo.height * 1000;
        if ([longitude, latitude, altitude].some(Number.isNaN)) return;
        entry.entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
        entry.entity.currentAltitudeKm = geo.height;
        if (pv.velocity) {
          const { x, y, z } = pv.velocity;
          entry.entity.currentVelocityKmS = Math.sqrt(x * x + y * y + z * z);
        }
        if (viewer.selectedEntity === entry.entity) updateSelectedObject(entry);
      });
    };

    viewer.clock.onTick.addEventListener(updateSatellitePositions);
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;
    handler.setInputAction((click) => {
      if (interactionModeRef.current === 'measure') {
        const point = viewer.scene.pickPositionSupported
          ? viewer.scene.pickPosition(click.position)
          : viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (!point) return;
        measurePointsRef.current = [...measurePointsRef.current, point].slice(-2);
        measureEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
        measureEntitiesRef.current = [];
        if (measurePointsRef.current.length === 2) {
          const [first, second] = measurePointsRef.current;
          const distanceKm = Cesium.Cartesian3.distance(first, second) / 1000;
          measureEntitiesRef.current.push(viewer.entities.add({
            polyline: {
              positions: [first, second],
              width: 3,
              material: Cesium.Color.fromCssColorString('#39ff88'),
              depthFailMaterial: Cesium.Color.fromCssColorString('#39ff88'),
            },
          }));
          measureEntitiesRef.current.push(viewer.entities.add({
            position: Cesium.Cartesian3.lerp(first, second, 0.5, new Cesium.Cartesian3()),
            label: {
              text: `${distanceKm.toFixed(2)} km`,
              font: '13px DM Mono, monospace',
              fillColor: Cesium.Color.WHITE,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('#06101ddd'),
              backgroundPadding: new Cesium.Cartesian2(8, 5),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          }));
          measurePointsRef.current = [];
        }
        viewer.scene.requestRender();
        return;
      }

      const picked = viewer.scene.pick(click.position);
      if (!picked?.id) return;
      const entry = satelliteEntriesRef.current.find((item) => item.entity === picked.id)
        || picked.id.structureSourceEntry;
      if (!entry) return;
      viewer.selectedEntity = entry.entity;
      updateSelectedObject(entry);
      setSelectedRef.current((previous) => {
        const exists = previous.find((item) => item.entity === entry.entity);
        if (exists) return previous.filter((item) => item.entity !== entry.entity);
        if (previous.length >= MAX_SELECTED) return previous;
        return dedupeSelection([...previous, entry]);
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement) => {
      const picked = movement.endPosition ? viewer.scene.pick(movement.endPosition) : null;
      const pickedId = picked?.id;
      const entry = pickedId
        ? (satelliteEntriesRef.current.find((item) => item.entity === pickedId) || pickedId.structureSourceEntry)
        : null;
      const nextHovered = entry?.entity || (pickedId && pickedId === hoverHighlightRef.current?.id ? hoveredEntityRef.current : null);
      if (hoveredEntityRef.current !== nextHovered) setHoveredEntity(nextHovered);
      if (hoverHighlightRef.current) {
        viewer.entities.remove(hoverHighlightRef.current);
        hoverHighlightRef.current = null;
      }
      if (nextHovered) {
        const hoveredEntry = entry || satelliteEntriesRef.current.find((item) => item.entity === nextHovered);
        hoverHighlightRef.current = viewer.entities.add({
          position: new Cesium.CallbackProperty(
            (time) => (hoveredEntry ? getDisplayCartesian(hoveredEntry, leoModeRef.current, time) : nextHovered.position?.getValue(time)),
            false
          ),
          point: {
            pixelSize: 20,
            color: Cesium.Color.TRANSPARENT,
            outlineColor: Cesium.Color.fromCssColorString('#39ff88'),
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }
      viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      viewer.clock.onTick.removeEventListener(updateSatellitePositions);
      if (handlerRef.current && !handlerRef.current.isDestroyed()) handlerRef.current.destroy();
      orbitEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
      animatedOrbitEntitiesRef.current.forEach(({ entity }) => viewer.entities.remove(entity));
      structureEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
      if (hoverHighlightRef.current) viewer.entities.remove(hoverHighlightRef.current);
      mapSettingEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
      mapSettingEntitiesRef.current = [];
      viewer.entities.removeAll();
      satelliteEntriesRef.current = [];
      if (!viewer.isDestroyed()) viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    orbitEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    animatedOrbitEntitiesRef.current.forEach(({ entity }) => viewer.entities.remove(entity));
    orbitEntitiesRef.current = [];
    animatedOrbitEntitiesRef.current = [];
    if (viewer.selectedEntity) viewer.selectedEntity = undefined;
    viewer.entities.suspendEvents();
    try {
      satelliteEntriesRef.current.forEach(({ entity }) => viewer.entities.remove(entity));
      satelliteEntriesRef.current = [];
      stableObjects.forEach((object) => {
        if (!object?.line1 || !object?.line2) return;
        try {
          const satrec = satellite.twoline2satrec(object.line1, object.line2);
          const objectType = object.type === 'debris' ? 'debris' : 'satellite';
          const band = inclinationBand(Cesium.Math.toDegrees(satrec.inclo));
          const entity = viewer.entities.add({
            name: object.name,
            position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
            billboard: {
              image: getGlowTexture(objectType === 'debris' ? '#ef6674' : band.color),
              width: objectType === 'debris' ? 13 : 15,
              height: objectType === 'debris' ? 13 : 15,
              disableDepthTestDistance: 0,
              scaleByDistance: new Cesium.NearFarScalar(1.0e2, 1.4, 3.0e7, 0.5),
            },
          });
          entity.sourceObject = object;
          entity.currentAltitudeKm = 0;
          entity.currentVelocityKmS = 0;
          entity.show = true;
          satelliteEntriesRef.current.push({ entity, satrec, objectType });
        } catch (error) {
          console.warn('TLE error:', error);
        }
      });
    } finally {
      viewer.entities.resumeEvents();
    }
    const retainedSelection = dedupeSelection(
      satelliteEntriesRef.current.filter((entry) => selectedIdsRef.current.has(selectionKey(entry)))
    );
    setSelected(retainedSelection);
    viewer.selectedEntity = retainedSelection[0]?.entity;
    if (retainedSelection[0]) {
      const entry = retainedSelection[0];
      onObjectClickRef.current?.({
        id: entry.entity.name ?? entry.entity.id,
        type: entry.objectType,
        altitude: Number(entry.entity.currentAltitudeKm ?? 0).toFixed(2),
        velocity: Number(entry.entity.currentVelocityKmS ?? 0).toFixed(3),
      });
    } else {
      onObjectClickRef.current?.(null);
    }
    setConjunctions([]);
    lastPositionUpdateRef.current = 0;
    viewer.scene.requestRender();
  }, [stableObjects]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    if (mapSettings.simpleMap) return; // Simple map owns lighting entirely while active.
    const { globe, skyAtmosphere } = viewer.scene;
    if (lightingMode === 'off') {
      globe.enableLighting = false;
      globe.dynamicAtmosphereLighting = false;
      globe.showGroundAtmosphere = false;
      skyAtmosphere.show = false;
    } else if (lightingMode === 'realism') {
      globe.enableLighting = true;
      globe.dynamicAtmosphereLighting = true;
      globe.showGroundAtmosphere = true;
      skyAtmosphere.show = true;
      viewer.scene.fog.enabled = true;
    } else {
      globe.enableLighting = true;
      globe.dynamicAtmosphereLighting = false;
      globe.showGroundAtmosphere = true;
      skyAtmosphere.show = true;
      viewer.scene.fog.enabled = false;
    }
    viewer.scene.requestRender();
  }, [lightingMode, mapSettings.simpleMap]);

  // Grid: purely decorative graticule. Independent of everything else.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    mapSettingEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    mapSettingEntitiesRef.current = [];

    if (mapSettings.latitudeLongitude) {
      const gridColor = Cesium.Color.fromCssColorString('#7dd3fc').withAlpha(0.45);
      for (let longitude = -180; longitude < 180; longitude += 15) {
        mapSettingEntitiesRef.current.push(viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(
              Array.from({ length: 37 }, (_, index) => [longitude, -90 + index * 5]).flat()
            ),
            width: 1.4,
            material: gridColor,
          },
        }));
      }
      for (let latitude = -75; latitude <= 75; latitude += 15) {
        mapSettingEntitiesRef.current.push(viewer.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(
              Array.from({ length: 73 }, (_, index) => [-180 + index * 5, latitude]).flat()
            ),
            width: 1.4,
            material: gridColor,
          },
        }));
      }
    }
    viewer.scene.requestRender();
  }, [mapSettings.latitudeLongitude]);

  // Simple / hi-res map switch: owns imagery visibility + land/water fill. Nothing else touches this.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const isSimple = mapSettings.simpleMap;
    if (baseImageryLayerRef.current) baseImageryLayerRef.current.show = !isSimple;
    if (nightLightsLayerRef.current) nightLightsLayerRef.current.show = !isSimple;
    if (simpleMapLayerRef.current) simpleMapLayerRef.current.show = isSimple;

    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString(isSimple ? '#0b1a33' : '#000000');

    if (isSimple) {
      // Fully, evenly lit — no day/night shading, no terminator shadow, regardless of the Light button.
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.dynamicAtmosphereLighting = false;
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.skyAtmosphere.show = true;
    } else {
      viewer.scene.globe.enableLighting = lightingMode !== 'off';
      viewer.scene.globe.dynamicAtmosphereLighting = lightingMode === 'realism';
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.skyAtmosphere.show = true;
    }

    viewer.scene.requestRender();
  }, [mapSettings.simpleMap, lightingMode]);
  // Borders: purely additive line overlay. Never touches imagery, never touches base color.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (mapSettings.borders && !bordersDataSourceRef.current) {
      bordersDataSourceRef.current = 'loading';
      loadCountryBorderLines(
        'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
        viewer,
        Cesium.Color.fromCssColorString('#8fb4e3').withAlpha(0.6)
      ).then((entities) => {
        bordersDataSourceRef.current = entities;
        viewer.scene.requestRender();
      }).catch((error) => {
        console.error('Border lines failed to load:', error);
        bordersDataSourceRef.current = null;
      });
    } else if (Array.isArray(bordersDataSourceRef.current)) {
      bordersDataSourceRef.current.forEach((entity) => {
        entity.show = mapSettings.borders;
      });
    }
    viewer.scene.requestRender();
  }, [mapSettings.borders]);

  useEffect(() => {
    satelliteEntriesRef.current.forEach((entry) => {
      entry.entity.show = matchesFilter(entry.entity.name, entry.objectType, filterMode);
    });
    viewerRef.current?.scene.requestRender();
  }, [filterMode]);

  // Cheap: point/label re-styling. Safe to re-run on every hover change — no entity teardown here.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    satelliteEntriesRef.current.forEach((entry) => {
      const isSelected = selected.some((item) => item.entity === entry.entity);
      const isHovered = hoveredEntity === entry.entity;
      const baseSize = entry.objectType === 'debris' ? 13 : 15;
      entry.entity.billboard.image = getGlowTexture(entryColor(entry, colorMode));
      entry.entity.billboard.width = isSelected ? baseSize * 1.9 : isHovered ? baseSize * 1.5 : baseSize;
      entry.entity.billboard.height = isSelected ? baseSize * 1.9 : isHovered ? baseSize * 1.5 : baseSize;
      entry.entity.label = (isSelected || isHovered) && showLabels
        ? new Cesium.LabelGraphics({
            text: entry.entity.name,
            font: '12px DM Mono, monospace',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            pixelOffset: new Cesium.Cartesian2(10, -10),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('#06101dcc'),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          })
        : undefined;
    });
    viewer.scene.requestRender();
  }, [selected, showLabels, colorMode, hoveredEntity]);

  const [riskHighlightNames, setRiskHighlightNames] = useState([]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    riskHighlightEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    riskHighlightEntitiesRef.current = [];

    riskHighlightNames.forEach((name) => {
      const entry = satelliteEntriesRef.current.find((item) => item.entity.name === name);
      if (!entry) return;
      riskHighlightEntitiesRef.current.push(viewer.entities.add({
        position: new Cesium.CallbackProperty(
          (time) => entry.entity.position.getValue(time ?? Cesium.JulianDate.now()),
          false
        ),
        billboard: {
          image: getGlowTexture('#ff2b4d'),
          width: new Cesium.CallbackProperty(() => 42 + 16 * Math.sin(Date.now() / 180), false),
          height: new Cesium.CallbackProperty(() => 42 + 16 * Math.sin(Date.now() / 180), false),
        },
      }));
    });
    viewer.scene.requestRender();
  }, [riskHighlightNames]);

  // Expensive: trails, traveling pulse, selection halos, conjunction math.
  // Only rebuilds when the actual selection or view mode changes — never on hover.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    orbitEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    animatedOrbitEntitiesRef.current.forEach(({ entity }) => viewer.entities.remove(entity));
    orbitEntitiesRef.current = [];
    animatedOrbitEntitiesRef.current = [];
    selectionHaloEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    selectionHaloEntitiesRef.current = [];

    selected.forEach((entry, index) => {
      selectionHaloEntitiesRef.current.push(viewer.entities.add({
        position: new Cesium.CallbackProperty(
          (time) => getDisplayCartesian(entry, leoMode, time),
          false
        ),
        billboard: {
          image: getGlowTexture('#ffffff'),
          width: new Cesium.CallbackProperty(() => 30 + 10 * Math.sin(Date.now() / 250), false),
          height: new Cesium.CallbackProperty(() => 30 + 10 * Math.sin(Date.now() / 250), false),
        },
      }));
      const color = Cesium.Color.fromCssColorString(TRAIL_COLORS[index % TRAIL_COLORS.length]);
      const positions = [];
      const now = new Date();
      const fixedGmst = satellite.gstime(now);
      const orbitalPeriodMinutes = entry.satrec?.no ? (2 * Math.PI) / entry.satrec.no : TRAIL_MINUTES;
      const sampleCount = Math.max(60, Math.min(240, Math.round(orbitalPeriodMinutes)));
      const stepMinutes = orbitalPeriodMinutes / sampleCount;
      for (let step = 0; step <= sampleCount; step += 1) {
        const minute = step * stepMinutes;
        const time = new Date(now.getTime() + minute * 60000);
        const pv = satellite.propagate(entry.satrec, time);
        if (!pv?.position) continue;
        const geo = satellite.eciToGeodetic(pv.position, fixedGmst);
        if (!geo) continue;
        const longitude = Cesium.Math.toDegrees(geo.longitude);
        const latitude = Cesium.Math.toDegrees(geo.latitude);
        let altitude = geo.height * 1000;
        if (leoMode === 'structures') {
          altitude = structureDisplayAltitudeM(shellKeyForAltitude(geo.height));
        }
        if ([longitude, latitude, altitude].some(Number.isNaN)) continue;
        positions.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude));
      }
      if (positions.length > 1) {
        orbitEntitiesRef.current.push(viewer.entities.add({
          polyline: {
            positions,
            width: 3,
            material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.25, taperPower: 1, color }),
            arcType: Cesium.ArcType.NONE,
          },
        }));
        const pulseLength = Math.max(6, Math.floor(positions.length * 0.08));
        const pulseEntity = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => {
              const startIndex = Math.floor((Date.now() / 50) % positions.length);
              const endIndex = Math.min(startIndex + pulseLength, positions.length);
              return positions.slice(startIndex, endIndex);
            }, false),
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.45, taperPower: 0.3, color }),
            arcType: Cesium.ArcType.NONE,
          },
        });
        animatedOrbitEntitiesRef.current.push({ entity: pulseEntity });
      }
    });

    viewer.scene.requestRender();
    if (selected.length < 2) {
      setConjunctions([]);
      return;
    }

    setComputing(true);
    const start = new Date();
    const pairs = [];
    for (let i = 0; i < selected.length; i += 1) {
      for (let j = i + 1; j < selected.length; j += 1) {
        const first = selected[i];
        const second = selected[j];
        const result = findClosestApproach(first.satrec, second.satrec, start);
        pairs.push({
          id: `${first.entity.id}__${second.entity.id}`,
          nameA: first.entity.name,
          nameB: second.entity.name,
          distanceKm: result.distanceKm,
          time: result.time,
          severity: severityOf(result.distanceKm),
        });
      }
    }
    pairs.sort((first, second) => first.distanceKm - second.distanceKm);
    setConjunctions(pairs);
    setComputing(false);
  }, [selected, leoMode, orbitsEnabled]);

  // LEO structures (shell explode) view. Independent of selection/click state —
  // it acts on every satellite currently passing the object filter, buckets
  // them into altitude shells, and renders each shell exaggerated outward so
  // the constellation's real layered geometry is visible at a glance.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return undefined;

    structureEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    structureEntitiesRef.current = [];

    if (leoMode !== 'structures') {
      satelliteEntriesRef.current.forEach((entry) => {
        entry.entity.show = matchesFilter(entry.entity.name, entry.objectType, filterMode);
      });
      viewer.scene.requestRender();
      return undefined;
    }

    const visibleEntries = satelliteEntriesRef.current
      .filter((entry) => entry.objectType !== 'debris')
      .filter((entry) => matchesFilter(entry.entity.name, entry.objectType, filterMode))
      .slice(0, STRUCTURE_MAX_POINTS);

    // Hide the normal billboards and replace each satellite with a point rendered
    // at its shell-exaggerated altitude, following its real lat/lon in real time.
    visibleEntries.forEach((entry) => {
      entry.entity.show = false;
      const shellColor = Cesium.Color.fromCssColorString(
        structureColorForShell(shellKeyForAltitude(Number(entry.entity.currentAltitudeKm)))
      );
      const structurePointEntity = viewer.entities.add({
        position: new Cesium.CallbackProperty((time) => {
          const cartesian = entry.entity.position?.getValue(time ?? Cesium.JulianDate.now());
          if (!cartesian) return undefined;
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          if (!carto) return undefined;
          const shellAltitudeKm = shellKeyForAltitude(carto.height / 1000);
          return Cesium.Cartesian3.fromRadians(
            carto.longitude,
            carto.latitude,
            structureDisplayAltitudeM(shellAltitudeKm)
          );
        }, false),
        label: {
          text: entry.entity.name,
          font: '12px DM Mono, monospace',
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          pixelOffset: new Cesium.Cartesian2(10, -10),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('#06101dcc'),
          backgroundPadding: new Cesium.Cartesian2(6, 4),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          show: new Cesium.CallbackProperty(
            () => showLabelsRef.current && (selectedIdsRef.current.has(selectionKey(entry)) || hoveredEntityRef.current === entry.entity),
            false
          ),
        },
        point: {
          pixelSize: entry.objectType === 'satellite' ? 4 : 3,
          color: shellColor.withAlpha(0.9),
          outlineWidth: 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      structurePointEntity.structureSourceEntry = entry;
      structureEntitiesRef.current.push(structurePointEntity);
    });

    viewer.scene.requestRender();

    return () => {
      satelliteEntriesRef.current.forEach((entry) => {
        entry.entity.show = matchesFilter(entry.entity.name, entry.objectType, filterMode);
      });
    };
  }, [leoMode, filterMode, stableObjects]);

  // Orbits: global on/off for orbit-path lines, independent of selection and of leoMode.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return undefined;

    globalOrbitEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    globalOrbitEntitiesRef.current = [];

    if (!orbitsEnabled) {
      viewer.scene.requestRender();
      return undefined;
    }

    const visibleEntries = satelliteEntriesRef.current
      .filter((entry) => entry.objectType !== 'debris')
      .filter((entry) => matchesFilter(entry.entity.name, entry.objectType, filterMode))
      .slice(0, GLOBAL_ORBIT_MAX);

    const now = new Date();
    const fixedGmst = satellite.gstime(now);

    visibleEntries.forEach((entry) => {
      const positions = [];
      for (let minute = 0; minute < TRAIL_MINUTES; minute += GLOBAL_ORBIT_STEP_MINUTES) {
        const time = new Date(now.getTime() + minute * 60000);
        const pv = satellite.propagate(entry.satrec, time);
        if (!pv?.position) continue;
        const geo = satellite.eciToGeodetic(pv.position, fixedGmst);
        if (!geo) continue;
        const longitude = Cesium.Math.toDegrees(geo.longitude);
        const latitude = Cesium.Math.toDegrees(geo.latitude);
        let altitude = geo.height * 1000;
        if (leoMode === 'structures') {
          altitude = structureDisplayAltitudeM(shellKeyForAltitude(geo.height));
        }
        if ([longitude, latitude, altitude].some(Number.isNaN)) continue;
        positions.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude));
      }
      if (positions.length > 1) {
        const color = Cesium.Color.fromCssColorString(TRAIL_COLORS[globalOrbitEntitiesRef.current.length % TRAIL_COLORS.length]);
        globalOrbitEntitiesRef.current.push(viewer.entities.add({
          polyline: {
            positions,
            width: 2.5,
            material: new Cesium.PolylineGlowMaterialProperty({ glowPower: 0.2, taperPower: 1, color: color.withAlpha(0.4) }),
            arcType: Cesium.ArcType.NONE,
          },
        }));
      }
    });

    viewer.scene.requestRender();
    return undefined;
  }, [orbitsEnabled, filterMode, stableObjects, leoMode]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (!autoRotate) {
      viewer.scene.postUpdate.removeEventListener(rotateScene);
      return undefined;
    }
    function rotateScene() {
      viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.00012);
    }
    viewer.scene.postUpdate.addEventListener(rotateScene);
    return () => viewer.scene.postUpdate.removeEventListener(rotateScene);
  }, [autoRotate]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) viewer.clock.shouldAnimate = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    tcaMarkerEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    tcaMarkerEntitiesRef.current = [];

    if (!tcaMarker || !tcaMarker.tca_refined) return undefined;
    const {
      tca_sat_lat: satLat,
      tca_sat_lon: satLon,
      tca_sat_alt_m: satAlt,
      tca_debris_lat: debLat,
      tca_debris_lon: debLon,
      tca_debris_alt_m: debAlt,
      tca_sat_name: satName,
      tca_debris_name: debName,
    } = tcaMarker;
    if ([satLat, satLon, satAlt, debLat, debLon, debAlt].some(
      (value) => value === null || value === undefined || Number.isNaN(value)
    )) {
      return undefined;
    }

    const satPosition = Cesium.Cartesian3.fromDegrees(satLon, satLat, satAlt);
    const debPosition = Cesium.Cartesian3.fromDegrees(debLon, debLat, debAlt);
    const normalizeName = (value) => (value ?? '')
      .replace(/\s*\[[^\]]*\]\s*$/, '')
      .trim()
      .toLowerCase();
    const findEntryByName = (target) => {
      const needle = normalizeName(target);
      if (!needle) return undefined;
      return (
        satelliteEntriesRef.current.find((item) => normalizeName(item.entity.name) === needle) ||
        satelliteEntriesRef.current.find((item) => normalizeName(item.entity.name).startsWith(needle))
      );
    };
    const satEntry = findEntryByName(satName);
    const debEntry = findEntryByName(debName);

    const satMarkerEntity = viewer.entities.add({
      position: satPosition,
      billboard: { image: getGlowTexture('#ff3b6b'), width: 26, height: 26 },
      label: {
        text: 'TCA: SAT',
        font: '11px DM Mono, monospace',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        pixelOffset: new Cesium.Cartesian2(0, -22),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#06101dcc'),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    if (satEntry) satMarkerEntity.structureSourceEntry = satEntry;
    tcaMarkerEntitiesRef.current.push(satMarkerEntity);

    const debMarkerEntity = viewer.entities.add({
      position: debPosition,
      billboard: { image: getGlowTexture('#ffb23b'), width: 22, height: 22 },
      label: {
        text: 'TCA: OBJECT',
        font: '11px DM Mono, monospace',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#06101dcc'),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
    if (debEntry) debMarkerEntity.structureSourceEntry = debEntry;
    tcaMarkerEntitiesRef.current.push(debMarkerEntity);

    tcaMarkerEntitiesRef.current.push(viewer.entities.add({
      polyline: {
        positions: [satPosition, debPosition],
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString('#ffffffaa') }),
        arcType: Cesium.ArcType.NONE,
      },
    }));

    return () => {
      tcaMarkerEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
      tcaMarkerEntitiesRef.current = [];
    };
  }, [tcaMarker]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;

    avoidancePathEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
    avoidancePathEntitiesRef.current = [];

    if (!avoidancePath || avoidancePath.length < 2) return undefined;

    const positions = avoidancePath
      .filter((point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lon) && Number.isFinite(point.alt_m))
      .map((point) => Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt_m));

    if (positions.length < 2) return undefined;

    avoidancePathEntitiesRef.current.push(viewer.entities.add({
      polyline: {
        positions,
        width: 3,
        material: Cesium.Color.fromCssColorString('#39ff88cc'),
        arcType: Cesium.ArcType.NONE,
        clampToGround: false,
      },
    }));

    avoidancePathEntitiesRef.current.push(viewer.entities.add({
      position: positions[0],
      billboard: { image: getGlowTexture('#39ff88'), width: 20, height: 20 },
      label: {
        text: 'AVOIDANCE PATH',
        font: '11px DM Mono, monospace',
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#06101dcc'),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    }));

    return () => {
      avoidancePathEntitiesRef.current.forEach((entity) => viewer.entities.remove(entity));
      avoidancePathEntitiesRef.current = [];
    };
  }, [avoidancePath]);

  React.useImperativeHandle(ref, () => ({
    focusObjectByName: (name) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      const match = satelliteEntriesRef.current.find((entry) => entry.entity.name === name);
      if (!match) return;

      setSelected((previous) => {
        if (previous.some((item) => item.entity === match.entity)) return previous;
        if (previous.length >= MAX_SELECTED) return previous;
        return [...previous, match];
      });

      viewer.selectedEntity = match.entity;
      if (onObjectClickRef.current) {
        onObjectClickRef.current({
          id: match.entity.name ?? match.entity.id,
          type: match.objectType,
          altitude: Number(match.entity.currentAltitudeKm ?? 0).toFixed(2),
          velocity: Number(match.entity.currentVelocityKmS ?? 0).toFixed(3),
        });
      }

      const position = match.entity.position?.getValue(Cesium.JulianDate.now());
      if (position) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.multiplyByScalar(
            Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3()),
            Cesium.Cartesian3.magnitude(position) + 3000000,
            new Cesium.Cartesian3()
          ),
          duration: 1.2,
        });
      }
    },
    clearRiskHighlight: () => {
      setRiskHighlightNames([]);
    },
    focusOnPair: (nameA, nameB) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      const now = Cesium.JulianDate.now();
      const normalize = (value) => (value ?? '')
        .replace(/\s*\[[^\]]*\]\s*$/, '') // strip trailing "[+270s]"-style annotations
        .trim()
        .toLowerCase();
      const findMatch = (target) => {
        const needle = normalize(target);
        if (!needle) return undefined;
        return (
          satelliteEntriesRef.current.find((entry) => normalize(entry.entity.name) === needle) ||
          satelliteEntriesRef.current.find((entry) => normalize(entry.entity.name).startsWith(needle)) ||
          satelliteEntriesRef.current.find((entry) => normalize(entry.entity.name).includes(needle))
        );
      };
      const entryA = findMatch(nameA);
      const entryB = findMatch(nameB);
      if (!entryA || !entryB) {
        console.warn('focusOnPair: could not find one or both objects.', {
          nameA, nameB,
          foundA: Boolean(entryA), foundB: Boolean(entryB),
          sampleTrackedNames: satelliteEntriesRef.current.slice(0, 5).map((entry) => entry.entity.name),
        });
        return;
      }
      setRiskHighlightNames([entryA.entity.name, entryB.entity.name]);
      const posA = entryA.entity.position.getValue(now);
      const posB = entryB.entity.position.getValue(now);
      if (!posA || !posB) return;
      const midpoint = Cesium.Cartesian3.midpoint(posA, posB, new Cesium.Cartesian3());
      const separation = Cesium.Cartesian3.distance(posA, posB);
      const height = Cesium.Cartesian3.magnitude(midpoint) + Math.max(separation * 2.5, 1500000);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3()),
          height,
          new Cesium.Cartesian3()
        ),
        duration: 1.4,
      });
    },
    openLegendPanel: () => {
      setShowLegend(true);
      setLegendCollapsed(false);

      const nextPosition = {
        x: typeof window === 'undefined'
          ? 12
          : Math.max(12, (window.innerWidth / 2) - 120),
        y: typeof window === 'undefined'
          ? 76
          : Math.max(76, (window.innerHeight / 2) - 210),
      };

      legendPositionRef.current = nextPosition;
      setLegendPosition(nextPosition);
    },

    openCollisionWatch: () => {
      setCollisionWatchHidden(false);
      setCollisionWatchCollapsed(false);

      const nextPosition = {
        x: typeof window === 'undefined'
          ? 12
          : Math.max(12, (window.innerWidth / 2) - 340),
        y: typeof window === 'undefined'
          ? 76
          : Math.max(76, (window.innerHeight / 2) - 95),
      };

      conjunctionPositionRef.current = nextPosition;
      setConjunctionPosition(nextPosition);
    },

    openSelectorPanel: () => {
      setSelectorHidden(false);
      setSelectorCollapsed(false);

      const nextPosition = {
        x: typeof window === 'undefined'
          ? 1000
          : Math.max(12, (window.innerWidth / 2) - 120),
        y: typeof window === 'undefined'
          ? 118
          : Math.max(76, (window.innerHeight / 2) - 120),
      };

      panelPositionRef.current = nextPosition;
      setSelectorPosition(nextPosition);
    },

  }));

  const removeSelected = useCallback((entity) => {
    setSelected((previous) => previous.filter((item) => item.entity !== entity));
  }, []);

  const resetCamera = useCallback(() => {
    viewerRef.current?.camera.flyTo({ destination: CAMERA_DESTINATION, duration: 0.6 });
  }, []);

  const [clockMultiplier, setClockMultiplier] = useState(1);

  const toggleSpeed = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const next = viewer.clock.multiplier === 30 ? 1 : 30;
    viewer.clock.multiplier = next;
    setClockMultiplier(next);
    setIsPlaying(true);
    viewer.clock.shouldAnimate = true;
  }, []);

  const rewind = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const next = viewer.clock.multiplier === -30 ? 1 : -30;
    viewer.clock.multiplier = next;
    setClockMultiplier(next);
    setIsPlaying(true);
    viewer.clock.shouldAnimate = true;
  }, []);

  return (
    <div className="earth-view-root">
      <div id="cesiumContainer" ref={containerRef} />

      {selected.length > 0 && !selectorHidden && (
        <div className={`globe-overlay-panel selector-panel ${selectorCollapsed ? 'selector-collapsed' : ''}`} style={{ left: `${selectorPosition.x}px`, top: `${selectorPosition.y}px`, right: 'auto' }}>
          {selectorCollapsed ? (
            <button
              className="selector-expand-button"
              type="button"
              onPointerDown={movePanel}
              onClick={() => setSelectorCollapsed(false)}
              title="Expand selector"
            >
              ☷<span>{selected.length}</span>
            </button>
          ) : (
            <>
              <div className="selector-header" onPointerDown={movePanel}>
                <span className="drag-grip" aria-hidden="true">⠿</span>
                <h4>Selector <span>{selected.length}</span></h4>
                <button type="button" className="panel-icon-button" onClick={() => setSelectorCollapsed(true)} title="Minimize">−</button>
                <button type="button" className="panel-icon-button panel-close-button" onClick={() => setSelectorHidden(true)} title="Close">✕</button>
              </div>
              {selected.map((entry, index) => (
                <div
                  className="selector-item"
                  key={entry.entity.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const viewer = viewerRef.current;
                    if (viewer) viewer.selectedEntity = entry.entity;
                    onObjectClickRef.current?.({
                      id: entry.entity.name ?? entry.entity.id,
                      type: entry.objectType,
                      altitude: Number(entry.entity.currentAltitudeKm ?? 0).toFixed(2),
                      velocity: Number(entry.entity.currentVelocityKmS ?? 0).toFixed(3),
                    });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') event.currentTarget.click();
                  }}
                >
                  <span className="dot" style={{ background: TRAIL_COLORS[index % TRAIL_COLORS.length] }} />
                  <span className="nm">{entry.entity.name}</span>
                  <button type="button" onClick={(event) => { event.stopPropagation(); removeSelected(entry.entity); }} aria-label={`Remove ${entry.entity.name}`}>×</button>
                </div>
              ))}
              <button type="button" className="selector-clear" onClick={() => setSelected([])}>Clear {selected.length}</button>
              {selected.length >= MAX_SELECTED && <div className="selector-cap">Maximum {MAX_SELECTED} selections reached</div>}
            </>
          )}
        </div>
      )}

      {selected.length >= 2 && !collisionWatchHidden && (
        <div
          className={`globe-overlay-panel conjunction-panel ${collisionWatchCollapsed ? 'panel-collapsed' : ''}`}
          style={{ left: `${conjunctionPosition.x}px`, top: `${conjunctionPosition.y}px`, right: 'auto', bottom: 'auto' }}
        >
          {collisionWatchCollapsed ? (
            <button
              className="collapsed-panel-button"
              type="button"
              onPointerDown={moveConjunctionPanel}
              onClick={() => setCollisionWatchCollapsed(false)}
              title="Expand collision watch"
            >
              <span className="panel-icon">⚠</span>
            </button>
          ) : (
            <>
              <div className="overlay-heading" onPointerDown={moveConjunctionPanel}>
                <span className="drag-grip" aria-hidden="true">⠿</span>
                <h4>Collision watch</h4>
                <span>{computing ? 'Calculating…' : `${conjunctions.length} pairs`}</span>
                <button type="button" className="panel-icon-button" onClick={() => setCollisionWatchCollapsed(true)} title="Minimize">−</button>
                <button type="button" className="panel-icon-button panel-close-button" onClick={() => setCollisionWatchHidden(true)} title="Close">✕</button>
              </div>
              {conjunctions.length === 0 && !computing ? <div className="selector-empty">No close pairs computed.</div> : conjunctions.slice(0, 6).map((conjunction) => (
                <div className={`watch-row sev-${conjunction.severity}`} key={conjunction.id}>
                  <span className={`sev-dot sev-${conjunction.severity}`} />
                  <span className="pair-name">{conjunction.nameA} <span className="vs">×</span> {conjunction.nameB}</span>
                  <span className="pair-distance">{conjunction.distanceKm.toFixed(2)} km</span>
                  <span className="watch-time">{formatWhen(conjunction.time, new Date())}</span>
                  <span className={`sev-label sev-${conjunction.severity}`}>{conjunction.severity}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {showLegend && (
        <div
          className={`globe-overlay-panel legend-panel glass-surface ${legendCollapsed ? 'panel-collapsed' : ''}`}
          style={{ left: `${legendPosition.x}px`, top: `${legendPosition.y}px`, right: 'auto' }}
        >
          {legendCollapsed ? (
            <button
              className="collapsed-panel-button"
              type="button"
              onPointerDown={moveLegendPanel}
              onClick={() => setLegendCollapsed(false)}
              title="Expand satellite filter"
            >
              <span className="panel-icon">◐</span>
            </button>
          ) : (
          <>
          <div className="legend-title-row" onPointerDown={moveLegendPanel}>
            <span className="drag-grip" aria-hidden="true">⠿</span>
            <h4>{COLOR_MODES.find((mode) => mode.value === colorMode)?.label || 'Color mode'}</h4>
            <span className="legend-count">{objects?.length || 0}</span>
            <button type="button" className="panel-icon-button" onClick={() => setLegendCollapsed(true)} title="Minimize">−</button>
            <button type="button" className="panel-icon-button panel-close-button" onClick={() => setShowLegend(false)} title="Close">✕</button>
          </div>
      
          {legendMenuOpen ? (
            <div className="legend-mode-list">
              {COLOR_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  className={colorMode === mode.value ? 'selected' : ''}
                  onClick={() => { setColorMode(mode.value); setLegendMenuOpen(false); }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              {MODE_LEGENDS[colorMode].map(([label, color]) => (
                <div className="legend-item" key={label}>
                  <span className="dot" style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
              <div className="legend-footer">Distribution based on available metadata</div>
            </>
          )}
      
          <div className="legend-nav">
            <button
              type="button"
              onClick={() => {
                const i = COLOR_MODES.findIndex((mode) => mode.value === colorMode);
                setColorMode(COLOR_MODES[(i - 1 + COLOR_MODES.length) % COLOR_MODES.length].value);
              }}
              title="Previous mode"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              type="button"
              className={legendMenuOpen ? 'active' : ''}
              onClick={() => setLegendMenuOpen((value) => !value)}
              title="All modes"
            >
              <AlignJustifyIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                const i = COLOR_MODES.findIndex((mode) => mode.value === colorMode);
                setColorMode(COLOR_MODES[(i + 1) % COLOR_MODES.length].value);
              }}
              title="Next mode"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
          </>
          )}
        </div>
      )}

      <div className="map-toolbar-wrap">
        <div className="map-toolbar glass-surface">
            <button type="button" className="tool-button" onClick={resetCamera} title="Home view"><House size={18} strokeWidth={2} /></button>
            <button type="button" className={`tool-button ${interactionMode === 'measure' ? 'active' : ''}`} onClick={() => { setInteractionMode((value) => { const next = value === 'measure' ? 'normal' : 'measure'; if (next === 'normal') { measureEntitiesRef.current.forEach((entity) => viewerRef.current?.entities.remove(entity)); measureEntitiesRef.current = []; } return next; }); setLayersOpen(false); setLightingMenuOpen(false); setLeoMenuOpen(false); }} title={interactionMode === 'measure' ? 'Switch to normal mode' : 'Switch to measure mode'}>{interactionMode === 'measure' ? <Ruler size={18} strokeWidth={2} /> : <MousePointer2 size={18} strokeWidth={2} />}</button>
            <button type="button" className={`tool-button ${layersOpen ? 'active' : ''}`} onClick={() => { setLayersOpen((value) => !value); setLightingMenuOpen(false); setLeoMenuOpen(false); }} title="Map settings"><LayersIcon size={18} strokeWidth={2} /></button>
            <button type="button" className={`tool-button ${showLabels ? 'active' : ''}`} onClick={() => setShowLabels((value) => !value)} title="Auto labels"><Eye size={18} strokeWidth={2} /></button>
            <button type="button" className={`tool-button ${autoRotate ? 'active' : ''}`} onClick={() => setAutoRotate((value) => !value)} title="Auto rotation"><RotateCw size={18} strokeWidth={2} /></button>
            <button type="button" className={`tool-button ${lightingMenuOpen ? 'active' : ''}`} onClick={() => { setLightingMenuOpen((value) => !value); setLayersOpen(false); setLeoMenuOpen(false); }} title="Lighting modes"><Sun size={18} strokeWidth={2} /></button>
            <button type="button" className={`tool-button ${leoMenuOpen ? 'active' : ''}`} onClick={() => { setLeoMenuOpen((value) => !value); setLayersOpen(false); setLightingMenuOpen(false); }} title="LEO modes"><Earth size={18} strokeWidth={2} /></button>
                                <button type="button" className={`tool-button ${orbitsEnabled ? 'active' : ''}`} onClick={() => setOrbitsEnabled((value) => !value)} title="Toggle orbit trails"><OrbitIcon size={18} strokeWidth={2} /></button>
            <span className="toolbar-divider" />
                  <button type="button" className={`time-button ${clockMultiplier === -30 ? 'active' : ''}`} onClick={rewind} title="Rewind (reverse time ×30)"><RewindIcon size={18} strokeWidth={2} /></button>
                    <button type="button" className="time-button time-play" onClick={() => setIsPlaying((value) => !value)} title="Play or pause">{isPlaying ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}</button>
                    <button type="button" className={`time-button ${clockMultiplier === 30 ? 'active' : ''}`} onClick={toggleSpeed} title="Fast-forward (×30)"><FastForward size={18} strokeWidth={2} /></button>
            <button type="button" className="time-button" onClick={resetCamera} title="Reset view"><RefreshCcw size={18} strokeWidth={2} /></button>
            <span className="fps-indicator">30<br /><small>FPS</small></span>
        </div>

        {layersOpen && (
          <div className="tool-popover layers-popover">
            <div className="tool-popover-title">Map settings</div>
            {[
                                   ['simpleMap', 'Simple map'],
                                   ['latitudeLongitude', 'Latitude / longitude'],
                                   ['borders', 'Borders'],
              ['groundStations', 'Ground stations'],
              ['reentries', 'Re-entries'],
              ['closestApproach', 'Closest approach'],
              ['spaceBases', 'Space bases'],
              ['planes', 'Planes'],
            ].map(([key, label]) => (
              <button key={key} type="button" className={mapSettings[key] ? 'selected' : ''} onClick={() => setMapSettings((previous) => ({ ...previous, [key]: !previous[key] }))}>
                <span className={`setting-check ${mapSettings[key] ? 'on' : ''}`}>{mapSettings[key] ? '✓' : '○'}</span>{label}
              </button>
            ))}
          </div>
        )}

        {lightingMenuOpen && (
          <div className="tool-popover lighting-popover">
            <div className="tool-popover-title">Lighting</div>
            {[['sun', 'Sun-lit'], ['realism', 'Realism'], ['off', 'Light off']].map(([value, label]) => (
              <button key={value} type="button" className={lightingMode === value ? 'selected' : ''} onClick={() => { setLightingMode(value); setLightingMenuOpen(false); }}>
                {label}
              </button>
            ))}
          </div>
        )}
        {leoMenuOpen && (
          <div className="tool-popover leo-popover">
            <div className="tool-popover-title">LEO view</div>
            {[['normal', 'LEO normal'], ['structures', 'LEO structures']].map(([value, label]) => (
              <button key={value} type="button" className={leoMode === value ? 'selected' : ''} onClick={() => { setLeoMode(value); setLeoMenuOpen(false); }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default EarthViewer;

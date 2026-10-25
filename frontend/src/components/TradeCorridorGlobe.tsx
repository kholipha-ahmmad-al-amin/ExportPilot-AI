import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEarthTexture } from './globe/EarthTexture';
import { useAuth } from '../context/AuthContext';
import { Anchor, ShieldCheck, Leaf, CheckCircle2 } from 'lucide-react';

export interface CorridorData {
  id: string;
  nameBn: string;
  nameEn: string;
  countryBn: string;
  countryEn: string;
  destLat: number;
  destLon: number;
  sectorKey: 'rmg' | 'jute' | 'leather' | 'ceramics';
  sectorBn: string;
  sectorEn: string;
  transitDays: number;
  routeViaBn: string;
  routeViaEn: string;
  tariffBenefitBn: string;
  tariffBenefitEn: string;
  competitorDutyBn: string;
  competitorDutyEn: string;
  carbonBunker: string;
  primaryGoodsBn: string;
  primaryGoodsEn: string;
  color: string;
}

export const CORRIDORS: CorridorData[] = [
  {
    id: 'corridor-rotterdam',
    nameBn: 'রটারডাম / হামবুর্গ বন্দর',
    nameEn: 'Rotterdam / Hamburg Port',
    countryBn: 'ইউরোপীয় ইউনিয়ন (জার্মানি ও নেদারল্যান্ডস)',
    countryEn: 'European Union (Germany & Netherlands)',
    destLat: 52.5,
    destLon: 6.0,
    sectorKey: 'jute',
    sectorBn: 'বহুমুখী পাট ও টেক্সটাইল',
    sectorEn: 'Diversified Jute & Textiles',
    transitDays: 22,
    routeViaBn: 'বঙ্গোপসাগর -> সুয়েজ খাল -> ভূমধ্যসাগর -> রটারডাম',
    routeViaEn: 'Bay of Bengal -> Suez Canal -> Mediterranean -> Rotterdam',
    tariffBenefitBn: '০% শুল্কমুক্ত (EU EBA স্কিম)',
    tariffBenefitEn: '0% Duty-Free (EU EBA Scheme)',
    competitorDutyBn: 'প্রতিযোগী দেশের শুল্ক ৯.৬% (বাংলাদেশ সম্পূর্ণ শুল্কমুক্ত)',
    competitorDutyEn: 'Competitors pay 9.6% MFN duty (Bangladesh is 0% duty-free)',
    carbonBunker: '০.১৮ কেজি CO2e/টিইইউ-কিমি',
    primaryGoodsBn: 'পাটজাত শপিং ব্যাগ, এসকেপ রোল ও ডেনিম ট্রাউজার্স',
    primaryGoodsEn: 'Jute tote bags, yarn bales, and denim trousers',
    color: '#10B981', // Emerald
  },
  {
    id: 'corridor-felixstowe',
    nameBn: 'ফেলিক্সস্টো বন্দর (লন্ডন)',
    nameEn: 'Port of Felixstowe (London)',
    countryBn: 'যুক্তরাজ্য (UK)',
    countryEn: 'United Kingdom',
    destLat: 51.96,
    destLon: 1.35,
    sectorKey: 'rmg',
    sectorBn: 'তৈরি পোশাক (RMG)',
    sectorEn: 'Ready-Made Garments (RMG)',
    transitDays: 24,
    routeViaBn: 'চট্টগ্রাম -> বাব-এল-মান্দেব -> জিব্রাল্টার -> ফেলিক্সস্টো',
    routeViaEn: 'Chattogram -> Bab-el-Mandeb -> Gibraltar -> Felixstowe',
    tariffBenefitBn: '০% শুল্ক (UK DCTS স্কিম)',
    tariffBenefitEn: '0% Duty (UK DCTS Scheme)',
    competitorDutyBn: 'প্রতিযোগী দেশের শুল্ক ১২.০% সাশ্রয়',
    competitorDutyEn: 'Saves 12.0% standard tariff vs non-preferential nations',
    carbonBunker: '০.২০ কেজি CO2e/টিইইউ-কিমি',
    primaryGoodsBn: 'কম্বড কটন টি-শার্ট ও রিসাইকেলড ডেনিম জ্যাকেট',
    primaryGoodsEn: 'Combed cotton t-shirts and recycled denim jackets',
    color: '#34D399', // Mint
  },
  {
    id: 'corridor-tokyo',
    nameBn: 'টোকিও / ইয়োকোহামা বন্দর',
    nameEn: 'Tokyo / Yokohama Port',
    countryBn: 'জাপান (Japan)',
    countryEn: 'Japan',
    destLat: 35.44,
    destLon: 139.64,
    sectorKey: 'leather',
    sectorBn: 'চামড়াজাত জুতা ও সিরামিক',
    sectorEn: 'Leather Footwear & Ceramics',
    transitDays: 14,
    routeViaBn: 'চট্টগ্রাম -> মালাক্কা প্রণালী (সিঙ্গাপুর) -> টোকিও বে',
    routeViaEn: 'Chattogram -> Malacca Strait (Singapore) -> Tokyo Bay',
    tariffBenefitBn: 'জাপানে ২১.৬% লেদার কোটা শুল্ক সম্পূর্ণ সাশ্রয়',
    tariffBenefitEn: 'Saves 21.6% leather quota tariff under Japan GSP',
    competitorDutyBn: 'কোটা সাশ্রয় ২১.৬% (বাংলাদেশি পণ্যে প্রিফারেঞ্চিয়াল এন্ট্রি)',
    competitorDutyEn: 'Saves 21.6% quota duty (Preferential access for BD)',
    carbonBunker: '০.১২ কেজি CO2e/টিইইউ-কিমি',
    primaryGoodsBn: 'ভেজিটেবল-ট্যানড চেলসি বুট ও হ্যান্ডক্রাফটেড টেবিলওয়্যার',
    primaryGoodsEn: 'Vegetable-tanned Chelsea boots & handcrafted ceramics',
    color: '#38BDF8', // Cyan
  },
  {
    id: 'corridor-newyork',
    nameBn: 'পোর্ট অব নিউ ইয়র্ক ও নিউ জার্সি',
    nameEn: 'Port of New York & New Jersey',
    countryBn: 'যুক্তরাষ্ট্র (USA)',
    countryEn: 'United States',
    destLat: 40.67,
    destLon: -74.02,
    sectorKey: 'ceramics',
    sectorBn: 'সিরামিক ও টেবিলওয়্যার',
    sectorEn: 'Porcelain & Stoneware',
    transitDays: 29,
    routeViaBn: 'চট্টগ্রাম -> সুয়েজ -> আটলান্টিক মহাসাগর -> নিউ ইয়র্ক',
    routeViaEn: 'Chattogram -> Suez Canal -> Atlantic Ocean -> New York',
    tariffBenefitBn: 'যুক্তরাষ্ট্রের বড় রিটেইলারদের সাথে সরাসরি এফওবি চুক্তি',
    tariffBenefitEn: 'Direct FOB supply contracts with US department store buyers',
    competitorDutyBn: 'মিডলম্যান ছাড়া সরাসরি কারখানার নিজস্ব কোটেশন ও মার্জিন',
    competitorDutyEn: 'Factory direct FOB quotation bypassing 3rd party brokers',
    carbonBunker: '০.২৪ কেজি CO2e/টিইইউ-কিমি',
    primaryGoodsBn: 'প্রিমিয়াম সিরামিক ডিনার সেট ও স্ট্রেচ ডেনিম',
    primaryGoodsEn: 'Lead-free glazed tableware sets & stretch denim',
    color: '#F59E0B', // Amber
  },
];

const CHATTOGRAM = { lat: 22.33, lon: 91.8, nameBn: 'চট্টগ্রাম বন্দর (প্রধান হাব)', nameEn: 'Chattogram Port (Sovereign Hub)' };
const GLOBE_RADIUS = 2.0;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createArcPoints(v1: THREE.Vector3, v2: THREE.Vector3, numPoints = 64, altitude = 0.55): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Slerp interpolation on sphere surface
    const p = new THREE.Vector3().lerpVectors(v1, v2, t).normalize();
    // Parabolic elevation peak at t = 0.5
    const elevation = Math.sin(Math.PI * t) * altitude;
    p.multiplyScalar(GLOBE_RADIUS + elevation);
    points.push(p);
  }
  return points;
}

interface GlobeRigProps {
  activeCorridor: CorridorData;
  onSelectCorridor: (id: string) => void;
  filterSector: string;
  theme: 'light' | 'dark';
}

function GlobeRig({ activeCorridor, onSelectCorridor, filterSector, theme }: GlobeRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHovered = useRef(false);

  // Filter corridors
  const visibleCorridors = useMemo(() => {
    if (filterSector === 'all') return CORRIDORS;
    return CORRIDORS.filter((c) => c.sectorKey === filterSector);
  }, [filterSector]);

  // Coordinates of Chattogram port
  const ctgVector = useMemo(() => {
    return latLonToVector3(CHATTOGRAM.lat, CHATTOGRAM.lon, GLOBE_RADIUS);
  }, []);

  // Shipping routes arcs
  const corridorArcs = useMemo(() => {
    return visibleCorridors.map((c) => {
      const destVec = latLonToVector3(c.destLat, c.destLon, GLOBE_RADIUS);
      const points = createArcPoints(ctgVector, destVec, 64, 0.6);
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.016, 6, false);
      return { corridor: c, destVec, points, tubeGeo };
    });
  }, [visibleCorridors, ctgVector]);

  // Idle rotation around Chattogram/Indian ocean focus
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    if (!isHovered.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const earthTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const ocean = theme === 'dark' ? '#0A1E3A' : '#C8DDEA';
    const land = theme === 'dark' ? '#2A5A8A' : '#7BA3BC';
    const border = theme === 'dark' ? '#3A7AAA' : '#5A8AAA';
    return createEarthTexture(ocean, land, border);
  }, [theme]);

  const sphereColor = theme === 'dark' ? '#070E1A' : '#F1F5F9';
  const gridColor = theme === 'dark' ? '#1E293B' : '#CBD5E1';
  const ctgColor = '#10B981';

  return (
    <group
      ref={groupRef}
      onPointerOver={() => { isHovered.current = true; }}
      onPointerOut={() => { isHovered.current = false; }}
      rotation={[-0.2, -1.6, 0]}
    >
      {/* 1. Base Earth Sphere with continent texture */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        {earthTexture ? (
          <meshStandardMaterial map={earthTexture} roughness={0.85} metalness={0.05} />
        ) : (
          <meshStandardMaterial color={sphereColor} roughness={0.8} metalness={0.1} />
        )}
      </mesh>

      {/* Atmospheric rim highlight (flat, subtle, no glow) */}
      <mesh scale={1.02}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={theme === 'dark' ? '#10B981' : '#047857'}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 2. Latitude and Longitude Coordinate Rings */}
      {[-45, -23.5, 0, 23.5, 45, 60].map((lat) => {
        const rad = (lat * Math.PI) / 180;
        const ringRadius = GLOBE_RADIUS * Math.cos(rad);
        const ringY = GLOBE_RADIUS * Math.sin(rad);
        return (
          <mesh key={`lat-${lat}`} position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[ringRadius * 0.996, ringRadius * 1.004, 64]} />
            <meshBasicMaterial color={gridColor} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Longitude meridians (6 major meridian rings) */}
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <group key={`meridian-${deg}`} rotation={[0, (deg * Math.PI) / 180, 0]}>
          <mesh>
            <ringGeometry args={[GLOBE_RADIUS * 0.996, GLOBE_RADIUS * 1.004, 64]} />
            <meshBasicMaterial color={gridColor} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 3. Chattogram Anchor Sovereign Pin */}
      <group position={ctgVector}>
        {/* Core pin */}
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={ctgColor} />
        </mesh>
        {/* Radar radar halo */}
        <mesh>
          <ringGeometry args={[0.09, 0.13, 24]} />
          <meshBasicMaterial color={ctgColor} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* 4. Arcs and Destination Ports */}
      {corridorArcs.map(({ corridor, destVec, tubeGeo }) => {
        const isSelected = activeCorridor.id === corridor.id;
        const arcColor = isSelected ? '#10B981' : corridor.color;
        const opacity = isSelected ? 0.95 : 0.45;

        return (
          <group key={corridor.id}>
            {/* 3D Arc Tube */}
            <mesh
              geometry={tubeGeo}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCorridor(corridor.id);
              }}
            >
              <meshBasicMaterial
                color={arcColor}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Destination Port Pin */}
            <group position={destVec}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCorridor(corridor.id);
                }}
              >
                <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
                <meshBasicMaterial color={arcColor} />
              </mesh>
              {isSelected && (
                <mesh>
                  <ringGeometry args={[0.1, 0.14, 24]} />
                  <meshBasicMaterial color={arcColor} transparent opacity={0.8} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2D Elegant SVG Fallback (If WebGL disabled or error)
// ---------------------------------------------------------------------------

function TradeCorridorSvgFallback({
  activeCorridor,
  onSelectCorridor,
  lang,
}: {
  activeCorridor: CorridorData;
  onSelectCorridor: (id: string) => void;
  lang: string;
}) {
  return (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-900 text-white rounded-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold font-bangla">
            {lang === 'bn' ? 'চট্টগ্রাম বন্দর থেকে বৈশ্বিক শিপিং রুট' : 'Global Shipping Routes from Chattogram'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
          22.33° N, 91.80° E
        </span>
      </div>

      {/* Schematic Map Display */}
      <div className="my-3 space-y-2">
        {CORRIDORS.map((c) => {
          const isSelected = c.id === activeCorridor.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCorridor(c.id)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                isSelected
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="font-bold font-bangla">{lang === 'bn' ? c.nameBn : c.nameEn}</div>
                <div className="text-[11px] text-slate-400 font-bangla">{lang === 'bn' ? c.sectorBn : c.sectorEn}</div>
              </div>
              <div className="text-right font-mono">
                <span className="text-emerald-400 font-bold">{c.transitDays}d</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-bangla">
          {lang === 'bn' ? activeCorridor.tariffBenefitBn : activeCorridor.tariffBenefitEn}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Interactive Trade Corridor Component
// ---------------------------------------------------------------------------

export const TradeCorridorGlobe: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const { lang, t } = useAuth();
  const [activeId, setActiveId] = useState<string>('corridor-rotterdam');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [hasWebGlError, setHasWebGlError] = useState(false);

  const activeCorridor = useMemo(() => {
    return CORRIDORS.find((c) => c.id === activeId) || CORRIDORS[0];
  }, [activeId]);

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-xl flex flex-col">
      {/* 1. Header Toolbar: Sector Filter Pills */}
      <div className="relative z-10 p-3 sm:p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white font-bangla">
            {t('বৈশ্বিক মেরিটাইম ট্রেড করিডোর', 'Global Maritime Trade Corridors')}
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            {t('চট্টগ্রাম পোর্ট হাব', 'Chattogram Port Hub')}
          </span>
        </div>

        {/* Sector filters */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setFilterSector('all')}
            className={`px-2 py-1 rounded transition-colors ${
              filterSector === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('সব রুট', 'All')}
          </button>
          <button
            onClick={() => setFilterSector('jute')}
            className={`px-2 py-1 rounded transition-colors ${
              filterSector === 'jute' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('পাট', 'Jute')}
          </button>
          <button
            onClick={() => setFilterSector('rmg')}
            className={`px-2 py-1 rounded transition-colors ${
              filterSector === 'rmg' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('পোশাক', 'RMG')}
          </button>
          <button
            onClick={() => setFilterSector('leather')}
            className={`px-2 py-1 rounded transition-colors ${
              filterSector === 'leather' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('চামড়া', 'Leather')}
          </button>
        </div>
      </div>

      {/* 2. Interactive 3D Canvas / Fallback Area */}
      <div className="relative flex-1 w-full min-h-0">
        {hasWebGlError ? (
          <TradeCorridorSvgFallback
            activeCorridor={activeCorridor}
            onSelectCorridor={setActiveId}
            lang={lang}
          />
        ) : (
          <Canvas
            camera={{ position: [0, 0, 5.2], fov: 45 }}
            onError={() => setHasWebGlError(true)}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} />
            <GlobeRig
              activeCorridor={activeCorridor}
              onSelectCorridor={setActiveId}
              filterSector={filterSector}
              theme={theme}
            />
          </Canvas>
        )}

        {/* 3. Floating Strategic HUD Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 pointer-events-auto">
          <div className="p-3.5 rounded-xl bg-slate-950/92 backdrop-blur-xl border border-slate-800 text-xs text-white shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCorridor.color }} />
                <span className="font-bold text-white font-bangla text-sm">
                  {lang === 'bn' ? activeCorridor.nameBn : activeCorridor.nameEn}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                <span>{activeCorridor.transitDays}</span>
                <span className="text-[10px]">{t('দিন ট্রানজিট', 'days')}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-bangla">
              <span className="text-slate-400">{t('রুট ট্র্যাভার্সাল:', 'Route:')} </span>
              {lang === 'bn' ? activeCorridor.routeViaBn : activeCorridor.routeViaEn}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bangla">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{lang === 'bn' ? activeCorridor.tariffBenefitBn : activeCorridor.tariffBenefitEn}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bangla">
                <Leaf className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>{t('কার্বন:', 'Carbon:')} {activeCorridor.carbonBunker}</span>
              </div>
            </div>

            {/* Quick Port Switcher */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-4 gap-1">
              {CORRIDORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`py-1 text-[10px] font-semibold rounded transition-colors text-center truncate ${
                    activeId === c.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={c.nameEn}
                >
                  {c.id.replace('corridor-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TradeCorridorFallback: React.FC<{ activeId?: string; onSelect?: (id: string) => void }> = ({
  activeId = 'corridor-rotterdam',
  onSelect,
}) => {
  const { lang } = useAuth();
  const [selected, setSelected] = useState(activeId);
  const activeCorridor = CORRIDORS.find((c) => c.id === selected) || CORRIDORS[0];

  return (
    <TradeCorridorSvgFallback
      activeCorridor={activeCorridor}
      onSelectCorridor={(id) => {
        setSelected(id);
        if (onSelect) onSelect(id);
      }}
      lang={lang}
    />
  );
};

import { hotspotsByView } from '../../data/carInspectionHotspots.js';
import C from './brandColors.js';
import Hotspot from './Hotspot.jsx';

/* ---- 车轮 ---- */

function Wheel({ cx, cy, r }) {
  const spokes = [0, 60, 120, 180, 240, 300];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.tire} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A252F" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.58} fill={C.rim} />
      <circle cx={cx} cy={cy} r={r * 0.58} fill="none" stroke={C.rimDark} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r * 0.17} fill={C.rimDark} />
      {spokes.map((a) => {
        const rad = (a * Math.PI) / 180;
        const innerR = r * 0.18;
        const outerR = r * 0.54;
        return (
          <line
            key={`spoke-${a}`}
            x1={cx + innerR * Math.cos(rad)}
            y1={cy + innerR * Math.sin(rad)}
            x2={cx + outerR * Math.cos(rad)}
            y2={cy + outerR * Math.sin(rad)}
            stroke={C.rimDark}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/* ---- 正面 ---- */

function FrontView({ selected, checkedSet, onSelect }) {
  return (
    <svg viewBox="0 0 600 380" className="w-full" aria-label="车身正面验车示意图">
      <ellipse cx="300" cy="360" rx="230" ry="12" fill={C.deepBlue} opacity="0.05" />
      <Wheel cx="172" cy="308" r="54" />
      <Wheel cx="428" cy="308" r="54" />
      <path d="M118 282 Q118 232 172 232 Q226 232 226 282" fill="none" stroke={C.deepBlue} strokeWidth="2.5" opacity="0.12" />
      <path d="M374 282 Q374 232 428 232 Q482 232 482 282" fill="none" stroke={C.deepBlue} strokeWidth="2.5" opacity="0.12" />

      <path
        d="M108 268 L108 185 Q108 150 140 138 Q172 126 210 122 L390 122 Q428 126 460 138 Q492 150 492 185 L492 268 Z"
        fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="2.5" strokeLinejoin="round"
      />
      <path
        d="M108 268 L108 185 Q108 150 140 138 Q172 126 210 122 L390 122 Q428 126 460 138 Q492 150 492 185 L492 268 Z"
        fill="url(#frontHighlight)"
      />

      <path d="M168 132 Q300 118 432 132" fill="none" stroke={C.bodyStroke} strokeWidth="1.8" opacity="0.2" />

      <path d="M186 56 L414 56 L458 138 L142 138 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="2" strokeLinejoin="round" opacity="0.8" />
      <path d="M186 56 Q300 40 414 56" fill="none" stroke={C.glassStroke} strokeWidth="2" opacity="0.6" />

      <rect x="212" y="168" width="176" height="52" rx="14" fill={C.grilleFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.7" />
      {[0, 1, 2].map((i) => (
        <line key={`grille-${i}`} x1="222" y1={180 + i * 15} x2="378" y2={180 + i * 15} stroke={C.bodyStroke} strokeWidth="1" opacity="0.12" />
      ))}
      <rect x="242" y="224" width="116" height="16" rx="8" fill={C.grilleFill} stroke={C.bodyStroke} strokeWidth="1.2" opacity="0.5" />

      {/* 左大灯 */}
      <path d="M118 168 Q135 150 168 155 L175 190 Q155 205 128 198 L118 182 Z" fill={C.headlightFill} stroke={C.bodyStroke} strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="150" cy="178" rx="16" ry="10" fill={C.headlightInner} opacity="0.8" />
      <path d="M122 172 Q148 158 170 162" fill="none" stroke="#FFF9C4" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {/* 右大灯 */}
      <path d="M482 168 Q465 150 432 155 L425 190 Q445 205 472 198 L482 182 Z" fill={C.headlightFill} stroke={C.bodyStroke} strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="450" cy="178" rx="16" ry="10" fill={C.headlightInner} opacity="0.8" />
      <path d="M478 172 Q452 158 430 162" fill="none" stroke="#FFF9C4" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      <rect x="105" y="250" width="390" height="42" rx="14" fill={C.bumperFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.6" />
      <circle cx="178" cy="268" r="9" fill={C.headlightFill} stroke={C.bodyStroke} strokeWidth="1" opacity="0.5" />
      <circle cx="422" cy="268" r="9" fill={C.headlightFill} stroke={C.bodyStroke} strokeWidth="1" opacity="0.5" />

      <path d="M92 130 L112 125 L116 155 L96 158 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M508 130 L488 125 L484 155 L504 158 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="1.8" strokeLinejoin="round" />

      <defs>
        <linearGradient id="frontHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.white} stopOpacity="0.5" />
          <stop offset="30%" stopColor={C.white} stopOpacity="0.1" />
          <stop offset="100%" stopColor={C.deepBlue} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {hotspotsByView.front.map((p) => (
        <Hotspot key={p.id} point={p} isSelected={selected} isChecked={checkedSet && checkedSet[p.id]} onClick={onSelect} />
      ))}
    </svg>
  );
}

/* ---- 侧面 ---- */

function SideView({ selected, checkedSet, onSelect }) {
  return (
    <svg viewBox="0 0 920 320" className="w-full" aria-label="车身侧面验车示意图">
      <ellipse cx="460" cy="304" rx="390" ry="10" fill={C.deepBlue} opacity="0.05" />
      <Wheel cx="230" cy="252" r="56" />
      <Wheel cx="630" cy="252" r="56" />
      <path d="M168 228 Q168 172 230 172 Q292 172 292 228" fill="none" stroke={C.bodyStroke} strokeWidth="2.5" opacity="0.1" />
      <path d="M568 228 Q568 172 630 172 Q692 172 692 228" fill="none" stroke={C.bodyStroke} strokeWidth="2.5" opacity="0.1" />

      <path d="M72 158 L72 240 Q72 256 88 256 L824 256 Q840 256 840 240 L840 158 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 158 L72 240 Q72 256 88 256 L824 256 Q840 256 840 240 L840 158 Z" fill="url(#sideHighlight)" />

      <path d="M72 158 Q56 158 56 175 L56 225 Q56 242 72 242" fill={C.bumperFill} stroke={C.bodyStroke} strokeWidth="2" opacity="0.7" />
      <path d="M840 158 Q856 158 856 175 L856 225 Q856 242 840 242" fill={C.bumperFill} stroke={C.bodyStroke} strokeWidth="2" opacity="0.7" />

      <path d="M176 122 Q220 110 296 114 L296 158 L72 158 Q72 140 90 132 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="2" opacity="0.55" />
      <path d="M296 114 L318 60 Q334 42 360 40 L510 40 Q545 42 558 60 L628 114 Q672 124 722 126 L840 158 L72 158 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="2" opacity="0.65" />

      <path d="M300 112 L318 62 Q326 50 340 48 L360 48 L348 114 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="1.8" opacity="0.7" />
      <path d="M352 114 L364 50 Q370 42 382 42 L440 42 L440 114 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="1.5" opacity="0.55" />
      <path d="M444 114 L456 50 Q460 42 472 42 L506 42 L506 114 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="1.5" opacity="0.55" />
      <path d="M510 114 L520 58 Q524 50 536 50 L620 112 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="1.5" opacity="0.45" />

      <line x1="510" y1="46" x2="558" y2="114" stroke={C.bodyStroke} strokeWidth="2.2" opacity="0.25" />
      <line x1="280" y1="158" x2="760" y2="158" stroke={C.bodyStroke} strokeWidth="2.5" opacity="0.3" />
      <line x1="260" y1="210" x2="730" y2="210" stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.12" />

      <rect x="372" y="166" width="26" height="6" rx="3" fill={C.rimDark} opacity="0.35" />
      <rect x="502" y="166" width="26" height="6" rx="3" fill={C.rimDark} opacity="0.35" />

      <path d="M72 158 L72 148 Q72 138 84 136 L148 140 L148 158 Z" fill={C.headlightFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.85" />
      <path d="M76 148 L140 142" fill="none" stroke="#FFF9C4" strokeWidth="2" opacity="0.6" />
      <path d="M830 150 L840 150 L840 175 L820 170 Z" fill={C.taillightFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.75" />
      <path d="M826 156 L838 156" fill="none" stroke={C.taillightInner} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

      <path d="M268 120 Q264 110 274 108 L294 112 L294 134 L274 136 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="1.8" strokeLinejoin="round" />

      <defs>
        <linearGradient id="sideHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.white} stopOpacity="0.45" />
          <stop offset="25%" stopColor={C.white} stopOpacity="0.08" />
          <stop offset="100%" stopColor={C.deepBlue} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {hotspotsByView.side.map((p) => (
        <Hotspot key={p.id} point={p} isSelected={selected} isChecked={checkedSet && checkedSet[p.id]} onClick={onSelect} />
      ))}
    </svg>
  );
}

/* ---- 背面 ---- */

function RearView({ selected, checkedSet, onSelect }) {
  return (
    <svg viewBox="0 0 600 380" className="w-full" aria-label="车身背面验车示意图">
      <ellipse cx="300" cy="360" rx="230" ry="12" fill={C.deepBlue} opacity="0.05" />
      <Wheel cx="172" cy="308" r="54" />
      <Wheel cx="428" cy="308" r="54" />
      <path d="M118 282 Q118 232 172 232 Q226 232 226 282" fill="none" stroke={C.deepBlue} strokeWidth="2.5" opacity="0.12" />
      <path d="M374 282 Q374 232 428 232 Q482 232 482 282" fill="none" stroke={C.deepBlue} strokeWidth="2.5" opacity="0.12" />

      <path d="M108 268 L108 185 Q108 148 140 136 Q172 124 210 120 L390 120 Q428 124 460 136 Q492 148 492 185 L492 268 Z" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M108 268 L108 185 Q108 148 140 136 Q172 124 210 120 L390 120 Q428 124 460 136 Q492 148 492 185 L492 268 Z" fill="url(#rearHighlight)" />

      <path d="M184 128 Q300 110 416 128" fill="none" stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.15" />
      <path d="M192 54 L408 54 L456 136 L144 136 Z" fill={C.glass} stroke={C.glassStroke} strokeWidth="2" opacity="0.75" />
      <path d="M192 54 Q300 38 408 54" fill="none" stroke={C.glassStroke} strokeWidth="2" opacity="0.6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`heat-${i}`} x1={180 - i * 5} y1={72 + i * 14} x2={420 + i * 5} y2={72 + i * 14} stroke={C.white} strokeWidth="0.8" opacity="0.2" />
      ))}

      <rect x="116" y="160" width="80" height="26" rx="6" fill={C.taillightFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.8" />
      <rect x="404" y="160" width="80" height="26" rx="6" fill={C.taillightFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.8" />
      <rect x="198" y="166" width="204" height="14" rx="4" fill={C.taillightInner} stroke={C.bodyStroke} strokeWidth="1" opacity="0.5" />
      <rect x="124" y="166" width="16" height="14" rx="3" fill={C.taillightInner} opacity="0.7" />
      <rect x="148" y="166" width="16" height="14" rx="3" fill={C.taillightInner} opacity="0.7" />
      <rect x="412" y="166" width="16" height="14" rx="3" fill={C.taillightInner} opacity="0.7" />
      <rect x="436" y="166" width="16" height="14" rx="3" fill={C.taillightInner} opacity="0.7" />

      <rect x="208" y="130" width="184" height="68" rx="8" fill={C.bodyFill} stroke={C.bodyStroke} strokeWidth="1.2" opacity="0.4" />
      <rect x="236" y="206" width="128" height="30" rx="4" fill={C.white} stroke={C.bodyStroke} strokeWidth="1.2" opacity="0.75" />
      <circle cx="266" cy="210" r="3" fill="#FFF9C4" opacity="0.5" />
      <circle cx="334" cy="210" r="3" fill="#FFF9C4" opacity="0.5" />

      <rect x="105" y="250" width="390" height="42" rx="14" fill={C.bumperFill} stroke={C.bodyStroke} strokeWidth="1.5" opacity="0.6" />
      <rect x="156" y="260" width="26" height="8" rx="3" fill={C.taillightInner} stroke={C.bodyStroke} strokeWidth="0.8" opacity="0.5" />
      <rect x="418" y="260" width="26" height="8" rx="3" fill={C.taillightInner} stroke={C.bodyStroke} strokeWidth="0.8" opacity="0.5" />

      <path d="M248 264 L352 264 L340 284 L260 284 Z" fill={C.diffuserFill} stroke={C.bodyStroke} strokeWidth="1.2" opacity="0.5" />
      <rect x="264" y="270" width="28" height="10" rx="5" fill={C.rimDark} stroke={C.bodyStroke} strokeWidth="1" opacity="0.4" />
      <rect x="308" y="270" width="28" height="10" rx="5" fill={C.rimDark} stroke={C.bodyStroke} strokeWidth="1" opacity="0.4" />

      <defs>
        <linearGradient id="rearHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.white} stopOpacity="0.5" />
          <stop offset="30%" stopColor={C.white} stopOpacity="0.1" />
          <stop offset="100%" stopColor={C.deepBlue} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {hotspotsByView.rear.map((p) => (
        <Hotspot key={p.id} point={p} isSelected={selected} isChecked={checkedSet && checkedSet[p.id]} onClick={onSelect} />
      ))}
    </svg>
  );
}

/* ---- 容器 ---- */

export default function CarSvgMap({ view, selected, checkedSet, onSelect }) {
  const ViewComponent = view === 'front' ? FrontView : view === 'rear' ? RearView : SideView;

  return (
    <div className="rounded-[24px] border border-pine/10 bg-card p-3 shadow-card">
      <p className="mb-2 text-center text-[11px] font-bold text-faint">点击车身部位查看检查重点</p>
      <ViewComponent selected={selected} checkedSet={checkedSet} onSelect={onSelect} />
    </div>
  );
}

import React from 'react';
import {getSpeciesById} from '../species';
import type {PokemonMood, SpeciesId} from '../types';

interface PokemonSpriteProps {
  speciesId: SpeciesId;
  mood?: PokemonMood;
  className?: string;
  showAngerEffect?: boolean;
}

interface FaceProps {
  mood: PokemonMood;
  cx: number;
  cy: number;
  eyeSpacing?: number;
  eyeColor?: string;
  scale?: number;
}

function ExpressionFace({
  mood,
  cx,
  cy,
  eyeSpacing = 18,
  eyeColor = '#1A2433',
  scale = 1,
}: FaceProps) {
  const leftX = cx - eyeSpacing / 2;
  const rightX = cx + eyeSpacing / 2;

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(${-cx}, ${-cy})`}>
      {mood === 'relaxed' || mood === 'eating' ? (
        <>
          <path
            d={`M${leftX - 5} ${cy} Q${leftX} ${cy - 6} ${leftX + 5} ${cy}`}
            fill="none"
            stroke="#1A2433"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d={`M${rightX - 5} ${cy} Q${rightX} ${cy - 6} ${rightX + 5} ${cy}`}
            fill="none"
            stroke="#1A2433"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse cx={leftX} cy={cy} rx="4.4" ry="5.2" fill="#FFFFFF" stroke="#1A2433" strokeWidth="1.2" />
          <ellipse cx={leftX} cy={cy + 0.4} rx="2.9" ry="3.6" fill={eyeColor} />
          <circle cx={leftX - 1.1} cy={cy - 1.3} r="1.3" fill="#FFFFFF" />

          <ellipse cx={rightX} cy={cy} rx="4.4" ry="5.2" fill="#FFFFFF" stroke="#1A2433" strokeWidth="1.2" />
          <ellipse cx={rightX} cy={cy + 0.4} rx="2.9" ry="3.6" fill={eyeColor} />
          <circle cx={rightX - 1.1} cy={cy - 1.3} r="1.3" fill="#FFFFFF" />
        </>
      )}

      {(mood === 'furious' || mood === 'grumpy') && (
        <>
          <path
            d={`M${leftX - 5} ${cy - 7} L${leftX + 4} ${cy - 4}`}
            stroke="#1A2433"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={`M${rightX + 5} ${cy - 7} L${rightX - 4} ${cy - 4}`}
            stroke="#1A2433"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )}

      {mood === 'sad' && (
        <>
          <path
            d={`M${leftX - 5} ${cy - 4} L${leftX + 4} ${cy - 7}`}
            stroke="#1A2433"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={`M${rightX + 5} ${cy - 4} L${rightX - 4} ${cy - 7}`}
            stroke="#1A2433"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}

      {mood === 'furious' && (
        <path
          d={`M${cx - 6} ${cy + 10} Q${cx} ${cy + 5} ${cx + 6} ${cy + 10}`}
          fill="#8E1C28"
          stroke="#1A2433"
          strokeWidth="1.5"
        />
      )}
      {mood === 'grumpy' && (
        <path
          d={`M${cx - 5} ${cy + 10} Q${cx} ${cy + 7} ${cx + 5} ${cy + 10}`}
          fill="none"
          stroke="#1A2433"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {mood === 'neutral' && (
        <path
          d={`M${cx - 4} ${cy + 8} Q${cx} ${cy + 11} ${cx + 4} ${cy + 8}`}
          fill="none"
          stroke="#1A2433"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {(mood === 'relaxed' || mood === 'eating') && (
        <path
          d={`M${cx - 5} ${cy + 7} Q${cx} ${cy + 13} ${cx + 5} ${cy + 7}`}
          fill="#E45C73"
          stroke="#1A2433"
          strokeWidth="1.4"
        />
      )}
      {mood === 'sad' && (
        <path
          d={`M${cx - 4} ${cy + 11} Q${cx} ${cy + 8} ${cx + 4} ${cy + 11}`}
          fill="none"
          stroke="#1A2433"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function MoodOverlay({mood}: {mood: PokemonMood}) {
  if (mood === 'furious') {
    return (
      <g className="mood-overlay mood-overlay-furious" aria-hidden="true">
        <circle cx="100" cy="104" r="76" fill="#E4002B" opacity="0.14" />
        <path
          d="M150 38 L156 30 M156 44 L166 40 M144 33 L144 23"
          stroke="#E4002B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="42" cy="40" r="6" fill="#FFFFFF" opacity="0.8" />
        <circle cx="34" cy="30" r="4" fill="#FFFFFF" opacity="0.7" />
      </g>
    );
  }
  if (mood === 'relaxed') {
    return (
      <g className="mood-overlay mood-overlay-relaxed" aria-hidden="true">
        <path
          d="M42 42 C42 36 50 36 50 42 C50 48 42 52 42 52 C42 52 34 48 34 42 C34 36 42 36 42 42 Z"
          fill="#FF5C8A"
        />
        <path
          d="M158 36 C158 31 164 31 164 36 C164 41 158 44 158 44 C158 44 152 41 152 36 C152 31 158 31 158 36 Z"
          fill="#FF85A6"
        />
      </g>
    );
  }
  if (mood === 'eating') {
    return (
      <g className="mood-overlay mood-overlay-eating" aria-hidden="true">
        <path d="M38 42 L42 32 L46 42 L56 46 L46 50 L42 60 L38 50 L28 46 Z" fill="#FFC72C" />
        <path d="M156 40 L159 33 L162 40 L169 43 L162 46 L159 53 L156 46 L149 43 Z" fill="#7ED957" />
      </g>
    );
  }
  return null;
}

function PoochyenaSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="pooch-coat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6D7180" />
          <stop offset="100%" stopColor="#434753" />
        </linearGradient>
        <linearGradient id="pooch-tan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6D5B8" />
          <stop offset="100%" stopColor="#C4AD87" />
        </linearGradient>
      </defs>
      {/* Spiky bushy tail */}
      <path
        d="M132 108 Q164 88 172 68 Q158 80 156 64 Q146 82 140 72 Q138 92 128 100 Z"
        fill="#393C47"
        stroke="#1A2433"
        strokeWidth="1.8"
      />
      {/* Back legs */}
      <rect x="112" y="128" width="14" height="24" rx="6" fill="url(#pooch-tan)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="74" y="130" width="14" height="24" rx="6" fill="url(#pooch-tan)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Body */}
      <ellipse cx="108" cy="112" rx="34" ry="24" fill="url(#pooch-coat)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Front paws */}
      <rect x="86" y="126" width="14" height="28" rx="6" fill="url(#pooch-tan)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="64" y="126" width="14" height="28" rx="6" fill="url(#pooch-tan)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Big round ears */}
      <ellipse cx="56" cy="54" rx="13" ry="18" transform="rotate(-18 56 54)" fill="url(#pooch-coat)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="57" cy="56" rx="7" ry="10" transform="rotate(-18 57 56)" fill="#B86B77" />
      <ellipse cx="94" cy="52" rx="13" ry="18" transform="rotate(14 94 52)" fill="url(#pooch-coat)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="93" cy="54" rx="7" ry="10" transform="rotate(14 93 54)" fill="#B86B77" />
      {/* Head */}
      <circle cx="75" cy="84" r="28" fill="url(#pooch-coat)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Pale tan muzzle */}
      <ellipse cx="68" cy="96" rx="20" ry="14" fill="url(#pooch-tan)" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="62" cy="92" rx="4.5" ry="3" fill="#D94854" />
      <ExpressionFace mood={mood} cx={72} cy={80} eyeSpacing={22} eyeColor="#C9333E" />
      {showAnger && (
        <g className="anger-fx anger-poochyena">
          <path d="M98 86 L108 74 L114 86 L126 74 L132 88" fill="none" stroke="#1A2433" strokeWidth="2.2" />
          <path d="M36 92 Q28 96 36 102 M30 88 Q20 96 30 106" fill="none" stroke="#E4002B" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function NumelSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="numel-yellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#E6B422" />
        </linearGradient>
        <linearGradient id="numel-hump" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8F6544" />
          <stop offset="100%" stopColor="#5C3D28" />
        </linearGradient>
      </defs>
      {/* Legs */}
      <rect x="64" y="126" width="14" height="24" rx="6" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="86" y="128" width="14" height="22" rx="6" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="114" y="126" width="14" height="24" rx="6" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="132" y="126" width="14" height="22" rx="6" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Body */}
      <ellipse cx="104" cy="112" rx="44" ry="28" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Rocky brown hump with vent */}
      <path d="M84 90 Q108 50 132 90 Z" fill="url(#numel-hump)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="108" cy="68" rx="9" ry="4" fill="#3D2618" stroke="#1A2433" strokeWidth="1.5" />
      {/* Ears */}
      <ellipse cx="52" cy="70" rx="8" ry="12" transform="rotate(-24 52 70)" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="82" cy="68" rx="8" ry="12" transform="rotate(20 82 68)" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Head */}
      <ellipse cx="64" cy="96" rx="26" ry="22" fill="url(#numel-yellow)" stroke="#1A2433" strokeWidth="1.8" />
      <ExpressionFace mood={mood} cx={62} cy={92} eyeSpacing={22} />
      {showAnger && (
        <g className="anger-fx anger-numel">
          <circle cx="108" cy="54" r="7" fill="#FFFFFF" opacity="0.88" stroke="#9AA5B1" strokeWidth="1.4" />
          <circle cx="114" cy="40" r="10" fill="#FFFFFF" opacity="0.8" stroke="#9AA5B1" strokeWidth="1.4" />
          <circle cx="103" cy="28" r="7" fill="#FFE5D9" opacity="0.78" />
        </g>
      )}
    </g>
  );
}

function ElectrikeSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="elec-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#85DB63" />
          <stop offset="100%" stopColor="#4FA336" />
        </linearGradient>
      </defs>
      {/* Tail */}
      <path d="M138 110 L166 94 L154 114 L140 120 Z" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Legs */}
      <rect x="64" y="128" width="13" height="24" rx="5" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="86" y="130" width="13" height="22" rx="5" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="114" y="128" width="13" height="24" rx="5" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="130" y="126" width="13" height="24" rx="5" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Body */}
      <ellipse cx="108" cy="112" rx="34" ry="22" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Yellow lightning-zigzag mane */}
      <polygon
        points="76,74 96,60 92,80 112,72 96,98 110,104 82,114 68,94"
        fill="#FFE047"
        stroke="#1A2433"
        strokeWidth="1.8"
      />
      {/* Head with yellow lightning crest */}
      <polygon points="56,64 72,38 82,62" fill="#FFE047" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="68" cy="84" rx="25" ry="22" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="52" cy="88" rx="11" ry="8" fill="url(#elec-green)" stroke="#1A2433" strokeWidth="1.6" />
      <ExpressionFace mood={mood} cx={66} cy={80} eyeSpacing={20} eyeColor="#C92A2A" />
      {showAnger && (
        <g className="anger-fx anger-electrike">
          <polyline points="38,68 48,74 42,82 50,88" fill="none" stroke="#FFC72C" strokeWidth="3" strokeLinecap="round" />
          <polyline points="124,62 134,54 128,70 140,64" fill="none" stroke="#FFC72C" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function TrapinchSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="trap-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF974D" />
          <stop offset="100%" stopColor="#D9621E" />
        </linearGradient>
      </defs>
      {/* Tiny body & 4 stubby legs */}
      <ellipse cx="130" cy="122" rx="24" ry="18" fill="url(#trap-orange)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="110" y="132" width="10" height="16" rx="4" fill="url(#trap-orange)" stroke="#1A2433" strokeWidth="1.6" />
      <rect x="136" y="132" width="10" height="16" rx="4" fill="url(#trap-orange)" stroke="#1A2433" strokeWidth="1.6" />
      <rect x="74" y="130" width="11" height="18" rx="4" fill="url(#trap-orange)" stroke="#1A2433" strokeWidth="1.6" />
      {/* Belly cream patch */}
      <ellipse cx="128" cy="128" rx="14" ry="9" fill="#F8D9A0" />
      {/* Oversized head */}
      <circle cx="84" cy="92" r="42" fill="url(#trap-orange)" stroke="#1A2433" strokeWidth="2" />
      {/* Huge jagged jaw line */}
      <path
        d="M44 96 L58 106 L72 94 L86 106 L100 94 L114 106 L124 94"
        fill="none"
        stroke="#1A2433"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ExpressionFace mood={mood} cx={76} cy={74} eyeSpacing={32} />
      {showAnger && (
        <g className="anger-fx anger-trapinch">
          <path d="M36 92 L24 84 M36 102 L24 108" stroke="#E4002B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M62 114 L70 124 M92 114 L84 124" stroke="#FFC72C" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function AronSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="aron-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D3DBE6" />
          <stop offset="100%" stopColor="#8C97A8" />
        </linearGradient>
      </defs>
      {/* Stubby dark inner legs */}
      <rect x="64" y="128" width="14" height="22" rx="6" fill="#3B4454" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="92" y="130" width="14" height="20" rx="6" fill="#3B4454" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="118" y="128" width="14" height="22" rx="6" fill="#3B4454" stroke="#1A2433" strokeWidth="1.8" />
      {/* Dark inner body */}
      <ellipse cx="112" cy="110" rx="34" ry="26" fill="#3B4454" stroke="#1A2433" strokeWidth="1.8" />
      {/* Steel armor back plate */}
      <path d="M84 94 Q114 70 144 98 Q138 118 110 116 Z" fill="url(#aron-steel)" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="116" cy="96" r="4.5" fill="#3B4454" />
      {/* Armored helmet head */}
      <circle cx="78" cy="92" r="32" fill="#3B4454" stroke="#1A2433" strokeWidth="1.8" />
      <path d="M46 92 A32 32 0 0 1 110 92 L106 106 Q78 114 50 106 Z" fill="url(#aron-steel)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Two small horns/ridges */}
      <polygon points="62,62 66,46 74,60" fill="url(#aron-steel)" stroke="#1A2433" strokeWidth="1.6" />
      <polygon points="84,60 92,46 96,62" fill="url(#aron-steel)" stroke="#1A2433" strokeWidth="1.6" />
      {/* Blue eyes in visor holes */}
      <ExpressionFace mood={mood} cx={74} cy={90} eyeSpacing={26} eyeColor="#33A1FF" />
      {showAnger && (
        <g className="anger-fx anger-aron">
          <path d="M36 74 Q26 88 36 102" fill="none" stroke="#85C7FF" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 70 Q14 88 26 106" fill="none" stroke="#85C7FF" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function TorchicSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="torchic-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9642" />
          <stop offset="100%" stopColor="#E66225" />
        </linearGradient>
      </defs>
      {/* Feet */}
      <path d="M88 140 L84 154 M84 154 L76 154 M84 154 L90 156" stroke="#D9A13B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M114 140 L118 154 M118 154 L112 156 M118 154 L126 154" stroke="#D9A13B" strokeWidth="3.5" strokeLinecap="round" />
      {/* Small round body */}
      <ellipse cx="102" cy="116" rx="28" ry="26" fill="url(#torchic-orange)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Yellow feather collar */}
      <path d="M74 102 L86 112 L98 104 L110 112 L124 102 L116 94 L82 94 Z" fill="#FFE054" stroke="#1A2433" strokeWidth="1.6" />
      {/* Yellow head tuft */}
      <path d="M96 48 Q88 26 104 34 Q108 18 116 36 Q124 26 118 48 Z" fill="#FFE054" stroke="#1A2433" strokeWidth="1.8" />
      {/* Head */}
      <circle cx="102" cy="72" r="28" fill="url(#torchic-orange)" stroke="#1A2433" strokeWidth="1.8" />
      <ExpressionFace mood={mood} cx={100} cy={70} eyeSpacing={24} />
      {/* Little beak */}
      <polygon points="94,79 102,86 108,79" fill="#FFD34E" stroke="#1A2433" strokeWidth="1.4" />
      {showAnger && (
        <g className="anger-fx anger-torchic">
          <circle cx="70" cy="74" r="5" fill="#FF5722" />
          <circle cx="58" cy="64" r="3.8" fill="#FFC72C" />
          <circle cx="64" cy="84" r="3" fill="#FF8A00" />
        </g>
      )}
    </g>
  );
}

function MudkipSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="mudkip-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5BB4FF" />
          <stop offset="100%" stopColor="#2673C9" />
        </linearGradient>
      </defs>
      {/* Tail fin */}
      <ellipse cx="144" cy="112" rx="18" ry="24" transform="rotate(18 144 112)" fill="#A8E0FF" stroke="#1A2433" strokeWidth="1.8" />
      {/* Body & legs */}
      <rect x="74" y="128" width="13" height="22" rx="5" fill="url(#mudkip-blue)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="114" y="128" width="13" height="22" rx="5" fill="url(#mudkip-blue)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="102" cy="114" rx="30" ry="22" fill="url(#mudkip-blue)" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="96" cy="122" rx="18" ry="12" fill="#C9E8FF" />
      {/* Head fin */}
      <path d="M84 60 Q94 24 108 58 Z" fill="url(#mudkip-blue)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Head */}
      <circle cx="88" cy="84" r="28" fill="url(#mudkip-blue)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Orange cheek fins */}
      <polygon points="62,84 44,76 50,86 42,92 52,96 46,104 64,98" fill="#F28B3C" stroke="#1A2433" strokeWidth="1.5" />
      <polygon points="114,84 132,76 126,86 134,92 124,96 130,104 112,98" fill="#F28B3C" stroke="#1A2433" strokeWidth="1.5" />
      <ExpressionFace mood={mood} cx={88} cy={80} eyeSpacing={24} />
      {showAnger && (
        <g className="anger-fx anger-mudkip">
          <circle cx="48" cy="124" r="5" fill="#7A5436" />
          <circle cx="38" cy="112" r="3.5" fill="#8E6444" />
          <circle cx="148" cy="134" r="4.5" fill="#7A5436" />
        </g>
      )}
    </g>
  );
}

function TreeckoSvg({mood, showAnger}: {mood: PokemonMood; showAnger: boolean}) {
  return (
    <g>
      <defs>
        <linearGradient id="treecko-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FE36B" />
          <stop offset="100%" stopColor="#4FA838" />
        </linearGradient>
      </defs>
      {/* Leaf-like dark-green double tail */}
      <path d="M114 124 Q152 104 164 82 Q150 122 120 134 Z" fill="#2E7D32" stroke="#1A2433" strokeWidth="1.8" />
      <path d="M114 128 Q160 124 170 104 Q152 138 118 136 Z" fill="#3B9440" stroke="#1A2433" strokeWidth="1.8" />
      {/* Legs */}
      <rect x="80" y="132" width="12" height="20" rx="5" fill="url(#treecko-green)" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="104" y="132" width="12" height="20" rx="5" fill="url(#treecko-green)" stroke="#1A2433" strokeWidth="1.8" />
      {/* Slim torso with red belly band */}
      <ellipse cx="98" cy="112" rx="22" ry="26" fill="url(#treecko-green)" stroke="#1A2433" strokeWidth="1.8" />
      <path d="M78 114 Q98 124 118 114 Q116 132 98 134 Q80 132 78 114 Z" fill="#D93B48" stroke="#1A2433" strokeWidth="1.5" />
      {/* Head */}
      <ellipse cx="92" cy="70" rx="28" ry="24" fill="url(#treecko-green)" stroke="#1A2433" strokeWidth="1.8" />
      <ExpressionFace mood={mood} cx={90} cy={66} eyeSpacing={28} eyeColor="#D4A017" />
      {showAnger && (
        <g className="anger-fx anger-treecko">
          <path d="M158 76 Q172 90 162 110" fill="none" stroke="#7ED957" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function ZigzagoonSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      <ellipse cx="106" cy="116" rx="36" ry="22" fill="#8C6342" stroke="#1A2433" strokeWidth="1.8" />
      {/* Cream zigzag band */}
      <polygon points="84,104 98,94 106,110 120,96 128,118 110,132 94,122" fill="#F4EBD2" stroke="#1A2433" strokeWidth="1.4" />
      {/* Spiky tail */}
      <polygon points="136,112 168,94 156,118 164,128 134,126" fill="#8C6342" stroke="#1A2433" strokeWidth="1.8" />
      {/* Legs */}
      <rect x="70" y="132" width="12" height="18" rx="5" fill="#F4EBD2" stroke="#1A2433" strokeWidth="1.6" />
      <rect x="118" y="132" width="12" height="18" rx="5" fill="#F4EBD2" stroke="#1A2433" strokeWidth="1.6" />
      {/* Head & cream mask */}
      <ellipse cx="68" cy="92" rx="26" ry="22" fill="#F4EBD2" stroke="#1A2433" strokeWidth="1.8" />
      <polygon points="48,74 56,56 68,72" fill="#8C6342" stroke="#1A2433" strokeWidth="1.6" />
      <polygon points="74,72 86,56 92,76" fill="#8C6342" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="56" cy="90" rx="8" ry="6" fill="#704B30" />
      <ellipse cx="78" cy="90" rx="8" ry="6" fill="#704B30" />
      <ExpressionFace mood={mood} cx={67} cy={90} eyeSpacing={22} />
    </g>
  );
}

function WurmpleSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Segmented red caterpillar body */}
      <circle cx="134" cy="120" r="18" fill="#D94343" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="110" cy="116" r="20" fill="#E35252" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="84" cy="114" r="22" fill="#D94343" stroke="#1A2433" strokeWidth="1.8" />
      {/* Spikes on back and tail */}
      <polygon points="104,96 110,78 118,96" fill="#F6E7B9" stroke="#1A2433" strokeWidth="1.5" />
      <polygon points="146,110 164,96 150,122" fill="#F6E7B9" stroke="#1A2433" strokeWidth="1.5" />
      <polygon points="148,124 166,132 146,134" fill="#F6E7B9" stroke="#1A2433" strokeWidth="1.5" />
      {/* Head + horn + cream face */}
      <circle cx="64" cy="94" r="24" fill="#D94343" stroke="#1A2433" strokeWidth="1.8" />
      <polygon points="58,72 64,52 72,72" fill="#F6E7B9" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="62" cy="100" rx="16" ry="12" fill="#F6E7B9" stroke="#1A2433" strokeWidth="1.4" />
      <ExpressionFace mood={mood} cx={62} cy={92} eyeSpacing={18} />
    </g>
  );
}

function TaillowSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Tail feathers */}
      <polygon points="124,116 164,104 146,122 162,134 122,126" fill="#25396B" stroke="#1A2433" strokeWidth="1.8" />
      {/* Wing */}
      <ellipse cx="114" cy="106" rx="24" ry="14" transform="rotate(-14 114 106)" fill="#2E4785" stroke="#1A2433" strokeWidth="1.8" />
      {/* Body & white belly */}
      <ellipse cx="94" cy="114" rx="28" ry="24" fill="#25396B" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="86" cy="118" rx="18" ry="18" fill="#FFFFFF" />
      {/* Head with red face */}
      <circle cx="80" cy="78" r="24" fill="#25396B" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="78" cy="84" rx="16" ry="12" fill="#E0423B" />
      <ExpressionFace mood={mood} cx={78} cy={78} eyeSpacing={18} />
      <polygon points="74,84 80,91 86,84" fill="#FFC72C" stroke="#1A2433" strokeWidth="1.4" />
    </g>
  );
}

function ShroomishSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Cream body */}
      <ellipse cx="100" cy="114" rx="34" ry="30" fill="#F2E7BF" stroke="#1A2433" strokeWidth="1.8" />
      {/* Stubby feet */}
      <ellipse cx="84" cy="144" rx="10" ry="6" fill="#C9A875" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="116" cy="144" rx="10" ry="6" fill="#C9A875" stroke="#1A2433" strokeWidth="1.6" />
      {/* Green mushroom cap with cream spots */}
      <path d="M58 96 Q100 44 142 96 Q120 106 100 100 Q80 106 58 96 Z" fill="#5FA748" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="80" cy="78" r="7" fill="#F2E7BF" />
      <circle cx="116" cy="76" r="8" fill="#F2E7BF" />
      <circle cx="100" cy="64" r="5" fill="#F2E7BF" />
      <ExpressionFace mood={mood} cx={100} cy={116} eyeSpacing={26} />
    </g>
  );
}

function SkittySvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Long curled pink tail with cream puffs */}
      <path d="M128 118 Q162 108 156 76" fill="none" stroke="#F08CA5" strokeWidth="7" strokeLinecap="round" />
      <circle cx="156" cy="72" r="10" fill="#F9E8C4" stroke="#1A2433" strokeWidth="1.6" />
      {/* Body */}
      <ellipse cx="106" cy="118" rx="30" ry="22" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="96" cy="122" rx="16" ry="12" fill="#F9E8C4" />
      <rect x="76" y="132" width="11" height="18" rx="5" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.6" />
      <rect x="114" y="132" width="11" height="18" rx="5" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.6" />
      {/* Head & pointed ears */}
      <polygon points="56,64 62,42 74,60" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.8" />
      <polygon points="88,60 100,42 104,64" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="80" cy="84" r="27" fill="#F08CA5" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="80" cy="92" rx="20" ry="14" fill="#F9E8C4" />
      <ExpressionFace mood={mood} cx={80} cy={84} eyeSpacing={22} />
    </g>
  );
}

function LotadSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Blue oval body & 4 stubby legs */}
      <rect x="70" y="130" width="12" height="18" rx="5" fill="#3C7CD6" stroke="#1A2433" strokeWidth="1.8" />
      <rect x="118" y="130" width="12" height="18" rx="5" fill="#3C7CD6" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="100" cy="112" rx="38" ry="26" fill="#3C7CD6" stroke="#1A2433" strokeWidth="1.8" />
      {/* Green lily-pad hat */}
      <ellipse cx="100" cy="78" rx="52" ry="16" fill="#65BA4A" stroke="#1A2433" strokeWidth="1.8" />
      <path d="M100 78 L142 70 L146 84 Z" fill="#2E8B57" />
      <ExpressionFace mood={mood} cx={88} cy={110} eyeSpacing={24} />
    </g>
  );
}

function SeedotSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Little feet */}
      <ellipse cx="86" cy="142" rx="9" ry="7" fill="#C9A574" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="114" cy="142" rx="9" ry="7" fill="#C9A574" stroke="#1A2433" strokeWidth="1.6" />
      {/* Brown acorn body */}
      <ellipse cx="100" cy="108" rx="32" ry="34" fill="#7A5436" stroke="#1A2433" strokeWidth="1.8" />
      {/* Tan face mask */}
      <ellipse cx="100" cy="112" rx="24" ry="16" fill="#C9A574" />
      {/* Acorn cap & stem */}
      <rect x="96" y="48" width="8" height="14" rx="3" fill="#5C3D24" stroke="#1A2433" strokeWidth="1.6" />
      <path d="M62 84 Q100 54 138 84 Q100 94 62 84 Z" fill="#A67E53" stroke="#1A2433" strokeWidth="1.8" />
      <ExpressionFace mood={mood} cx={100} cy={110} eyeSpacing={24} />
    </g>
  );
}

function AzurillSvg({mood}: {mood: PokemonMood}) {
  return (
    <g>
      {/* Big round ball tail */}
      <path d="M116 122 Q134 114 146 116" fill="none" stroke="#1A2433" strokeWidth="4" strokeLinecap="round" />
      <circle cx="152" cy="108" r="24" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.8" />
      <circle cx="145" cy="100" r="7" fill="#9ED3FF" opacity="0.6" />
      {/* Big round ears */}
      <ellipse cx="72" cy="60" rx="11" ry="16" transform="rotate(-18 72 60)" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="73" cy="62" rx="6" ry="9" transform="rotate(-18 73 62)" fill="#F08CA5" />
      <ellipse cx="108" cy="60" rx="11" ry="16" transform="rotate(18 108 60)" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="107" cy="62" rx="6" ry="9" transform="rotate(18 107 62)" fill="#F08CA5" />
      {/* Round body */}
      <circle cx="90" cy="106" r="32" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.8" />
      <ellipse cx="90" cy="116" rx="18" ry="14" fill="#FFFFFF" />
      <ellipse cx="78" cy="138" rx="9" ry="6" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.6" />
      <ellipse cx="102" cy="138" rx="9" ry="6" fill="#4BA4F0" stroke="#1A2433" strokeWidth="1.6" />
      <ExpressionFace mood={mood} cx={90} cy={98} eyeSpacing={24} />
    </g>
  );
}

// VERIFY-DESIGN: Simplified Gen 8 cel-shaded SVG approximations honoring each species' signature traits.
export function PokemonSprite({
  speciesId,
  mood = 'neutral',
  className = '',
  showAngerEffect = false,
}: PokemonSpriteProps) {
  const species = getSpeciesById(speciesId);

  if (species.spriteUrl) {
    return (
      <img
        src={species.spriteUrl}
        alt={species.name}
        className={`pokemon-custom-sprite ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 200 175"
      className={`pokemon-svg mood-${mood} ${className}`}
      role="img"
      aria-label={species.name}
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="154" rx="52" ry="10" fill="#1A2433" opacity="0.18" />
      {speciesId === 'poochyena' && <PoochyenaSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'numel' && <NumelSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'electrike' && <ElectrikeSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'trapinch' && <TrapinchSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'aron' && <AronSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'torchic' && <TorchicSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'mudkip' && <MudkipSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'treecko' && <TreeckoSvg mood={mood} showAnger={showAngerEffect} />}
      {speciesId === 'zigzagoon' && <ZigzagoonSvg mood={mood} />}
      {speciesId === 'wurmple' && <WurmpleSvg mood={mood} />}
      {speciesId === 'taillow' && <TaillowSvg mood={mood} />}
      {speciesId === 'shroomish' && <ShroomishSvg mood={mood} />}
      {speciesId === 'skitty' && <SkittySvg mood={mood} />}
      {speciesId === 'lotad' && <LotadSvg mood={mood} />}
      {speciesId === 'seedot' && <SeedotSvg mood={mood} />}
      {speciesId === 'azurill' && <AzurillSvg mood={mood} />}
      <MoodOverlay mood={mood} />
    </svg>
  );
}

/**
 * Generic original Hoenn-style Daycare Trainer holding a Pokéblock pellet bag.
 * Does not depict any named character from the games.
 */
export function HoennTrainerSvg({pouring}: {pouring: boolean}) {
  return (
    <svg
      viewBox="0 0 180 210"
      className={`trainer-svg ${pouring ? 'is-pouring' : ''}`}
      role="img"
      aria-label="Pelatih Daycare Hoenn"
    >
      {/* Backpack */}
      <rect x="26" y="84" width="38" height="58" rx="14" fill="#2E8B57" stroke="#1A2433" strokeWidth="2.2" />
      <rect x="30" y="96" width="22" height="22" rx="6" fill="#7ED957" stroke="#1A2433" strokeWidth="1.6" />
      {/* Torso / Hoenn tropical vest */}
      <path d="M52 84 Q78 76 96 86 L98 156 L50 156 Z" fill="#1BA8B5" stroke="#1A2433" strokeWidth="2.2" />
      <path d="M56 106 L94 106 L94 122 L56 122 Z" fill="#FFFFFF" opacity="0.88" />
      {/* Shorts */}
      <rect x="52" y="152" width="44" height="32" rx="6" fill="#263B5E" stroke="#1A2433" strokeWidth="2.2" />
      {/* Head */}
      <circle cx="78" cy="56" r="24" fill="#F8D2B4" stroke="#1A2433" strokeWidth="2.2" />
      {/* Hair */}
      <path d="M54 52 Q66 26 98 42 Q104 52 96 60 Q72 46 54 58 Z" fill="#3D2E28" stroke="#1A2433" strokeWidth="1.8" />
      {/* Sporty Hoenn Cap */}
      <path d="M52 46 Q78 20 104 44 Z" fill="#E4002B" stroke="#1A2433" strokeWidth="2" />
      <path d="M74 42 L114 46 Q104 52 74 49 Z" fill="#FFFFFF" stroke="#1A2433" strokeWidth="1.8" />
      {/* Friendly eye & smile */}
      <ellipse cx="88" cy="58" rx="3" ry="4" fill="#1A2433" />
      <circle cx="87" cy="56.5" r="1.1" fill="#FFFFFF" />
      <path d="M84 68 Q90 72 95 67" fill="none" stroke="#1A2433" strokeWidth="2" strokeLinecap="round" />

      {/* Extended arm + Pokéblock Food Bag */}
      <g className="trainer-bag-arm">
        <path d="M84 96 L118 82" stroke="#F8D2B4" strokeWidth="12" strokeLinecap="round" />
        <path d="M84 96 L118 82" stroke="#1A2433" strokeWidth="2" strokeLinecap="round" />
        <g transform="translate(116, 62)">
          <rect x="0" y="0" width="40" height="48" rx="9" fill="#FFC72C" stroke="#1A2433" strokeWidth="2.2" />
          <rect x="4" y="14" width="32" height="16" rx="4" fill="#FFFFFF" />
          <circle cx="20" cy="22" r="5" fill="#E4002B" stroke="#1A2433" strokeWidth="1.3" />
          <path d="M8 0 L12 -7 L28 -7 L32 0 Z" fill="#E4002B" stroke="#1A2433" strokeWidth="1.8" />
        </g>
      </g>
    </svg>
  );
}

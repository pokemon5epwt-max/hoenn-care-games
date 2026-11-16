import React from 'react';

export function LocationBanner({title, accent}: {title: string; accent: 'forest' | 'daycare'}) {
  return (
    <div className={`location-banner location-banner-${accent}`}>
      <span className="location-banner-stripe" aria-hidden="true" />
      <span className="location-banner-pokeball" aria-hidden="true" />
      <span className="location-banner-text">{title}</span>
    </div>
  );
}

/**
 * Petalburg Woods forest clearing: tall dark-green trees, sunbeams through canopy,
 * ferns, mushrooms, and thick tropical undergrowth.
 */
export function PetalburgWoodsScene() {
  return (
    <svg
      className="scene-backdrop"
      viewBox="0 0 800 540"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E5C45" />
          <stop offset="55%" stopColor="#2E8B57" />
          <stop offset="100%" stopColor="#1B4D38" />
        </linearGradient>
        <linearGradient id="pw-beam" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFF7B2" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#7ED957" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pw-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4CAF50" />
          <stop offset="100%" stopColor="#26683D" />
        </linearGradient>
      </defs>

      <rect width="800" height="540" fill="url(#pw-sky)" />

      {/* Distant tree trunks */}
      <rect x="60" y="0" width="46" height="400" fill="#174532" />
      <rect x="210" y="0" width="38" height="390" fill="#1A4F39" />
      <rect x="540" y="0" width="42" height="390" fill="#1A4F39" />
      <rect x="690" y="0" width="54" height="410" fill="#174532" />

      {/* Canopy foliage */}
      <circle cx="90" cy="40" r="110" fill="#1A5438" />
      <circle cx="240" cy="25" r="95" fill="#236D47" />
      <circle cx="560" cy="30" r="105" fill="#236D47" />
      <circle cx="720" cy="40" r="115" fill="#1A5438" />

      {/* Sunbeams */}
      <polygon points="240,0 350,0 480,460 310,460" fill="url(#pw-beam)" />
      <polygon points="440,0 530,0 640,460 490,460" fill="url(#pw-beam)" />

      {/* Clearing meadow floor */}
      <ellipse cx="400" cy="445" rx="450" ry="130" fill="url(#pw-ground)" />
      <ellipse cx="400" cy="415" rx="250" ry="52" fill="#7ED957" opacity="0.45" />

      {/* Tropical ferns */}
      <path d="M20 440 Q85 370 145 435 Q85 415 20 440 Z" fill="#2E8B57" />
      <path d="M60 465 Q135 395 190 465 Q125 445 60 465 Z" fill="#7ED957" />
      <path d="M620 460 Q685 385 765 445 Q690 425 620 460 Z" fill="#7ED957" />
      <path d="M665 480 Q730 410 795 470 Q730 455 665 480 Z" fill="#2E8B57" />

      {/* Forest mushrooms */}
      <g transform="translate(105, 436)">
        <rect x="10" y="16" width="12" height="18" rx="4" fill="#F4E3B1" />
        <path d="M0 18 Q16 -2 32 18 Z" fill="#E4002B" />
        <circle cx="10" cy="11" r="2.8" fill="#FFFFFF" />
        <circle cx="22" cy="12" r="2.4" fill="#FFFFFF" />
      </g>
      <g transform="translate(650, 444)">
        <rect x="8" y="12" width="10" height="15" rx="3" fill="#F4E3B1" />
        <path d="M0 14 Q13 -2 26 14 Z" fill="#FFC72C" />
        <circle cx="12" cy="8" r="2.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/**
 * Route 117 Pokémon Day Care: sunny sky, cozy house with fenced yard,
 * flower meadows, tall grass, Hoenn palm-like trees, and pond.
 */
export function Route117DaycareScene() {
  return (
    <svg
      className="scene-backdrop"
      viewBox="0 0 800 540"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="r117-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3BBCE6" />
          <stop offset="65%" stopColor="#9BE3FA" />
          <stop offset="100%" stopColor="#E6F8FF" />
        </linearGradient>
        <linearGradient id="r117-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8DE467" />
          <stop offset="100%" stopColor="#4BB04B" />
        </linearGradient>
      </defs>

      <rect width="800" height="540" fill="url(#r117-sky)" />

      {/* Sunny clouds */}
      <g fill="#FFFFFF" opacity="0.9">
        <ellipse cx="160" cy="82" rx="52" ry="20" />
        <ellipse cx="195" cy="76" rx="34" ry="18" />
        <ellipse cx="620" cy="96" rx="60" ry="22" />
        <ellipse cx="662" cy="88" rx="38" ry="18" />
      </g>

      {/* Rolling hills & grass yard */}
      <ellipse cx="230" cy="295" rx="280" ry="70" fill="#78CE58" />
      <ellipse cx="610" cy="300" rx="260" ry="74" fill="#6EC44F" />
      <rect x="0" y="275" width="800" height="265" fill="url(#r117-grass)" />

      {/* Hoenn palm-like trees */}
      <g transform="translate(65, 130)">
        <rect x="18" y="45" width="14" height="115" rx="6" fill="#9E7348" />
        <ellipse cx="25" cy="40" rx="46" ry="20" fill="#2E8B57" />
        <ellipse cx="10" cy="52" rx="38" ry="16" fill="#52B848" />
        <ellipse cx="44" cy="50" rx="36" ry="15" fill="#7ED957" />
      </g>
      <g transform="translate(690, 140)">
        <rect x="18" y="45" width="14" height="110" rx="6" fill="#9E7348" />
        <ellipse cx="25" cy="40" rx="44" ry="19" fill="#2E8B57" />
        <ellipse cx="42" cy="52" rx="34" ry="15" fill="#7ED957" />
      </g>

      {/* Cozy Day Care House */}
      <g transform="translate(275, 138)">
        <rect x="24" y="64" width="202" height="92" rx="8" fill="#FFF7E2" stroke="#1A2433" strokeWidth="2.2" />
        <polygon points="8,72 125,14 242,72" fill="#E4002B" stroke="#1A2433" strokeWidth="2.2" />
        <rect x="108" y="102" width="34" height="54" rx="5" fill="#9E6236" stroke="#1A2433" strokeWidth="2" />
        <rect x="48" y="94" width="38" height="32" rx="5" fill="#82D4FF" stroke="#1A2433" strokeWidth="2" />
        <rect x="164" y="94" width="38" height="32" rx="5" fill="#82D4FF" stroke="#1A2433" strokeWidth="2" />
        {/* Poké Ball sign */}
        <circle cx="125" cy="56" r="14" fill="#FFFFFF" stroke="#1A2433" strokeWidth="2" />
        <path d="M111 56 A14 14 0 0 1 139 56 Z" fill="#1BA8B5" />
        <line x1="111" y1="56" x2="139" y2="56" stroke="#1A2433" strokeWidth="2" />
      </g>

      {/* Wooden fence */}
      <g fill="#F4E3B1" stroke="#8C6B3F" strokeWidth="1.6">
        <rect x="20" y="294" width="760" height="8" rx="3" />
        <rect x="40" y="280" width="12" height="38" rx="3" />
        <rect x="120" y="280" width="12" height="38" rx="3" />
        <rect x="200" y="280" width="12" height="38" rx="3" />
        <rect x="580" y="280" width="12" height="38" rx="3" />
        <rect x="660" y="280" width="12" height="38" rx="3" />
        <rect x="740" y="280" width="12" height="38" rx="3" />
      </g>

      {/* Pond on the right */}
      <ellipse cx="670" cy="395" rx="95" ry="38" fill="#1BA8B5" stroke="#5DE0EC" strokeWidth="4" />
      <ellipse cx="655" cy="388" rx="45" ry="12" fill="#8FF5FF" opacity="0.5" />

      {/* Flower meadow accents */}
      <g>
        <circle cx="110" cy="365" r="5" fill="#FFC72C" />
        <circle cx="132" cy="382" r="5" fill="#FFFFFF" />
        <circle cx="95" cy="395" r="5" fill="#FF7EA5" />
        <circle cx="520" cy="355" r="5" fill="#FFC72C" />
        <circle cx="542" cy="372" r="5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

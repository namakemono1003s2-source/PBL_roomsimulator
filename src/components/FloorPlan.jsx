import { useStore } from '../store/useStore'
import { PLAN_INFO } from '../data/roomData'

// ── I-type clickable floor plan ─────────────────────────────────────────────
function ITypeFloorPlan({ selectedRoom, setSelectedRoom }) {
  // 座標は src/data/apartmentLayout.js の実面積ベース区画（3Dモデルと同一）に統一
  const rooms = [
    { storeId: 'living',   label: 'LD',    area: '10.8帖', x: 8,   y: 156, w: 124, h: 96  },
    { storeId: 'kitchen',  label: 'K',     area: '3.1帖',  x: 8,   y: 105, w: 72,  h: 51  },
    { storeId: 'bedroom',  label: '洋室①',  area: '6.1帖',  x: 8,   y: 16,  w: 72,  h: 89  },
    { storeId: 'bedroom2', label: '洋室②',  area: '4.3帖',  x: 132, y: 16,  w: 60,  h: 77  },
    { storeId: 'bedroom3', label: '洋室③',  area: '6.7帖',  x: 132, y: 135, w: 60,  h: 117 },
    { storeId: 'bathroom', label: '浴室',   area: '1.5坪',  x: 132, y: 93,  w: 60,  h: 42  },
    { storeId: 'toilet',   label: 'トイレ', area: '0.7㎡',  x: 112, y: 80,  w: 20,  h: 21  },
  ]

  return (
    <svg viewBox="0 0 200 268" className="floor-plan-svg" role="img">
      <defs>
        <pattern id="fpGridI" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 L0 0 0 10" fill="none" stroke="#C8C0B0" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="268" fill="#F2EDE4" />
      <rect x="8" y="16" width="184" height="236" fill="url(#fpGridI)" opacity="0.5" />

      {/* 共用廊下 */}
      <rect x="8" y="4" width="184" height="12" fill="#DDD8CE" />
      <text x="100" y="12" textAnchor="middle" fontSize="6" fill="#6A5840" letterSpacing="1">共用廊下</text>

      {/* ポーチ (玄関前・専有面積外) */}
      <rect x="80" y="5" width="30" height="9" fill="#E4DFCA" stroke="#8A7A60" strokeWidth="0.5" />
      <text x="95" y="12" textAnchor="middle" fontSize="4.5" fill="#7A6A50">ポーチ</text>

      {/* 備蓄倉庫 */}
      <rect x="158" y="4" width="34" height="16" fill="#E2DDD4" stroke="#8A7A60" strokeWidth="0.7" />
      <text x="175" y="13" textAnchor="middle" fontSize="5" fill="#6A5840">備蓄倉庫</text>

      {/* Non-clickable: 玄関+廊下 center zone upper */}
      <rect x="80" y="16" width="52" height="89" fill="#EDE8DF" stroke="#8A7A60" strokeWidth="1" />
      <text x="106" y="57" textAnchor="middle" fontSize="6.5" fill="#5A4A38">玄関</text>
      <text x="106" y="69" textAnchor="middle" fontSize="6" fill="#7A6A50">廊下</text>
      <path d="M80 61 Q80 43 96 43" fill="rgba(180,150,80,0.2)" stroke="#8A6830" strokeWidth="0.8" />

      {/* Non-clickable: center water/hallway zone lower */}
      <rect x="80" y="105" width="52" height="51" fill="#E4EAEE" stroke="#8A7A60" strokeWidth="1" />
      <text x="106" y="132" textAnchor="middle" fontSize="6" fill="#5A6A70">洗面</text>

      {/* Clickable rooms */}
      {rooms.map(r => {
        const sel = r.storeId === selectedRoom
        return (
          <g key={r.storeId} onClick={() => setSelectedRoom(r.storeId)} style={{ cursor: 'pointer' }}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h}
              fill={sel ? 'rgba(117,194,34,0.18)' : '#FAF7F2'}
              stroke={sel ? '#4A8A10' : '#8A7A60'}
              strokeWidth={sel ? 2.5 : 1.5}
            />
            <text x={r.x + r.w/2} y={r.y + r.h/2 - 5}
              textAnchor="middle" fontSize="8.5" fontWeight={sel ? '700' : '600'} fill={sel ? '#1A5208' : '#3A2E20'}>
              {r.label}
            </text>
            <text x={r.x + r.w/2} y={r.y + r.h/2 + 7}
              textAnchor="middle" fontSize="7" fill={sel ? '#3A7018' : '#7A6A50'}>
              {r.area}
            </text>
            {sel && <rect x={r.x+2} y={r.y+2} width={r.w-4} height={r.h-4}
              fill="none" stroke="#75c222" strokeWidth="1" strokeDasharray="3 2" />}
          </g>
        )
      })}

      {/* Structural walls */}
      <rect x="8" y="16" width="184" height="236" fill="none" stroke="#3A2E20" strokeWidth="3.5" />
      <line x1="80"  y1="16"  x2="80"  y2="156" stroke="#3A2E20" strokeWidth="2" />
      <line x1="132" y1="16"  x2="132" y2="252" stroke="#3A2E20" strokeWidth="2" />
      <line x1="8"   y1="105" x2="132" y2="105" stroke="#3A2E20" strokeWidth="1.8" />
      <line x1="132" y1="93"  x2="192" y2="93"  stroke="#3A2E20" strokeWidth="1.8" />
      <line x1="8"   y1="156" x2="132" y2="156" stroke="#3A2E20" strokeWidth="2" />
      <line x1="132" y1="135" x2="192" y2="135" stroke="#3A2E20" strokeWidth="1.8" />

      {/* Windows (balcony side) */}
      <line x1="18"  y1="252" x2="90"  y2="252" stroke="#4A7090" strokeWidth="2.5" />
      <line x1="142" y1="252" x2="180" y2="252" stroke="#4A7090" strokeWidth="2.5" />

      {/* バルコニー */}
      <rect x="8" y="252" width="184" height="14" fill="#E4DFCA" stroke="#8A7A60" strokeWidth="1" strokeDasharray="4 2" />
      <text x="100" y="261" textAnchor="middle" fontSize="6" fill="#7A6A50" letterSpacing="0.5">バルコニー</text>

      {/* North */}
      <g transform="translate(183, 26)">
        <circle r="8" fill="white" stroke="#8A7A60" strokeWidth="0.8" opacity="0.9" />
        <polygon points="0,-5 -2,2 0,1 2,2" fill="#3A2E20" />
        <text y="5" textAnchor="middle" fontSize="5" fontWeight="700" fill="#3A2E20">N</text>
      </g>
    </svg>
  )
}

// ── H-type clickable floor plan ─────────────────────────────────────────────
function HTypeFloorPlan({ selectedRoom, setSelectedRoom }) {
  const rooms = [
    { storeId: 'living',   label: 'LDK',  area: '11.2帖', x: 76, y: 16,  w: 112, h: 132 },
    { storeId: 'bedroom',  label: '洋室',  area: '6.2帖',  x: 76, y: 148, w: 112, h: 76  },
    { storeId: 'bathroom', label: '浴室',  area: '1.5坪',  x: 16, y: 155, w: 60,  h: 69  },
  ]

  return (
    <svg viewBox="0 0 200 240" className="floor-plan-svg" role="img">
      <defs>
        <pattern id="fpGridH" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 L0 0 0 10" fill="none" stroke="#C8C0B0" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="240" fill="#F2EDE4" />
      <rect x="16" y="16" width="172" height="208" fill="url(#fpGridH)" opacity="0.5" />

      {/* 共用廊下 — left side */}
      <rect x="4" y="30" width="12" height="170" fill="#DDD8CE" />
      <text x="10" y="120" textAnchor="middle" fontSize="5" fill="#6A5840"
        transform="rotate(-90 10 120)" letterSpacing="0.8">共用廊下</text>

      {/* Non-clickable: 玄関+廊下 zone */}
      <rect x="16" y="16" width="60" height="92" fill="#EDE8DF" stroke="#8A7A60" strokeWidth="1" />
      <text x="46" y="55" textAnchor="middle" fontSize="6.5" fill="#5A4A38">玄関</text>
      <text x="46" y="67" textAnchor="middle" fontSize="6" fill="#7A6A50">廊下</text>
      <path d="M16 68 Q16 52 30 52" fill="rgba(180,150,80,0.2)" stroke="#8A6830" strokeWidth="0.8" />

      {/* Non-clickable: 洗面室+洗濯機 */}
      <rect x="16" y="108" width="60" height="47" fill="#E4EAEE" stroke="#8A7A60" strokeWidth="1" />
      <text x="46" y="128" textAnchor="middle" fontSize="6" fill="#5A6A70">洗面室</text>
      <text x="46" y="140" textAnchor="middle" fontSize="5.5" fill="#6A7A80">洗濯機</text>

      {/* Clickable rooms */}
      {rooms.map(r => {
        const sel = r.storeId === selectedRoom
        return (
          <g key={r.storeId} onClick={() => setSelectedRoom(r.storeId)} style={{ cursor: 'pointer' }}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h}
              fill={sel ? 'rgba(117,194,34,0.18)' : '#FAF7F2'}
              stroke={sel ? '#4A8A10' : '#8A7A60'}
              strokeWidth={sel ? 2.5 : 1.5}
            />
            <text x={r.x+r.w/2} y={r.y+r.h/2 - 5}
              textAnchor="middle" fontSize="9" fontWeight={sel ? '700' : '600'} fill={sel ? '#1A5208' : '#3A2E20'}>
              {r.label}
            </text>
            <text x={r.x+r.w/2} y={r.y+r.h/2 + 8}
              textAnchor="middle" fontSize="7.5" fill={sel ? '#3A7018' : '#7A6A50'}>
              {r.area}
            </text>
            {sel && <rect x={r.x+2} y={r.y+2} width={r.w-4} height={r.h-4}
              fill="none" stroke="#75c222" strokeWidth="1" strokeDasharray="3 2" />}
          </g>
        )
      })}

      {/* Structural walls */}
      <rect x="16" y="16" width="172" height="208" fill="none" stroke="#3A2E20" strokeWidth="3.5" />
      <line x1="76"  y1="16"  x2="76"  y2="224" stroke="#3A2E20" strokeWidth="2" />
      <line x1="16"  y1="108" x2="76"  y2="108" stroke="#3A2E20" strokeWidth="1.8" />
      <line x1="76"  y1="148" x2="188" y2="148" stroke="#3A2E20" strokeWidth="2" />
      <line x1="16"  y1="155" x2="76"  y2="155" stroke="#3A2E20" strokeWidth="1.8" />

      {/* バルコニー — right side */}
      <rect x="188" y="30" width="14" height="118" fill="#E4DFCA" stroke="#8A7A60" strokeWidth="1" strokeDasharray="3 2" />
      <text x="195" y="94" textAnchor="middle" fontSize="5" fill="#7A6A50"
        transform="rotate(90 195 94)">バルコニー</text>

      {/* Windows */}
      <line x1="188" y1="36"  x2="188" y2="138" stroke="#4A7090" strokeWidth="2.5" />
      <line x1="88"  y1="16"  x2="160" y2="16"  stroke="#4A7090" strokeWidth="2.5" />

      {/* North */}
      <g transform="translate(172, 26)">
        <circle r="8" fill="white" stroke="#8A7A60" strokeWidth="0.8" opacity="0.9" />
        <polygon points="0,-5 -2,2 0,1 2,2" fill="#3A2E20" />
        <text y="5" textAnchor="middle" fontSize="5" fontWeight="700" fill="#3A2E20">N</text>
      </g>
    </svg>
  )
}

// ── Export ──────────────────────────────────────────────────────────────────
export default function FloorPlan() {
  const planType = useStore(s => s.planType)
  const selectedRoom = useStore(s => s.selectedRoom)
  const setSelectedRoom = useStore(s => s.setSelectedRoom)
  const planInfo = PLAN_INFO[planType]

  return (
    <div className="floor-plan-wrap">
      <div className="plan-tag">
        <span className="plan-unit">{planInfo?.name}</span>
        <span className="plan-type">{planInfo?.type}</span>
        <span className="plan-area">{planInfo?.area}</span>
      </div>
      {planType === 'I'
        ? <ITypeFloorPlan selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        : <HTypeFloorPlan selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
      }
      <p className="plan-hint">部屋をタップして切替</p>
    </div>
  )
}

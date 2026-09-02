import { useState } from 'react'
import { useStore } from '../store/useStore'
import { PLAN_INFO } from '../data/roomData'
import floorPlanI from '../assets/floorplan-i-type.png'

// ── H-type schematic SVG ────────────────────────────────────────────────────
// Layout: 共用廊下 left, 玄関/廊下(top-left), 洗面室/洗濯機(mid-left), 浴室(bottom-left),
//         LDK(right-upper large), 洋室(right-lower), バルコニー(right side)
function HTypeSVG() {
  return (
    <svg viewBox="0 0 200 240" className="plan-svg" role="img" aria-label="Hタイプ間取り">
      <defs>
        <pattern id="gridH" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0 L0 0 0 10" fill="none" stroke="#C0B8A8" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="200" height="240" fill="#F4EFE6" />
      <rect x="16" y="16" width="172" height="208" fill="url(#gridH)" opacity="0.5" />

      {/* 共用廊下 — vertical left strip */}
      <rect x="4" y="30" width="12" height="170" fill="#DDD8CE" />
      <text x="10" y="120" textAnchor="middle" fontSize="5" fill="#6A5840"
        transform="rotate(-90 10 120)" letterSpacing="0.8">共用廊下</text>

      {/* 玄関+廊下 zone */}
      <rect x="16" y="16" width="60" height="92" fill="#EDE8DF" stroke="#7A6A58" strokeWidth="1.2" />
      <text x="46" y="56" textAnchor="middle" fontSize="7.5" fill="#5A4A38" fontWeight="600">玄関</text>
      <text x="46" y="68" textAnchor="middle" fontSize="7" fill="#7A6A50">廊下</text>
      <path d="M16 70 Q16 54 30 54" fill="rgba(180,150,80,0.2)" stroke="#8A6830" strokeWidth="0.8" />

      {/* 洗面室+洗濯機 zone */}
      <rect x="16" y="108" width="60" height="47" fill="#E4EAEE" stroke="#7A6A58" strokeWidth="1.2" />
      <text x="46" y="128" textAnchor="middle" fontSize="7" fill="#5A6A70">洗面室</text>
      <text x="46" y="140" textAnchor="middle" fontSize="6.5" fill="#6A7A80">洗濯機</text>

      {/* 浴室 */}
      <rect x="16" y="155" width="60" height="69" fill="#E4EAEE" stroke="#7A6A58" strokeWidth="1.5" />
      <text x="46" y="184" textAnchor="middle" fontSize="8" fill="#5A6A70" fontWeight="600">浴室</text>
      <text x="46" y="197" textAnchor="middle" fontSize="6.5" fill="#6A7A80">UB 1416</text>

      {/* LDK */}
      <rect x="76" y="16" width="112" height="132" fill="#FBF8F2" stroke="#7A6A58" strokeWidth="1.8" />
      <text x="132" y="77" textAnchor="middle" fontSize="11" fill="#3A2E20" fontWeight="700">LDK</text>
      <text x="132" y="92" textAnchor="middle" fontSize="8" fill="#7A6A50">11.2帖</text>
      <path d="M76 50 Q76 66 90 66" fill="rgba(180,150,80,0.2)" stroke="#8A6830" strokeWidth="0.8" />
      {/* window top */}
      <line x1="96" y1="16" x2="170" y2="16" stroke="#5A8098" strokeWidth="2.5" />

      {/* 洋室 */}
      <rect x="76" y="148" width="112" height="76" fill="#FBF8F2" stroke="#7A6A58" strokeWidth="1.5" />
      <text x="132" y="184" textAnchor="middle" fontSize="9.5" fill="#3A2E20" fontWeight="700">洋室</text>
      <text x="132" y="198" textAnchor="middle" fontSize="7.5" fill="#7A6A50">6.2帖</text>
      <path d="M76 164 Q76 148 90 148" fill="rgba(180,150,80,0.2)" stroke="#8A6830" strokeWidth="0.8" />
      {/* window bottom */}
      <line x1="96" y1="224" x2="170" y2="224" stroke="#5A8098" strokeWidth="2.5" />

      {/* Outer walls */}
      <rect x="16" y="16" width="172" height="208" fill="none" stroke="#3A2E20" strokeWidth="3" />
      {/* Inner walls */}
      <line x1="76"  y1="16"  x2="76"  y2="224" stroke="#3A2E20" strokeWidth="2" />
      <line x1="16"  y1="108" x2="76"  y2="108" stroke="#3A2E20" strokeWidth="1.8" />
      <line x1="76"  y1="148" x2="188" y2="148" stroke="#3A2E20" strokeWidth="2" />
      <line x1="16"  y1="155" x2="76"  y2="155" stroke="#3A2E20" strokeWidth="1.8" />

      {/* バルコニー — right side */}
      <rect x="188" y="30" width="14" height="118" fill="#E4DFCA" stroke="#8A7A60" strokeWidth="1" strokeDasharray="3 2" />
      <text x="195" y="94" textAnchor="middle" fontSize="5" fill="#7A6A50"
        transform="rotate(90 195 94)">バルコニー</text>
      {/* window right side */}
      <line x1="188" y1="36"  x2="188" y2="138" stroke="#5A8098" strokeWidth="2.5" />

      {/* North */}
      <g transform="translate(168, 28)">
        <circle r="8" fill="white" stroke="#8A7A60" strokeWidth="0.8" opacity="0.9" />
        <polygon points="0,-5 -2,2 0,1 2,2" fill="#3A2E20" />
        <text y="5" textAnchor="middle" fontSize="5" fontWeight="700" fill="#3A2E20">N</text>
      </g>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PlanSelector() {
  const selectPlan = useStore(s => s.selectPlan)
  const goBack     = useStore(s => s.goBack)
  const [hovered, setHovered] = useState(null)

  return (
    <div className="sel-screen">
      <div className="sel-header">
        <div className="sel-logo-row">
          <div className="brand-logo"><span className="logo-kanji">和</span></div>
          <div>
            <div className="brand-name">和建設株式会社</div>
            <div className="brand-tagline">鷹匠マンション　インテリアシミュレーター</div>
          </div>
        </div>
        <div className="sel-stepbar">
          <span className="sel-stepitem active"><span className="sel-stepnum">1</span>間取りを選ぶ</span>
          <span className="sel-stepsep">›</span>
          <span className="sel-stepitem"><span className="sel-stepnum">2</span>インテリア</span>
          <span className="sel-stepsep">›</span>
          <span className="sel-stepitem"><span className="sel-stepnum">3</span>カスタマイズ</span>
        </div>
        <h1 className="sel-title">間取りを選択してください</h1>
        <p className="sel-sub">シミュレーションしたい間取りタイプをお選びください</p>
      </div>

      <div className="plan-cards">
        {(['I', 'H']).map(type => {
          const info = PLAN_INFO[type]
          return (
            <button
              key={type}
              className={`plan-card ${hovered === type ? 'hover' : ''}`}
              onMouseEnter={() => setHovered(type)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => selectPlan(type)}
            >
              <div className="plan-card-type">{info.name}</div>
              <div className="plan-card-svg-wrap">
                {type === 'I'
                  ? <img src={floorPlanI} alt="Iタイプ間取り図" className="plan-card-photo" />
                  : <HTypeSVG />}
              </div>
              <div className="plan-card-details">
                <div className="plan-detail-row">
                  <span className="plan-detail-badge">{info.type}</span>
                  <span className="plan-detail-area">{info.area}</span>
                  <span className="plan-detail-floor">{info.floor}</span>
                </div>
                <ul className="plan-room-list">
                  {type === 'I' ? (
                    <>
                      <li>リビング・ダイニング <em>10.8帖</em></li>
                      <li>キッチン <em>3.1帖</em></li>
                      <li>洋室①②③ <em>6.1帖 ／ 4.3帖 ／ 6.7帖</em></li>
                    </>
                  ) : (
                    <>
                      <li>リビング・ダイニング・キッチン <em>11.2帖</em></li>
                      <li>洋室 <em>6.2帖</em></li>
                      <li>バルコニー×2</li>
                    </>
                  )}
                </ul>
              </div>
              <div className="plan-card-select">
                このタイプを選択
                <span className="plan-card-arrow">→</span>
              </div>
            </button>
          )
        })}
      </div>

      <button className="sel-back-btn" onClick={goBack}>← ホームへ戻る</button>
      <p className="sel-footer">© 和建設株式会社　鷹匠マンション</p>
    </div>
  )
}

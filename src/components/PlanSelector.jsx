import { useStore } from '../store/useStore'
import { PLAN_INFO } from '../data/roomData'
import floorPlanI from '../assets/floorplan-i-type.png'

// ── H-type schematic SVG（新デザイントークンに合わせて再配色）───────────────
function HTypeSVG() {
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label="Hタイプ間取り">
      <rect x="0" y="0" width="200" height="240" fill="#f3f5fe" />
      <rect x="16" y="16" width="172" height="208" fill="var(--fill-plan)" />

      <rect x="4" y="30" width="12" height="170" fill="#e2e4f0" />
      <text x="10" y="120" textAnchor="middle" fontSize="5" fill="#8a8ea0"
        transform="rotate(-90 10 120)" letterSpacing="0.8">共用廊下</text>

      <rect x="16" y="16" width="60" height="92" fill="#f8f9fd" stroke="#9397ab" strokeWidth="1" />
      <text x="46" y="56" textAnchor="middle" fontSize="7.5" fill="#54586a" fontWeight="600">玄関</text>
      <text x="46" y="68" textAnchor="middle" fontSize="7" fill="#75798c">廊下</text>

      <rect x="16" y="108" width="60" height="47" fill="#f0f1f8" stroke="#9397ab" strokeWidth="1" />
      <text x="46" y="128" textAnchor="middle" fontSize="7" fill="#54586a">洗面室</text>
      <text x="46" y="140" textAnchor="middle" fontSize="6.5" fill="#75798c">洗濯機</text>

      <rect x="16" y="155" width="60" height="69" fill="#f0f1f8" stroke="#9397ab" strokeWidth="1.5" />
      <text x="46" y="184" textAnchor="middle" fontSize="8" fill="#54586a" fontWeight="600">浴室</text>
      <text x="46" y="197" textAnchor="middle" fontSize="6.5" fill="#75798c">UB 1416</text>

      <rect x="76" y="16" width="112" height="132" fill="#fbfbfe" stroke="#9397ab" strokeWidth="1.8" />
      <text x="132" y="77" textAnchor="middle" fontSize="11" fill="#2a2c38" fontWeight="700">LDK</text>
      <text x="132" y="92" textAnchor="middle" fontSize="8" fill="#75798c">11.2帖</text>
      <line x1="96" y1="16" x2="170" y2="16" stroke="#9184d9" strokeWidth="3" />

      <rect x="76" y="148" width="112" height="76" fill="#fbfbfe" stroke="#9397ab" strokeWidth="1.5" />
      <text x="132" y="184" textAnchor="middle" fontSize="9.5" fill="#2a2c38" fontWeight="700">洋室</text>
      <text x="132" y="198" textAnchor="middle" fontSize="7.5" fill="#75798c">6.2帖</text>
      <line x1="96" y1="224" x2="170" y2="224" stroke="#9184d9" strokeWidth="3" />

      <rect x="16" y="16" width="172" height="208" fill="none" stroke="#2a2c38" strokeWidth="3" />
      <line x1="76"  y1="16"  x2="76"  y2="224" stroke="#2a2c38" strokeWidth="2" />
      <line x1="16"  y1="108" x2="76"  y2="108" stroke="#2a2c38" strokeWidth="1.8" />
      <line x1="76"  y1="148" x2="188" y2="148" stroke="#2a2c38" strokeWidth="2" />
      <line x1="16"  y1="155" x2="76"  y2="155" stroke="#2a2c38" strokeWidth="1.8" />

      <rect x="188" y="30" width="14" height="118" fill="#e2e4f0" stroke="#9397ab" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="188" y1="36"  x2="188" y2="138" stroke="#9184d9" strokeWidth="3" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PlanSelector() {
  const selectPlan = useStore(s => s.selectPlan)
  const goBack     = useStore(s => s.goBack)

  return (
    <div className="sel-screen">
      <div className="sel-header-bar">
        <div className="sel-header-left">
          <button className="sel-back-link" onClick={goBack}>
            <i className="ph ph-arrow-left" />
            戻る
          </button>
          <span className="sel-vrule" />
          <span className="sel-crumb">鷹匠マンション</span>
        </div>
        <div className="sel-stepbar">
          <span className="sel-stepbar-item active">01 間取り</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item">02 暮らし方</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item">03 カスタマイズ</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item">04 確認</span>
        </div>
      </div>

      <div className="sel-titlewrap">
        <h1 className="sel-title">どちらの間取りで見ますか</h1>
        <p className="sel-sub">ご契約中のタイプが分からない場合は、担当者にご確認ください。あとから切り替えられます。</p>
      </div>

      <div className="sel-body">
        <div className="plan-cards">
          <button className="plan-card recommend" onClick={() => selectPlan('I')}>
            <div className="plan-card-head">
              <div>
                <div className="plan-card-label">I TYPE ／ STANDARD PLAN</div>
                <div className="plan-card-name">3LDK ＋ 備蓄倉庫</div>
              </div>
              <div className="plan-card-area-wrap">
                <span className="plan-card-area">68.26</span><span className="plan-card-area-unit">㎡</span>
                <div className="plan-card-floor">約20.64坪・8F / 14F</div>
              </div>
            </div>
            <div className="plan-card-figure">
              <div className="plan-figure-frame">
                <img src={floorPlanI} alt="Iタイプ間取り図" />
              </div>
            </div>
            <div className="plan-card-foot">
              <div className="plan-tags">
                <span className="plan-tag-chip accent">6部屋をカスタマイズ</span>
                <span className="plan-tag-chip">LD 10.8帖</span>
                <span className="plan-tag-chip">洋室 6.1／4.3／6.7帖</span>
                <span className="plan-tag-chip">バルコニー 12.00㎡</span>
              </div>
              <div className="plan-select-row">
                <span className="plan-select-hint">ご家族3〜4人の想定</span>
                <span className="plan-select-btn accent">
                  このタイプで見る
                  <i className="ph ph-arrow-right" />
                </span>
              </div>
            </div>
          </button>

          <button className="plan-card" onClick={() => selectPlan('H')}>
            <div className="plan-card-head">
              <div>
                <div className="plan-card-label">H TYPE</div>
                <div className="plan-card-name">1LDK</div>
              </div>
              <div className="plan-card-area-wrap">
                <span className="plan-card-area">42.12</span><span className="plan-card-area-unit">㎡</span>
                <div className="plan-card-floor">2F / 14F</div>
              </div>
            </div>
            <div className="plan-card-figure">
              <div className="plan-figure-frame">
                <HTypeSVG />
              </div>
            </div>
            <div className="plan-card-foot">
              <div className="plan-tags">
                <span className="plan-tag-chip">3部屋をカスタマイズ</span>
                <span className="plan-tag-chip">LDK 18.6㎡</span>
                <span className="plan-tag-chip">バルコニー×2</span>
              </div>
              <div className="plan-select-row">
                <span className="plan-select-hint">お一人・ご夫婦の想定</span>
                <span className="plan-select-btn">
                  このタイプで見る
                  <i className="ph ph-arrow-right" />
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <p className="sel-footer">© 和建設株式会社　鷹匠マンション</p>
    </div>
  )
}

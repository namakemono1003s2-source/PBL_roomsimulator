import { useState } from 'react'
import { useStore } from '../store/useStore'
import { FURNITURE_TEMPLATES, PLAN_INFO, STYLE_OPTIONS } from '../data/roomData'
import { recommendInteriorPlan } from '../utils/interiorAdvisor'

const FAMILY_TYPE_OPTIONS = [
  { id: 'single',       label: '一人暮らし' },
  { id: 'couple',       label: '夫婦二人' },
  { id: 'couple_child', label: '夫婦＋子供' },
  { id: 'multi_child',  label: '子供2人以上' },
  { id: 'senior',       label: 'シニア世帯' },
]
const AGE_OPTIONS = [
  { id: '20s',  label: '20代' },
  { id: '30s',  label: '30代' },
  { id: '40s',  label: '40代' },
  { id: '50s+', label: '50代以上' },
]
const HOBBY_OPTIONS = [
  { id: 'reading',      label: '読書' },
  { id: 'cooking',      label: '料理' },
  { id: 'gaming',       label: 'ゲーム' },
  { id: 'gardening',    label: 'ガーデニング' },
  { id: 'entertaining', label: 'ホームパーティー' },
]
const LIFESTYLE_OPTIONS = [
  { id: 'minimalist', label: 'ミニマリスト' },
  { id: 'collector',  label: 'コレクター気質' },
  { id: 'social',     label: '人を招くのが好き' },
]
const BUDGET_OPTIONS = [
  { id: 'standard', label: '標準予算' },
  { id: 'plus',     label: '予算にゆとりあり' },
]

function AdvisorPanel({ planType, onAccept }) {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState({
    familyType: 'couple_child',
    ageBracket: '30s',
    hobby: 'cooking',
    lifestyle: 'social',
    remoteWork: false,
    budget: 'standard',
  })
  const [result, setResult] = useState(null)

  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }))
  const diagnose = () => setResult(recommendInteriorPlan(profile, planType))

  const tmplLabel = result && FURNITURE_TEMPLATES.find(t => t.id === result.template)?.label
  const styleLabel = result && STYLE_OPTIONS.find(s => s.id === result.style)?.label

  return (
    <div className="advisor-panel">
      <button className="advisor-toggle" onClick={() => setOpen(o => !o)}>
        🤖 AIおすすめ診断{open ? ' ▲' : ' ▼'}
      </button>

      {open && (
        <div className="advisor-body">
          <p className="advisor-desc">家族構成やライフスタイルから、おすすめのインテリアプランをご提案します。</p>

          <div className="advisor-form">
            <label>
              家族構成
              <select value={profile.familyType} onChange={e => update('familyType', e.target.value)}>
                {FAMILY_TYPE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label>
              年代
              <select value={profile.ageBracket} onChange={e => update('ageBracket', e.target.value)}>
                {AGE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label>
              趣味
              <select value={profile.hobby} onChange={e => update('hobby', e.target.value)}>
                {HOBBY_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label>
              生活スタイル
              <select value={profile.lifestyle} onChange={e => update('lifestyle', e.target.value)}>
                {LIFESTYLE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label>
              予算
              <select value={profile.budget} onChange={e => update('budget', e.target.value)}>
                {BUDGET_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label className="advisor-checkbox">
              <input type="checkbox" checked={profile.remoteWork} onChange={e => update('remoteWork', e.target.checked)} />
              在宅勤務あり
            </label>
          </div>

          <button className="advisor-diagnose-btn" onClick={diagnose}>診断する</button>

          {result && (
            <div className="advisor-result">
              <div className="advisor-result-title">おすすめ: {tmplLabel} / {styleLabel}</div>
              <p className="advisor-result-concept">{result.concept}</p>
              <ul className="advisor-result-reasons">
                {result.reasoning.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              <button className="advisor-accept-btn" onClick={() => onAccept(result.template, result.style)}>
                このプランで始める →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Furniture density illustration (simple dot/block pattern)
function LuxuryPreview() {
  return (
    <svg viewBox="0 0 200 130" className="furn-preview-svg">
      <rect width="200" height="130" fill="#1C1810" rx="4" />
      {/* Floor */}
      <rect x="10" y="90" width="180" height="32" fill="#8A6A40" opacity="0.5" />
      {/* Back wall */}
      <rect x="10" y="20" width="180" height="70" fill="#2E2820" />
      {/* Sofa - single, minimal */}
      <rect x="55" y="68" width="90" height="28" rx="3" fill="#4A4A5A" />
      <rect x="55" y="60" width="90" height="12" rx="2" fill="#3A3A4A" />
      {/* Coffee table - small glass */}
      <rect x="80" y="50" width="40" height="18" rx="1" fill="#606080" opacity="0.7" />
      {/* TV unit - minimal */}
      <rect x="70" y="24" width="60" height="10" rx="1" fill="#181818" />
      <rect x="76" y="26" width="48" height="6" rx="0.5" fill="#080808" />
      {/* Plant */}
      <ellipse cx="165" cy="60" rx="8" ry="10" fill="#2A5A20" />
      <rect x="163" y="70" width="4" height="10" fill="#5A3A20" />
      {/* Label */}
      <text x="100" y="118" textAnchor="middle" fontSize="8" fill="#8A7050">少なめ・ゆとりある空間</text>
    </svg>
  )
}

function FamilyPreview() {
  return (
    <svg viewBox="0 0 200 130" className="furn-preview-svg">
      <rect width="200" height="130" fill="#1C1810" rx="4" />
      {/* Floor */}
      <rect x="10" y="90" width="180" height="32" fill="#8A6A40" opacity="0.5" />
      {/* Back wall */}
      <rect x="10" y="20" width="180" height="70" fill="#2E2820" />
      {/* Sofa */}
      <rect x="45" y="68" width="90" height="26" rx="3" fill="#6A6A7A" />
      <rect x="45" y="60" width="90" height="11" rx="2" fill="#5A5A6A" />
      {/* Coffee table */}
      <rect x="70" y="50" width="50" height="14" rx="1" fill="#505060" />
      {/* TV unit */}
      <rect x="60" y="24" width="80" height="12" rx="1" fill="#202020" />
      <rect x="65" y="26" width="70" height="8" rx="0.5" fill="#080808" />
      {/* Dining table + chairs (right side) */}
      <rect x="148" y="40" width="38" height="26" rx="2" fill="#503820" />
      <rect x="144" y="44" width="8" height="8" rx="1" fill="#403020" />
      <rect x="186" y="44" width="8" height="8" rx="1" fill="#403020" />
      <rect x="157" y="36" width="8" height="6" rx="1" fill="#403020" />
      <rect x="171" y="64" width="8" height="6" rx="1" fill="#403020" />
      {/* Plant */}
      <ellipse cx="24" cy="62" rx="8" ry="9" fill="#2A5A20" />
      <rect x="22" y="71" width="4" height="9" fill="#5A3A20" />
      {/* another plant */}
      <ellipse cx="135" cy="65" rx="6" ry="7" fill="#336622" />
      {/* Label */}
      <text x="100" y="118" textAnchor="middle" fontSize="8" fill="#8A7050">充実した家具・実用配置</text>
    </svg>
  )
}

export default function FurnitureSelector() {
  const selectFurniture = useStore(s => s.selectFurniture)
  const goBack = useStore(s => s.goBack)
  const planType = useStore(s => s.planType)
  const planInfo = PLAN_INFO[planType]

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
          <span className="sel-stepitem done"><span className="sel-stepnum">1</span>間取りを選ぶ</span>
          <span className="sel-stepsep">›</span>
          <span className="sel-stepitem active"><span className="sel-stepnum">2</span>インテリア</span>
          <span className="sel-stepsep">›</span>
          <span className="sel-stepitem"><span className="sel-stepnum">3</span>カスタマイズ</span>
        </div>
        <div className="sel-breadcrumb">
          <span className="crumb-done">間取り: {planInfo?.name}（{planInfo?.type}）</span>
        </div>
        <h1 className="sel-title">インテリアスタイルを選択してください</h1>
        <p className="sel-sub">3Dビュー内で壁・床・照明は部屋ごとに細かく変更できます</p>
      </div>

      <AdvisorPanel planType={planType} onAccept={selectFurniture} />

      <div className="furn-cards">
        {FURNITURE_TEMPLATES.map(tmpl => (
          <button
            key={tmpl.id}
            className="furn-card"
            onClick={() => selectFurniture(tmpl.id)}
          >
            <div className="furn-card-label">
              <span className="furn-card-icon">{tmpl.icon}</span>
              <div>
                <div className="furn-card-name">{tmpl.label}</div>
                <div className="furn-card-sub">{tmpl.sub}</div>
              </div>
            </div>

            <div className="furn-preview-wrap">
              {tmpl.id === 'luxury' ? <LuxuryPreview /> : <FamilyPreview />}
            </div>

            <p className="furn-card-desc">{tmpl.desc}</p>

            <div className="furn-card-select">
              このプランで始める
              <span className="plan-card-arrow">→</span>
            </div>
          </button>
        ))}
      </div>

      <button className="sel-back-btn" onClick={goBack}>
        ← 間取り選択に戻る
      </button>

      <p className="sel-footer">© 和建設株式会社　鷹匠マンション</p>
    </div>
  )
}

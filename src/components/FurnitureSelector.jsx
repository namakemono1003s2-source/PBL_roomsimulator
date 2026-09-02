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

// 家具密度イラスト（実写差し替え待ちのプレースホルダー）
function LuxuryPreview() {
  return (
    <svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#20222e" />
      <rect x="10" y="90" width="180" height="32" fill="#3a3d4d" opacity="0.6" />
      <rect x="10" y="20" width="180" height="70" fill="#282a38" />
      <rect x="55" y="68" width="90" height="28" rx="3" fill="#4a4a5f" />
      <rect x="55" y="60" width="90" height="12" rx="2" fill="#3a3a4d" />
      <rect x="80" y="50" width="40" height="18" rx="1" fill="#6c66a0" opacity="0.6" />
      <rect x="70" y="24" width="60" height="10" rx="1" fill="#181820" />
      <rect x="76" y="26" width="48" height="6" rx="0.5" fill="#0a0a10" />
      <ellipse cx="165" cy="60" rx="8" ry="10" fill="#3a5a30" />
      <rect x="163" y="70" width="4" height="10" fill="#4a3a2a" />
    </svg>
  )
}

function FamilyPreview() {
  return (
    <svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#20222e" />
      <rect x="10" y="90" width="180" height="32" fill="#3a3d4d" opacity="0.6" />
      <rect x="10" y="20" width="180" height="70" fill="#282a38" />
      <rect x="45" y="68" width="90" height="26" rx="3" fill="#5a5a70" />
      <rect x="45" y="60" width="90" height="11" rx="2" fill="#4a4a5f" />
      <rect x="70" y="50" width="50" height="14" rx="1" fill="#454558" />
      <rect x="60" y="24" width="80" height="12" rx="1" fill="#1a1a22" />
      <rect x="65" y="26" width="70" height="8" rx="0.5" fill="#0a0a10" />
      <rect x="148" y="40" width="38" height="26" rx="2" fill="#4a3828" />
      <rect x="144" y="44" width="8" height="8" rx="1" fill="#3a2c20" />
      <rect x="186" y="44" width="8" height="8" rx="1" fill="#3a2c20" />
      <rect x="157" y="36" width="8" height="6" rx="1" fill="#3a2c20" />
      <rect x="171" y="64" width="8" height="6" rx="1" fill="#3a2c20" />
      <ellipse cx="24" cy="62" rx="8" ry="9" fill="#3a5a30" />
      <rect x="22" y="71" width="4" height="9" fill="#4a3a2a" />
      <ellipse cx="135" cy="65" rx="6" ry="7" fill="#336622" />
    </svg>
  )
}

const FURN_SPECS = {
  luxury: { name: 'ゆとり重視', furniture: '7点', width: '900', dining: '2〜4人', floor: '31' },
  family: { name: '収納重視',   furniture: '12点', width: '620', dining: '4〜6人', floor: '44' },
}

export default function FurnitureSelector() {
  const selectFurniture = useStore(s => s.selectFurniture)
  const goBack = useStore(s => s.goBack)
  const planType = useStore(s => s.planType)
  const planInfo = PLAN_INFO[planType]

  return (
    <div className="sel-screen">
      <div className="sel-header-bar">
        <div className="sel-header-left">
          <button className="sel-back-link" onClick={goBack}>
            <i className="ph ph-arrow-left" />
            間取りを変える
          </button>
          <span className="sel-vrule" />
          <span className="sel-crumb">{planInfo?.name} {planInfo?.type}・{planInfo?.area}</span>
        </div>
        <div className="sel-stepbar">
          <span className="sel-stepbar-item done">01 間取り</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item active">02 暮らし方</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item">03 カスタマイズ</span>
          <span className="sel-stepbar-rule" />
          <span className="sel-stepbar-item">04 確認</span>
        </div>
      </div>

      <div className="sel-titlewrap">
        <h1 className="sel-title">家具の置き方を選んでください</h1>
        <p className="sel-sub">どちらもコーディネーターが実寸で設計した配置です。あとから中で入れ替えることもできます。</p>
      </div>

      <div className="sel-body">
        <AdvisorPanel planType={planType} onAccept={selectFurniture} />

        <div className="furn-cards">
          {FURNITURE_TEMPLATES.map(tmpl => {
            const spec = FURN_SPECS[tmpl.id]
            const recommend = tmpl.id === 'luxury'
            return (
              <button
                key={tmpl.id}
                className={`furn-card ${recommend ? 'recommend' : ''}`}
                onClick={() => selectFurniture(tmpl.id)}
              >
                <div className="furn-card-photo">
                  {tmpl.id === 'luxury' ? <LuxuryPreview /> : <FamilyPreview />}
                  <div className="furn-card-photo-label">
                    <div className="furn-card-eyebrow">{tmpl.sub.toUpperCase()}</div>
                    <div className="furn-card-name">{spec.name}</div>
                  </div>
                </div>

                <div className="furn-card-body">
                  <p className="furn-card-desc">{tmpl.desc.replace(/\n/g, ' ')}</p>

                  <div className="furn-spec-grid">
                    <div>
                      <div className="furn-spec-label">LDの家具点数</div>
                      <div className="furn-spec-value">{spec.furniture}</div>
                    </div>
                    <div>
                      <div className="furn-spec-label">最狭の通路幅</div>
                      <div className="furn-spec-value">{spec.width}<span className="furn-spec-unit">mm</span></div>
                    </div>
                    <div>
                      <div className="furn-spec-label">ダイニング</div>
                      <div className="furn-spec-value">{spec.dining}</div>
                    </div>
                    <div>
                      <div className="furn-spec-label">床の占有率</div>
                      <div className="furn-spec-value">{spec.floor}<span className="furn-spec-unit">%</span></div>
                    </div>
                  </div>

                  <span className="furn-card-select">
                    このプランで見る
                    <i className="ph ph-arrow-right" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <p className="sel-footer">© 和建設株式会社　鷹匠マンション</p>
    </div>
  )
}

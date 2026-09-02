import { useState, Suspense, lazy, Component } from 'react'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import PlanSelector from './components/PlanSelector'
import FurnitureSelector from './components/FurnitureSelector'
import FloorPlan from './components/FloorPlan'
import CustomizationPanel from './components/CustomizationPanel'
import SummaryModal from './components/SummaryModal'
import { PLAN_ROOMS, PLAN_INFO, FURNITURE_TEMPLATES, ROOM_PHOTOS } from './data/roomData'

const ApartmentViewerLazy = lazy(() => import('./components/ApartmentViewer'))

function LoadingRoom() {
  return (
    <div className="viewer-loading">
      <div className="loading-spinner" />
      <p>3Dビューを読み込み中...</p>
    </div>
  )
}

// ApartmentViewer 用のエラーバウンダリ
class ViewerBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  componentDidCatch(e) { console.warn('[ApartmentViewer]', e.message) }
  render() {
    if (this.state.err) return (
      <div className="viewer-loading">
        <p style={{ color:'#c44' }}>3D描画でエラーが発生しました。ページをリロードしてください。</p>
      </div>
    )
    return this.props.children
  }
}

function Simulation() {
  const selectedRoom      = useStore(s => s.selectedRoom)
  const setSelectedRoom   = useStore(s => s.setSelectedRoom)
  const planType          = useStore(s => s.planType)
  const furnitureTemplate = useStore(s => s.furnitureTemplate)
  const resetToStart      = useStore(s => s.resetToStart)
  const goBack            = useStore(s => s.goBack)

  const [showSummary,     setShowSummary]     = useState(false)
  const [showPlan,        setShowPlan]         = useState(true)
  // #6: 「最初から」確認ダイアログ
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  // #5: 初回操作ガイド（localStorage で一度だけ表示）
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('sim-guide-seen'))
  const dismissGuide = () => { localStorage.setItem('sim-guide-seen', '1'); setShowGuide(false) }

  const planInfo  = PLAN_INFO[planType]
  const rooms     = PLAN_ROOMS[planType]
  const tmplLabel = FURNITURE_TEMPLATES.find(t => t.id === furnitureTemplate)?.label || ''

  // Ensure selectedRoom is valid for this plan
  const roomIds = Object.keys(rooms)
  const activeRoom = roomIds.includes(selectedRoom) ? selectedRoom : roomIds[0]
  if (activeRoom !== selectedRoom) setSelectedRoom(activeRoom)

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo"><span className="logo-kanji">和</span></div>
          <div className="brand-text">
            <div className="brand-name">和建設株式会社</div>
            <div className="brand-tagline">鷹匠マンション　インテリアシミュレーター</div>
          </div>
        </div>

        <div className="header-property">
          <div className="prop-badge"><span className="prop-unit">{planInfo?.name}</span></div>
          <div className="prop-info">
            <span>{planInfo?.type}</span>
            <span className="prop-sep">｜</span>
            <span>{planInfo?.area}</span>
            <span className="prop-sep">｜</span>
            <span>{tmplLabel}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* #7: 1ステップ戻る */}
          <button className="btn-back-sim" onClick={goBack}>← 変更</button>
          <button className={`btn-plan ${showPlan ? 'active' : ''}`} onClick={() => setShowPlan(!showPlan)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="5" y1="1" x2="5" y2="13" stroke="currentColor" strokeWidth="1"/>
              <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1"/>
            </svg>
            間取り図
          </button>
          <button className="btn-summary" onClick={() => setShowSummary(true)}>プラン確認</button>
          {/* #6: 確認ダイアログ経由にする */}
          <button className="btn-restart" onClick={() => setShowResetConfirm(true)}>最初から</button>
        </div>
      </header>

      {/* Room tabs — only show rooms for this plan type */}
      <nav className="room-tabs">
        {Object.entries(rooms).map(([id, room]) => (
          <button
            key={id}
            className={`room-tab ${activeRoom === id ? 'active' : ''}`}
            onClick={() => setSelectedRoom(id)}
          >
            <span className="tab-icon">{room.icon}</span>
            <span className="tab-label">{room.label}</span>
            <span className="tab-size">{room.size}</span>
          </button>
        ))}
      </nav>

      {/* Main layout */}
      <main className="main-layout">
        <aside className={`sidebar-plan ${showPlan ? 'open' : 'closed'}`}>
          <FloorPlan />
        </aside>

        <section className="viewer-section">
          <div className="viewer-hint-bar">
            <span className="room-viewing-group">
              <span className="room-viewing">
                {rooms[activeRoom]?.icon} {rooms[activeRoom]?.label}
                <span className="room-area-hint"> — {rooms[activeRoom]?.area}</span>
              </span>
            </span>
            <span className="view-tip">ドラッグ: 視点変更 ／ スクロール: ズーム</span>
          </div>
          <div className="viewer-canvas">
            <ViewerBoundary>
              <Suspense fallback={<LoadingRoom />}>
                <ApartmentViewerLazy
                  planType={planType}
                  furnitureTemplate={furnitureTemplate}
                />
              </Suspense>
            </ViewerBoundary>
          </div>

          {/* 部屋タブ連動の実物設備写真ストリップ */}
          {ROOM_PHOTOS[activeRoom] && (
            <div className="photo-ref-strip">
              <div className="photo-ref-header">
                <span className="photo-ref-title">📷 実物設備写真</span>
                <span className="photo-ref-caption">{ROOM_PHOTOS[activeRoom].caption}</span>
              </div>
              <div className="photo-ref-scroll">
                <div className="photo-ref-item photo-ref-main-item">
                  <img
                    src={ROOM_PHOTOS[activeRoom].main}
                    alt={ROOM_PHOTOS[activeRoom].caption}
                    className="photo-ref-img"
                    loading="lazy"
                  />
                  <span className="photo-ref-label">全体</span>
                </div>
                {ROOM_PHOTOS[activeRoom].details.map((d, i) => (
                  <div key={i} className="photo-ref-item">
                    <img src={d.src} alt={d.label} className="photo-ref-img" loading="lazy" />
                    <span className="photo-ref-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="sidebar-custom">
          <CustomizationPanel planType={planType} />
        </aside>
      </main>

      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} planType={planType} furnitureTemplate={furnitureTemplate} />}

      {/* #6: 「最初から」確認ダイアログ */}
      {showResetConfirm && (
        <div className="confirm-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <p className="confirm-msg">最初からやり直しますか？<br />現在の設定はすべてリセットされます。</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowResetConfirm(false)}>キャンセル</button>
              <button className="confirm-ok" onClick={() => { resetToStart(); setShowResetConfirm(false) }}>やり直す</button>
            </div>
          </div>
        </div>
      )}

      {/* #5: 初回操作ガイド */}
      {showGuide && (
        <div className="guide-overlay" onClick={dismissGuide}>
          <div className="guide-box" onClick={e => e.stopPropagation()}>
            <div className="guide-title">操作ガイド</div>
            <div className="guide-steps">
              <div className="guide-step">
                <span className="guide-icon">🏠</span>
                <div>
                  <div className="guide-step-title">部屋を切り替える</div>
                  <div className="guide-step-desc">上のタブまたは左の間取り図をクリックして部屋を切り替えます</div>
                </div>
              </div>
              <div className="guide-step">
                <span className="guide-icon">🎨</span>
                <div>
                  <div className="guide-step-title">インテリアをカスタマイズ</div>
                  <div className="guide-step-desc">右パネルで壁の色・床材・スタイル・照明を変更できます</div>
                </div>
              </div>
              <div className="guide-step">
                <span className="guide-icon">🖱️</span>
                <div>
                  <div className="guide-step-title">3Dビューの操作</div>
                  <div className="guide-step-desc">ドラッグで視点回転・スクロールでズームイン／アウト</div>
                </div>
              </div>
            </div>
            <button className="guide-start-btn" onClick={dismissGuide}>
              シミュレーションを始める →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const appStep = useStore(s => s.appStep)

  if (appStep === 'welcome')          return <WelcomeScreen />
  if (appStep === 'plan-select')      return <PlanSelector />
  if (appStep === 'furniture-select') return <FurnitureSelector />
  return <Simulation />
}

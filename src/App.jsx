import { useState, Suspense, lazy, Component } from 'react'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import PlanSelector from './components/PlanSelector'
import FurnitureSelector from './components/FurnitureSelector'
import CustomizationPanel from './components/CustomizationPanel'
import FlowCheck from './components/FlowCheck'
import SummaryScreen from './components/SummaryScreen'
import { PLAN_ROOMS, PLAN_INFO, FURNITURE_TEMPLATES } from './data/roomData'
import interiorTheme from './assets/interior-theme.png'

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
  const goBack             = useStore(s => s.goBack)
  const openFlowCheck      = useStore(s => s.openFlowCheck)
  const openSummary        = useStore(s => s.openSummary)

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
    <div className="sim-stage">
      {/* 背景（本番では Three.js キャンバスがここに入るため、画像は光の参考として敷く） */}
      <div className="sim-stage-bg">
        <img src={interiorTheme} alt="" />
      </div>

      <div className="sim-canvas-layer">
        <ViewerBoundary>
          <Suspense fallback={<LoadingRoom />}>
            <ApartmentViewerLazy
              planType={planType}
              furnitureTemplate={furnitureTemplate}
            />
          </Suspense>
        </ViewerBoundary>
      </div>

      {/* 上部フローティングバー */}
      <div className="sim-topbar">
        <div className="sim-panel sim-topbar-left">
          <div className="brand-logo"><span className="logo-kanji">和</span></div>
          <span className="sim-topbar-chip">{planInfo?.name} {planInfo?.type}</span>
          <span className="sim-topbar-vrule" />
          <span className="sim-topbar-chip">{tmplLabel}</span>
        </div>

        <nav className="sim-panel sim-roomtabs">
          {Object.entries(rooms).map(([id, room]) => (
            <button
              key={id}
              className={`sim-roomtab ${activeRoom === id ? 'active' : ''}`}
              onClick={() => setSelectedRoom(id)}
            >
              <span className="tab-label">{room.label}</span>
            </button>
          ))}
        </nav>

        <div className="sim-topbar-right">
          <button className="sim-topbar-btn plain" onClick={openFlowCheck}>
            <i className="ph ph-path" />
            動線
          </button>
          <button className="sim-topbar-btn plain accent" onClick={openSummary}>
            <i className="ph ph-file-text" />
            プラン確認
          </button>
          <button className="sim-topbar-exit" onClick={goBack}>
            <i className="ph ph-arrow-left" />
            変更
          </button>
          <button className="sim-topbar-exit" onClick={() => setShowResetConfirm(true)}>
            最初から
          </button>
        </div>
      </div>

      {/* 部屋キャプション */}
      <div className="sim-caption">
        <div className="sim-caption-name">{rooms[activeRoom]?.label}</div>
        <div className="sim-caption-meta">
          {rooms[activeRoom]?.size}・{rooms[activeRoom]?.area}
        </div>
      </div>

      {/* 右のドック */}
      <CustomizationPanel planType={planType} furnitureTemplate={furnitureTemplate} />

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
                <i className="ph ph-armchair guide-icon" />
                <div>
                  <div className="guide-step-title">部屋を切り替える</div>
                  <div className="guide-step-desc">上部の部屋タブをクリックして部屋を切り替えます</div>
                </div>
              </div>
              <div className="guide-step">
                <i className="ph ph-swatches guide-icon" />
                <div>
                  <div className="guide-step-title">インテリアをカスタマイズ</div>
                  <div className="guide-step-desc">右のパネルで壁の色・床材・スタイル・照明を変更できます</div>
                </div>
              </div>
              <div className="guide-step">
                <i className="ph ph-mouse-left-click guide-icon" />
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
  if (appStep === 'flow-check')       return <FlowCheck />
  if (appStep === 'summary')          return <SummaryScreen />
  return <Simulation />
}

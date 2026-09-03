import { useState, Suspense, lazy, Component } from 'react'
import { useStore } from './store/useStore'
import WelcomeScreen from './components/WelcomeScreen'
import PlanSelector from './components/PlanSelector'
import FurnitureSelector from './components/FurnitureSelector'
import CustomizationPanel from './components/CustomizationPanel'
import Minimap from './components/Minimap'
import ClearanceReadout from './components/ClearanceReadout'
import FlowCheck from './components/FlowCheck'
import SummaryScreen from './components/SummaryScreen'
import { PLAN_ROOMS, PLAN_INFO, FURNITURE_TEMPLATES, ROOM_ICON } from './data/roomData'
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
  // #5: 初回操作ガイド（localStorage で一度だけ表示。何か1つでも操作したら即座に消える）
  const [showGuide, setShowGuide] = useState(() => !localStorage.getItem('sim-guide-seen'))
  const dismissGuide = () => { if (!localStorage.getItem('sim-guide-seen')) { localStorage.setItem('sim-guide-seen', '1'); setShowGuide(false) } }
  // 右パネルの開閉（3Dを圧迫しないための折りたたみ）
  const [panelOpen, setPanelOpen] = useState(true)

  const planInfo  = PLAN_INFO[planType]
  const rooms     = PLAN_ROOMS[planType]
  const tmplLabel = FURNITURE_TEMPLATES.find(t => t.id === furnitureTemplate)?.label || ''

  // Ensure selectedRoom is valid for this plan
  const roomIds = Object.keys(rooms)
  const activeRoom = roomIds.includes(selectedRoom) ? selectedRoom : roomIds[0]
  if (activeRoom !== selectedRoom) setSelectedRoom(activeRoom)

  return (
    <div className="sim-stage" onPointerDown={dismissGuide} onWheel={dismissGuide}>
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
              <i className={`ph ${ROOM_ICON[id] || 'ph-square'}`} />
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

      {/* 右のドック（開閉可能） */}
      <CustomizationPanel
        planType={planType}
        furnitureTemplate={furnitureTemplate}
        open={panelOpen}
        onToggle={() => setPanelOpen(o => !o)}
      />

      {/* 左下: 間取りミニマップ＋通路幅の常時表示 */}
      <div className="sim-bottomleft">
        <Minimap planType={planType} />
        <ClearanceReadout planType={planType} furnitureTemplate={furnitureTemplate} />
      </div>

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

      {/* #5: 初回操作ガイド — 3D中央に控えめな一列で表示し、何か操作したら即座に消える */}
      {showGuide && (
        <div className="sim-panel guide-hint">
          <i className="ph-light ph-mouse-left-click" />
          <span>ドラッグで見回す</span>
          <span className="guide-hint-sep" />
          <i className="ph-light ph-magnifying-glass-plus" />
          <span>スクロールで近づく</span>
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

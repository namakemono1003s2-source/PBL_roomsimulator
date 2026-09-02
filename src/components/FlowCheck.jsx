import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PLAN_ROOMS, PLAN_INFO, LIGHTING_OPTIONS } from '../data/roomData'
import { getRoomSize } from '../data/roomSizes'
import { getInteriorPlan } from '../data/interiorPlans'
import { computeClearanceReport, getFurnitureAABB } from '../utils/designRules'

const MAX_SHOWN = 4

// 選択中の部屋を実寸スケールで描画し、上位の間隔にだけ寸法線を重ねる
function RoomDiagram({ planType, roomId, furniture, highlights }) {
  const [rw, , rd] = getRoomSize(roomId, planType)
  const vbW = 400
  const scale = vbW / rw
  const vbH = rd * scale

  const boxes = furniture.map(getFurnitureAABB).filter(Boolean)
  const toSvgX = (x) => (x + rw / 2) * scale
  const toSvgY = (z) => (z + rd / 2) * scale

  const highlightIds = new Set(highlights.map(h => `${h.aId}|${h.bId}`))
  const boxById = Object.fromEntries(boxes.map(b => [b.id, b]))

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} role="img" aria-label={`${roomId} 動線チェック`}>
      <rect x="0" y="0" width={vbW} height={vbH} fill="none" style={{ stroke: 'var(--border)' }} strokeWidth="1.5" />

      {boxes.map(b => (
        <rect
          key={b.id}
          x={toSvgX(b.minX)} y={toSvgY(b.minZ)}
          width={(b.maxX - b.minX) * scale} height={(b.maxZ - b.minZ) * scale}
          rx="3"
          style={{ fill: 'rgba(233,233,237,.13)', stroke: 'rgba(233,233,237,.3)' }}
          strokeWidth="0.8"
        />
      ))}

      {highlights.map((h, i) => {
        const a = boxById[h.aId], b = boxById[h.bId]
        if (!a || !b) return null
        const ax = toSvgX((a.minX + a.maxX) / 2), ay = toSvgY((a.minZ + a.maxZ) / 2)
        const bx = toSvgX((b.minX + b.maxX) / 2), by = toSvgY((b.minZ + b.maxZ) / 2)
        const mx = (ax + bx) / 2, my = (ay + by) / 2
        const ok = h.level !== 'tight'
        return (
          <g key={i}>
            <line x1={ax} y1={ay} x2={bx} y2={by}
              style={{ stroke: 'var(--accent)' }} strokeWidth="2.2" strokeDasharray="7 6" strokeLinecap="round" />
            <circle cx={ax} cy={ay} r="3.5" style={{ fill: 'var(--accent-400)' }} />
            <circle cx={bx} cy={by} r="3.5" style={{ fill: 'var(--accent-400)' }} />
            <rect x={mx - 24} y={my - 9} width="48" height="18" rx="8"
              style={{
                fill: ok ? 'var(--ok-bg)' : 'var(--warn-bg)',
                stroke: ok ? 'var(--ok-border)' : 'var(--warn-border)',
              }} strokeWidth="1" />
            <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="9"
              style={{ fill: ok ? 'var(--accent-300)' : 'var(--accent-200)' }}>
              {h.mm}mm
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function FlowCheck() {
  const [tab, setTab] = useState('flow') // 'flow' | 'sun' | 'compare'
  const planType          = useStore(s => s.planType)
  const furnitureTemplate = useStore(s => s.furnitureTemplate)
  const rooms              = useStore(s => s.rooms)
  const selectedRoom       = useStore(s => s.selectedRoom)
  const setSelectedRoom    = useStore(s => s.setSelectedRoom)
  const goBack              = useStore(s => s.goBack)

  const planRooms = PLAN_ROOMS[planType] || {}
  const planInfo  = PLAN_INFO[planType]
  const roomStyle = rooms[selectedRoom]?.style

  const furniture = useMemo(
    () => getInteriorPlan(planType, furnitureTemplate, selectedRoom, roomStyle),
    [planType, furnitureTemplate, selectedRoom, roomStyle]
  )
  const report = useMemo(() => computeClearanceReport(furniture), [furniture])
  const shown = report.slice(0, MAX_SHOWN)
  const okCount = shown.filter(r => r.level !== 'tight').length

  return (
    <div className="fc-screen">
      <div className="fc-header">
        <div className="sel-header-left">
          <button className="sel-back-link" onClick={goBack}>
            <i className="ph ph-arrow-left" />
            3Dに戻る
          </button>
          <span className="sel-vrule" />
          <span className="fc-header-title">暮らしのチェック</span>
        </div>
        <div className="fc-tabs">
          <button className={`fc-tab ${tab === 'flow' ? 'active' : ''}`} onClick={() => setTab('flow')}>動線</button>
          <button className={`fc-tab ${tab === 'sun' ? 'active' : ''}`} onClick={() => setTab('sun')}>日当たり</button>
          <button className={`fc-tab ${tab === 'compare' ? 'active' : ''}`} onClick={() => setTab('compare')}>実物と比べる</button>
        </div>
      </div>

      {tab === 'flow' && (
        <div className="fc-body">
          <div className="fc-left">
            <h2>この配置で、生活は詰まりませんか</h2>
            <p className="fc-left-desc">
              {planInfo?.name}実図面の上に、家具どうしの間隔を実寸でなぞりました。すれ違いに必要な幅は1,100mm、一人が通れる幅は600mmが目安です。
            </p>

            <div className="fc-room-select">
              {Object.entries(planRooms).map(([id, r]) => (
                <button
                  key={id}
                  className={`fc-room-chip ${selectedRoom === id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(id)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="fc-diagram">
              {report.length > 0 ? (
                <RoomDiagram planType={planType} roomId={selectedRoom} furniture={furniture} highlights={shown} />
              ) : (
                <p className="fc-left-desc">この部屋は家具が少なく、間隔の算出対象がありません。</p>
              )}
              <div className="fc-legend">
                <div className="fc-legend-row"><span className="fc-legend-line" />生活動線</div>
                <div className="fc-legend-row"><span className="fc-legend-box" />家具の実寸</div>
              </div>
            </div>
          </div>

          <div className="fc-right">
            <div>
              <div className="fc-right-eyebrow">診断結果</div>
              <div className="fc-right-headline">
                {shown.length > 0 ? `${shown.length}件のうち${okCount}件は余裕あり` : '算出できる間隔がありません'}
              </div>
            </div>

            <div className="fc-list">
              {shown.map((r, i) => (
                <div key={i} className="fc-list-row">
                  <i className={`ph ${r.level === 'tight' ? 'ph-warning-circle' : 'ph-check-circle'} fc-list-icon ${r.level === 'tight' ? 'tight' : 'ok'}`} />
                  <div>
                    <div className="fc-list-title">{r.aName} と {r.bName}　{r.mm}mm</div>
                    <div className="fc-list-desc">
                      {r.level === 'ok2' && '二人がすれ違えます。ベビーカーの通行も可。'}
                      {r.level === 'ok1' && '一人が通れる幅です。'}
                      {r.level === 'tight' && '通りにくくなっています。家具の配置替えをおすすめします。'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="rule" />

            <div>
              <div className="fc-right-eyebrow">実物と並べて確認</div>
              <p className="fc-compare-note" style={{ marginTop: 8 }}>
                3Dは実物の色・質感を完全に再現するものではありません。仕上げの最終確認はモデルルーム写真と実物サンプルで。
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'sun' && (
        <div className="fc-body" style={{ gridTemplateColumns: '1fr' }}>
          <div className="fc-left" style={{ borderRight: 'none' }}>
            <h2>時間帯で光の入り方を見る</h2>
            <p className="fc-left-desc">
              3Dビューの右パネル「光」タブから、朝・昼・夕・夜の光の入り方をそのまま切り替えて確認できます。バルコニー側の窓からの採光を基準にしています。
            </p>
            <div className="fc-timeblock">
              {LIGHTING_OPTIONS.map(l => (
                <div key={l.id} className="fc-time-row">
                  <span className="fc-time-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'compare' && (
        <div className="fc-body" style={{ gridTemplateColumns: '1fr' }}>
          <div className="fc-left" style={{ borderRight: 'none' }}>
            <h2>実物と並べて確認</h2>
            <p className="fc-left-desc">
              3Dは実物の色・質感を完全に再現するものではありません。仕上げの最終確認はモデルルーム写真と実物サンプルでお願いいたします。参考写真は準備中です。
            </p>
            <div className="fc-compare-grid" style={{ maxWidth: 480 }}>
              <div className="fc-compare-box">シミュレーション</div>
              <div className="fc-compare-box">モデルルーム実物</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

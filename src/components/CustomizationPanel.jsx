import { useState } from 'react'
import { useStore } from '../store/useStore'
import { PLAN_ROOMS, WALL_COLORS, FLOOR_OPTIONS, STYLE_OPTIONS, MOOD_PALETTES, LIGHTING_OPTIONS } from '../data/roomData'

// 明るい色の上には濃いチェック、暗い色の上には明るいチェックを置く（色だけで選択状態を表さないためのルール）
function checkColorFor(hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return '#2b2741'
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#2b2741' : '#f0eefe'
}

const PRIMARY_LIGHTING_IDS = ['morning', 'bright', 'evening', 'night']
const LIGHTING_HINT = {
  bright: '5000K 昼白色', morning: '4200K 朝の光', warm: '2700K 電球色',
  soft: '3000K 温白色', evening: '2200K 夕暮れ色', night: '2000K 常夜灯',
}

function Swatch({ color, name, selected, size = 44, onClick }) {
  return (
    <button
      className={`dock-swatch ${selected ? 'selected' : ''}`}
      style={{ background: color, width: size, height: size }}
      title={name}
      aria-label={name}
      onClick={onClick}
    >
      {selected && <i className="ph ph-check" style={{ color: checkColorFor(color) }} />}
    </button>
  )
}

export default function CustomizationPanel({ planType, furnitureTemplate, open, onToggle }) {
  const selectedRoom = useStore(s => s.selectedRoom)
  const config       = useStore(s => s.rooms[selectedRoom])
  const updateRoom   = useStore(s => s.updateRoom)
  const rooms        = PLAN_ROOMS[planType] || {}
  const room         = rooms[selectedRoom]

  const [wallExpanded, setWallExpanded] = useState(false)
  const [floorExpanded, setFloorExpanded] = useState(false)

  const update = (key, value) => updateRoom(selectedRoom, key, value)

  const applyMood = (moodId) => {
    const palette = MOOD_PALETTES[moodId]
    update('style', moodId)
    if (palette) {
      update('wallColor', palette.walls[0])
      const floorName = FLOOR_OPTIONS.find(f => f.color === palette.floors[0])
      update('floorColor', palette.floors[0])
      if (floorName) update('floorType', floorName.type)
    }
    setWallExpanded(false)
    setFloorExpanded(false)
  }

  const moodPalette = MOOD_PALETTES[config.style] || MOOD_PALETTES.modern
  const wallOptions  = wallExpanded  ? WALL_COLORS.map(c => c.value)               : moodPalette.walls
  const floorOptions = floorExpanded ? FLOOR_OPTIONS.map(f => f.color)             : moodPalette.floors

  const selectedWallName  = WALL_COLORS.find(c => c.value === config.wallColor)?.name || ''
  const selectedFloorName = FLOOR_OPTIONS.find(f => f.color === config.floorColor)?.name || ''
  const primaryLighting   = LIGHTING_OPTIONS.filter(l => PRIMARY_LIGHTING_IDS.includes(l.id))

  if (!open) {
    return (
      <button className="sim-panel dock-collapsed-tab" onClick={onToggle} aria-label="パネルを開く">
        <i className="ph ph-sidebar-simple" />
        <span className="dock-collapsed-label">部屋をつくる</span>
      </button>
    )
  }

  return (
    <div className="sim-panel sim-dock">
      <div className="dock-head">
        <h3 className="dock-title">{room?.label}をつくる</h3>
        <button className="dock-collapse-btn" onClick={onToggle} aria-label="パネルを閉じる">
          <i className="ph ph-sidebar-simple" />
        </button>
      </div>

      <div className="dock-scroll">
        {/* 雰囲気 — 最上位の意思決定 */}
        <div className="dock-section">
          <div className="dock-section-head">
            <span className="dock-section-label">この部屋の雰囲気</span>
            <span className="dock-section-value">{STYLE_OPTIONS.find(s => s.id === config.style)?.label}</span>
          </div>
          <div className="mood-grid">
            {STYLE_OPTIONS.map(s => {
              const selected = config.style === s.id
              return (
                <button key={s.id} className={`mood-card ${selected ? 'selected' : ''}`} onClick={() => applyMood(s.id)}>
                  {selected && <i className="ph ph-check-circle mood-check" />}
                  <div className="mood-name">{s.label}</div>
                  <div className="mood-desc">{s.desc}</div>
                </button>
              )
            })}
          </div>
          <p className="dock-hint">選ぶと壁・床がまとまって変わります。下は、その雰囲気で成立する色だけを出しています。</p>
        </div>

        <hr className="rule-tight" />

        {/* 壁 */}
        <div className="dock-section">
          <div className="dock-section-head">
            <span className="dock-section-label">壁の色</span>
            <span className="dock-section-value">{selectedWallName}</span>
          </div>
          <div className="dock-swatches">
            {wallOptions.map(hex => {
              const meta = WALL_COLORS.find(c => c.value === hex)
              return (
                <Swatch key={hex} color={hex} name={meta?.name || hex}
                  selected={config.wallColor === hex} onClick={() => update('wallColor', hex)} />
              )
            })}
            {!wallExpanded && (
              <button className="dock-swatch-add" onClick={() => setWallExpanded(true)} aria-label="すべての壁色を見る">
                <i className="ph ph-dots-three" />
              </button>
            )}
          </div>
        </div>

        {/* 床 */}
        <div className="dock-section">
          <div className="dock-section-head">
            <span className="dock-section-label">床材</span>
            <span className="dock-section-value">{selectedFloorName}</span>
          </div>
          <div className="dock-floor-grid">
            {floorOptions.map(hex => {
              const meta = FLOOR_OPTIONS.find(f => f.color === hex)
              const selected = config.floorColor === hex
              return (
                <button
                  key={hex}
                  className={`dock-floor-btn ${selected ? 'selected' : ''}`}
                  style={{ background: hex }}
                  title={meta?.name}
                  aria-label={meta?.name}
                  onClick={() => { update('floorColor', hex); if (meta) update('floorType', meta.type) }}
                >
                  {selected && <i className="ph ph-check" style={{ color: checkColorFor(hex) }} />}
                </button>
              )
            })}
            {!floorExpanded && (
              <button className="dock-floor-btn dock-swatch-add" onClick={() => setFloorExpanded(true)} aria-label="すべての床材を見る">
                <i className="ph ph-dots-three" />
              </button>
            )}
          </div>
        </div>

        {/* 光の入り方 */}
        <div className="dock-section">
          <div className="dock-section-head">
            <span className="dock-section-label">光の入り方</span>
            <span className="dock-section-value">{LIGHTING_HINT[config.lighting]}</span>
          </div>
          <div className="dock-timechips">
            {primaryLighting.map(l => (
              <button
                key={l.id}
                className={`dock-timechip ${config.lighting === l.id ? 'selected' : ''}`}
                onClick={() => update('lighting', l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button className="dock-reset-btn" onClick={() => {
          update('wallColor', '#F5F2EC'); update('floorColor', '#D4A574'); update('floorType', 'wood')
          update('style', 'modern'); update('lighting', 'warm'); update('ceilingColor', '#FFFFFF')
          setWallExpanded(false); setFloorExpanded(false)
        }}>
          この部屋をリセット
        </button>
      </div>
    </div>
  )
}

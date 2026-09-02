import { useStore } from '../store/useStore'
import { PLAN_ROOMS, WALL_COLORS, FLOOR_OPTIONS, STYLE_OPTIONS, LIGHTING_OPTIONS } from '../data/roomData'

// スタイルごとのカラーパレットヒント
const STYLE_PALETTES = {
  modern:       ['#E8E8E8', '#4A4A4A', '#FFFFFF'],
  scandinavian: ['#F0E8D8', '#C8A878', '#7AB840'],
  natural:      ['#D8C8A8', '#A08058', '#6A9838'],
  classic:      ['#2A1A0A', '#C8A050', '#8A6840'],
}

// 照明ごとの色温度テキスト
const LIGHTING_HINT = {
  bright:  '5000K 昼白色',
  warm:    '2700K 電球色',
  soft:    '3000K 温白色',
  evening: '2200K 夕暮れ色',
}

function SectionTitle({ children }) {
  return <h3 className="section-title">{children}</h3>
}

export default function CustomizationPanel({ planType }) {
  const selectedRoom = useStore(s => s.selectedRoom)
  const config       = useStore(s => s.rooms[selectedRoom])
  const updateRoom   = useStore(s => s.updateRoom)
  const rooms        = PLAN_ROOMS[planType] || {}
  const room         = rooms[selectedRoom]

  const update = (key, value) => updateRoom(selectedRoom, key, value)

  // #9: 選択中の壁色名
  const selectedWallName = WALL_COLORS.find(c => c.value === config.wallColor)?.name || ''

  return (
    <div className="custom-panel">
      <div className="custom-header">
        <span className="room-icon">{room?.icon}</span>
        <div>
          <div className="room-name">{room?.label}</div>
          <div className="room-size">{room?.size}（{room?.area}）</div>
        </div>
      </div>

      <SectionTitle>壁の色</SectionTitle>
      <div className="color-grid">
        {WALL_COLORS.map(c => (
          <button
            key={c.value}
            className={`color-swatch ${config.wallColor === c.value ? 'selected' : ''}`}
            style={{ background: c.value }}
            title={c.name}
            aria-label={c.name}
            onClick={() => update('wallColor', c.value)}
          />
        ))}
      </div>
      {/* #9: 常時ラベル表示 */}
      <div className="color-selected-name">{selectedWallName}</div>

      <SectionTitle>床材</SectionTitle>
      <div className="floor-grid">
        {FLOOR_OPTIONS.map((f, i) => (
          <button
            key={i}
            className={`floor-btn ${config.floorColor === f.color ? 'selected' : ''}`}
            onClick={() => { update('floorColor', f.color); update('floorType', f.type) }}
          >
            <span className="floor-swatch" style={{ background: f.color }} />
            <span className="floor-label">{f.name}</span>
          </button>
        ))}
      </div>

      <SectionTitle>インテリアスタイル</SectionTitle>
      <div className="style-grid">
        {STYLE_OPTIONS.map(s => (
          <button
            key={s.id}
            className={`style-btn ${config.style === s.id ? 'selected' : ''}`}
            onClick={() => update('style', s.id)}
          >
            {/* #10: スタイルのカラーパレットプレビュー */}
            <div className="style-palette">
              {STYLE_PALETTES[s.id].map((col, i) => (
                <span key={i} className="style-palette-dot" style={{ background: col }} />
              ))}
            </div>
            <div className="style-label">{s.label}</div>
            <div className="style-desc">{s.desc}</div>
          </button>
        ))}
      </div>

      <SectionTitle>照明</SectionTitle>
      <div className="lighting-grid">
        {LIGHTING_OPTIONS.map(l => (
          <button
            key={l.id}
            className={`lighting-btn ${config.lighting === l.id ? 'selected' : ''}`}
            onClick={() => update('lighting', l.id)}
          >
            <span className="light-dot" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            <div className="lighting-info">
              <div className="lighting-name">{l.label}</div>
              {/* #10: 色温度テキスト */}
              <div className="lighting-hint">{LIGHTING_HINT[l.id]}</div>
            </div>
          </button>
        ))}
      </div>

      <button className="reset-btn" onClick={() => {
        update('wallColor', '#F5F2EC'); update('floorColor', '#C8956C'); update('floorType', 'wood')
        update('style', 'modern'); update('lighting', 'warm'); update('ceilingColor', '#FFFFFF')
      }}>この部屋をリセット</button>
    </div>
  )
}

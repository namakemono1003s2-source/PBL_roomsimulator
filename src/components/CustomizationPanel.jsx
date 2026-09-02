import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { PLAN_ROOMS, WALL_COLORS, FLOOR_OPTIONS, STYLE_OPTIONS, LIGHTING_OPTIONS } from '../data/roomData'
import { getInteriorPlan } from '../data/interiorPlans'
import { computeClearanceReport } from '../utils/designRules'

// 照明ごとの色温度テキスト
const LIGHTING_HINT = {
  bright:  '5000K 昼白色',
  morning: '4200K 朝の光',
  warm:    '2700K 電球色',
  soft:    '3000K 温白色',
  evening: '2200K 夕暮れ色',
  night:   '2000K 常夜灯',
}

// 主要4つ（朝・昼・夕・夜）を優先表示し、電球色・やわらかは補助チップへ
const PRIMARY_LIGHTING_IDS = ['morning', 'bright', 'evening', 'night']

export default function CustomizationPanel({ planType, furnitureTemplate }) {
  const [tab, setTab] = useState('interior') // 'interior' | 'light'
  const selectedRoom = useStore(s => s.selectedRoom)
  const config       = useStore(s => s.rooms[selectedRoom])
  const updateRoom   = useStore(s => s.updateRoom)
  const rooms        = PLAN_ROOMS[planType] || {}
  const room         = rooms[selectedRoom]

  const update = (key, value) => updateRoom(selectedRoom, key, value)

  const selectedWallName = WALL_COLORS.find(c => c.value === config.wallColor)?.name || ''
  const primaryLighting   = LIGHTING_OPTIONS.filter(l => PRIMARY_LIGHTING_IDS.includes(l.id))
  const secondaryLighting = LIGHTING_OPTIONS.filter(l => !PRIMARY_LIGHTING_IDS.includes(l.id))

  // この部屋の最狭通路幅（実際の家具配置データから算出）
  const narrowest = useMemo(() => {
    const furniture = getInteriorPlan(planType, furnitureTemplate, selectedRoom, config.style)
    const report = computeClearanceReport(furniture)
    return report[0] || null
  }, [planType, furnitureTemplate, selectedRoom, config.style])

  return (
    <div className="sim-dock">
      <div className="dock-tabs">
        <button className={`dock-tab ${tab === 'interior' ? 'active' : ''}`} onClick={() => setTab('interior')}>内装</button>
        <button className={`dock-tab ${tab === 'light' ? 'active' : ''}`} onClick={() => setTab('light')}>光</button>
      </div>

      {tab === 'interior' && (
        <>
          <div className="dock-section">
            <div className="dock-section-head">
              <span className="dock-section-label">壁</span>
              <span className="dock-section-value">{selectedWallName}</span>
            </div>
            <div className="dock-swatches">
              {WALL_COLORS.map(c => (
                <button
                  key={c.value}
                  className={`dock-swatch ${config.wallColor === c.value ? 'selected' : ''}`}
                  style={{ background: c.value }}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => update('wallColor', c.value)}
                />
              ))}
            </div>
          </div>

          <div className="dock-section">
            <div className="dock-section-head">
              <span className="dock-section-label">床</span>
              <span className="dock-section-value">
                {FLOOR_OPTIONS.find(f => f.color === config.floorColor)?.name || ''}
              </span>
            </div>
            <div className="dock-floor-grid">
              {FLOOR_OPTIONS.map((f, i) => (
                <button
                  key={i}
                  className={`dock-floor-btn ${config.floorColor === f.color ? 'selected' : ''}`}
                  style={{ background: f.color }}
                  title={f.name}
                  aria-label={f.name}
                  onClick={() => { update('floorColor', f.color); update('floorType', f.type) }}
                />
              ))}
            </div>
          </div>

          <div className="dock-section">
            <div className="dock-section-head">
              <span className="dock-section-label">インテリアスタイル</span>
              <span className="dock-section-value">
                {STYLE_OPTIONS.find(s => s.id === config.style)?.label || ''}
              </span>
            </div>
            <div className="dock-timechips">
              {STYLE_OPTIONS.map(s => (
                <button
                  key={s.id}
                  className={`dock-timechip ${config.style === s.id ? 'selected' : ''}`}
                  onClick={() => update('style', s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button className="dock-reset-btn" onClick={() => {
            update('wallColor', '#F5F2EC'); update('floorColor', '#C8956C'); update('floorType', 'wood')
            update('style', 'modern'); update('lighting', 'warm'); update('ceilingColor', '#FFFFFF')
          }}>
            この部屋をリセット
          </button>
        </>
      )}

      {tab === 'light' && (
        <>
          <div className="dock-section">
            <div className="dock-section-head">
              <span className="dock-section-label">時間帯</span>
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

          <div className="dock-section">
            <div className="dock-section-head">
              <span className="dock-section-label">その他の光</span>
            </div>
            <div className="dock-timechips">
              {secondaryLighting.map(l => (
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
        </>
      )}

      {narrowest && (
        <div className="dock-footer">
          <div className="dock-footer-row">
            <span className="dock-footer-label">{narrowest.aName}〜{narrowest.bName}</span>
            <span className="dock-footer-value">{narrowest.mm}mm</span>
          </div>
          <p className="dock-footer-note">
            {narrowest.level === 'ok2'
              ? '二人がすれ違える幅です。'
              : narrowest.level === 'ok1'
              ? '一人が通れる幅です。すれ違うには1,100mm必要。'
              : 'やや狭くなっています。「動線」で詳しく確認できます。'}
          </p>
        </div>
      )}
    </div>
  )
}

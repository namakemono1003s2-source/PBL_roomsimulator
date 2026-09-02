import { useStore } from '../store/useStore'
import { PLAN_ROOMS, PLAN_INFO, FURNITURE_TEMPLATES, WALL_COLORS, FLOOR_OPTIONS, STYLE_OPTIONS, LIGHTING_OPTIONS } from '../data/roomData'

const find = (arr, key, val) => arr.find(x => x[key] === val)

export default function SummaryModal({ onClose, planType, furnitureTemplate }) {
  const rooms     = useStore(s => s.rooms)
  const planInfo  = PLAN_INFO[planType]
  const planRooms = PLAN_ROOMS[planType] || {}
  const tmpl      = FURNITURE_TEMPLATES.find(t => t.id === furnitureTemplate)
  const today     = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* #20: 右上 × ボタン */}
        <button className="modal-close-x" onClick={onClose} aria-label="閉じる">✕</button>

        {/* ヘッダー */}
        <div className="modal-header">
          <div>
            <div className="modal-title">インテリアプランサマリー</div>
            <div className="modal-subtitle">
              鷹匠マンション　{planInfo?.name}　{planInfo?.type} / {planInfo?.area}
              <br />{tmpl?.label}（{tmpl?.sub}）
            </div>
          </div>
          <div className="modal-stamp">
            <div style={{ color: 'var(--green-dark)', fontWeight: 700, letterSpacing: 1 }}>和建設株式会社</div>
            <div>{today}</div>
          </div>
        </div>

        {/* 部屋ごとのサマリーグリッド */}
        <div className="summary-grid">
          {Object.entries(planRooms).map(([id, roomDef]) => {
            const cfg = rooms[id]
            if (!cfg) return null
            const wallName  = find(WALL_COLORS,      'value', cfg.wallColor)?.name  || cfg.wallColor
            const floorName = find(FLOOR_OPTIONS,    'color', cfg.floorColor)?.name || cfg.floorColor
            const styleName = find(STYLE_OPTIONS,    'id',    cfg.style)?.label     || cfg.style
            const lightName = find(LIGHTING_OPTIONS, 'id',    cfg.lighting)?.label  || cfg.lighting
            return (
              <div key={id} className="summary-card">
                <div className="summary-room-name">{roomDef.icon} {roomDef.label}</div>
                <table className="summary-table">
                  <tbody>
                    <tr><td>壁</td><td>{wallName}</td></tr>
                    <tr><td>床材</td><td>{floorName}</td></tr>
                    <tr><td>スタイル</td><td>{styleName}</td></tr>
                    <tr><td>照明</td><td>{lightName}</td></tr>
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>

        {/* #2: 印刷ボタン */}
        <div className="summary-actions">
          <button className="summary-print-btn" onClick={() => window.print()}>
            🖨️ このプランを印刷する
          </button>
        </div>

        {/* #1: 問い合わせ・連絡CTA */}
        <div className="summary-contact">
          <div className="summary-contact-title">担当コーディネーターにご相談ください</div>
          <div className="summary-contact-row">
            <a href="tel:0120000000" className="summary-contact-btn summary-contact-tel">
              <span className="summary-contact-icon">📞</span>
              <span className="summary-contact-main">0120-000-000</span>
              <span className="summary-contact-sub">電話で相談する</span>
            </a>
            <a href="mailto:info@wa-kensetsu.example" className="summary-contact-btn summary-contact-mail">
              <span className="summary-contact-icon">✉️</span>
              <span className="summary-contact-main">メールで問い合わせ</span>
              <span className="summary-contact-sub">info@wa-kensetsu.example</span>
            </a>
          </div>
          <p className="summary-contact-note">
            受付時間：平日 9:00〜18:00 ／ 土日祝も対応可
          </p>
        </div>

        {/* #3: 次ステップ導線 */}
        <div className="summary-nextsteps">
          <div className="summary-nextstep-label">次のステップ</div>
          <div className="summary-nextstep-row">
            <div className="summary-nextstep-item">
              <span className="summary-nextstep-num">01</span>
              <span>このページを印刷・保存</span>
            </div>
            <div className="summary-nextstep-arrow">→</div>
            <div className="summary-nextstep-item">
              <span className="summary-nextstep-num">02</span>
              <span>担当者に連絡して打合せ日程を調整</span>
            </div>
            <div className="summary-nextstep-arrow">→</div>
            <div className="summary-nextstep-item">
              <span className="summary-nextstep-num">03</span>
              <span>打合せでプランを確定</span>
            </div>
          </div>
        </div>

        <button className="modal-close-btn" onClick={onClose}>シミュレーションに戻る</button>
      </div>
    </div>
  )
}

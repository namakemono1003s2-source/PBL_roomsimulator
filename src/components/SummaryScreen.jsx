import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { PLAN_ROOMS, PLAN_INFO, FURNITURE_TEMPLATES, WALL_COLORS, FLOOR_OPTIONS, STYLE_OPTIONS, LIGHTING_OPTIONS } from '../data/roomData'
import { getInteriorPlan } from '../data/interiorPlans'
import { computeClearanceReport } from '../utils/designRules'

const find = (arr, key, val) => arr.find(x => x[key] === val)

export default function SummaryScreen() {
  const planType          = useStore(s => s.planType)
  const furnitureTemplate = useStore(s => s.furnitureTemplate)
  const rooms              = useStore(s => s.rooms)
  const goBack              = useStore(s => s.goBack)

  const [copied, setCopied] = useState(false)

  const planInfo  = PLAN_INFO[planType]
  const planRooms = PLAN_ROOMS[planType] || {}
  const tmpl      = FURNITURE_TEMPLATES.find(t => t.id === furnitureTemplate)
  const today     = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

  // 全部屋の間隔レポートから、通路幅の集計（最狭・n/m件が余裕あり）を算出
  const clearanceSummary = useMemo(() => {
    let narrowest = null
    let ok = 0, total = 0
    Object.keys(planRooms).forEach(roomId => {
      const furniture = getInteriorPlan(planType, furnitureTemplate, roomId, rooms[roomId]?.style)
      const report = computeClearanceReport(furniture)
      if (report.length === 0) return
      const top = report[0]
      if (!narrowest || top.mm < narrowest.mm) narrowest = { ...top, roomId }
      total += 1
      if (top.level !== 'tight') ok += 1
    })
    return { narrowest, ok, total }
  }, [planType, furnitureTemplate, planRooms, rooms])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: '鷹匠マンション インテリアプラン', url: location.href })
        return
      }
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ユーザーがキャンセルした場合などは何もしない */
    }
  }

  return (
    <div className="summary-screen">
      <div className="summary-header">
        <div className="summary-header-left">
          <button className="sel-back-link" onClick={goBack}>
            <i className="ph ph-arrow-left" />
            編集に戻る
          </button>
          <span className="sel-vrule" />
          <span>お客様プラン — {today}</span>
        </div>
        <div className="summary-header-right">
          <button className="summary-header-btn" onClick={handleShare}>
            <i className="ph ph-share-network" />
            {copied ? 'リンクをコピーしました' : '家族に共有'}
          </button>
          <button className="summary-header-btn accent" onClick={() => window.print()}>
            <i className="ph ph-file-pdf" />
            PDFで保存
          </button>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-row-left">
          <div className="summary-eyebrow">Plan Sheet</div>
          <h1 className="summary-heading">鷹匠マンション　{planInfo?.name} {planInfo?.type}</h1>
          <div className="summary-meta">
            <span>{planInfo?.area}（約{(parseFloat(planInfo?.area) / 3.3058).toFixed(2)}坪）</span>
            <span>{planInfo?.floor}</span>
            <span>{tmpl?.label}</span>
            <span>{Object.keys(planRooms).length}部屋設定済み</span>
          </div>
        </div>

        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-label">最狭の通路</div>
            <div className="summary-stat-value">
              {clearanceSummary.narrowest ? `${clearanceSummary.narrowest.mm} mm` : '—'}
            </div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-label">動線チェック</div>
            <div className="summary-stat-value accent">
              {clearanceSummary.total > 0 ? `${clearanceSummary.ok}/${clearanceSummary.total} 良好` : '—'}
            </div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-label">追加費用の目安</div>
            <div className="summary-stat-value">要相談</div>
          </div>
        </div>
      </div>

      <div className="summary-table-wrap">
        <hr className="rule" style={{ margin: '32px 0' }} />
        <table className="summary-table">
          <thead>
            <tr>
              <th>部屋</th>
              <th>壁</th>
              <th>床</th>
              <th>スタイル</th>
              <th>照明</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(planRooms).map(([id, roomDef]) => {
              const cfg = rooms[id]
              if (!cfg) return null
              const wallName  = find(WALL_COLORS,      'value', cfg.wallColor)?.name  || cfg.wallColor
              const floorName = find(FLOOR_OPTIONS,    'color', cfg.floorColor)?.name || cfg.floorColor
              const styleName = find(STYLE_OPTIONS,    'id',    cfg.style)?.label     || cfg.style
              const lightName = find(LIGHTING_OPTIONS, 'id',    cfg.lighting)?.label  || cfg.lighting
              return (
                <tr key={id}>
                  <td>
                    <div className="summary-room-cell">
                      <span className="summary-room-cell-name">{roomDef.label}</span>
                      <span className="summary-room-cell-size">{roomDef.size} ／ {roomDef.area}</span>
                    </div>
                  </td>
                  <td>
                    <div className="summary-swatch-cell">
                      <span className="summary-swatch" style={{ background: cfg.wallColor }} />
                      {wallName}
                    </div>
                  </td>
                  <td>
                    <div className="summary-swatch-cell">
                      <span className="summary-swatch" style={{ background: cfg.floorColor }} />
                      {floorName}
                    </div>
                  </td>
                  <td>{styleName}</td>
                  <td>{lightName}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="summary-footer">
        <div className="summary-footer-left">
          <h3>このあとの流れ</h3>
          <div className="summary-nextstep-item">
            <span className="summary-nextstep-num">01</span>
            <div className="summary-nextstep-text">
              <span className="summary-nextstep-title">PDFを保存してご家族と確認</span>
              <span className="summary-nextstep-sub">共有リンクでもご覧いただけます</span>
            </div>
          </div>
          <div className="summary-nextstep-item">
            <span className="summary-nextstep-num">02</span>
            <div className="summary-nextstep-text">
              <span className="summary-nextstep-title">コーディネーターとの打合せを予約</span>
              <span className="summary-nextstep-sub">実物サンプルで仕上げを最終確認します</span>
            </div>
          </div>
          <div className="summary-nextstep-item">
            <span className="summary-nextstep-num">03</span>
            <div className="summary-nextstep-text">
              <span className="summary-nextstep-title">プランを確定</span>
              <span className="summary-nextstep-sub">オプション費用のお見積りをご提示します</span>
            </div>
          </div>
        </div>

        <div className="summary-footer-right">
          <div className="summary-contact-card">
            <h4>担当コーディネーターに相談</h4>
            <p>このシートの内容はそのまま担当者に共有されます。ご不明な点はお気軽に。</p>
            <div className="summary-contact-actions">
              <a href="tel:0120000000" className="accent">
                <i className="ph ph-calendar-check" />
                打合せを予約する
              </a>
              <a href="tel:0120000000" className="plain">
                <i className="ph ph-phone" />
                0120-000-000
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

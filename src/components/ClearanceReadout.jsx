import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { getInteriorPlan } from '../data/interiorPlans'
import { computeClearanceReport } from '../utils/designRules'

// 選択中の部屋の最狭通路幅を常時表示するパネル。
// 内装を操作している間も視界に残り続けることが要点（ミニマップの隣、常時表示）。
export default function ClearanceReadout({ planType, furnitureTemplate }) {
  const selectedRoom = useStore(s => s.selectedRoom)
  const config       = useStore(s => s.rooms[selectedRoom])

  const narrowest = useMemo(() => {
    const furniture = getInteriorPlan(planType, furnitureTemplate, selectedRoom, config?.style)
    return computeClearanceReport(furniture)[0] || null
  }, [planType, furnitureTemplate, selectedRoom, config?.style])

  if (!narrowest) return null

  const tight = narrowest.level === 'tight'

  return (
    <div className="sim-panel clearance-readout">
      <div className="clearance-readout-row">
        <span className={`clearance-readout-icon ${tight ? 'tight' : 'ok'}`}>
          <i className={`ph ${tight ? 'ph-warning-circle' : 'ph-check-circle'}`} />
        </span>
        <span className="clearance-readout-label">{narrowest.aName}〜{narrowest.bName}</span>
        <span className={`clearance-readout-value ${tight ? 'tight' : ''}`}>{narrowest.mm}mm</span>
      </div>
      <p className="clearance-readout-note">
        {narrowest.level === 'ok2' && '二人がすれ違える幅です。'}
        {narrowest.level === 'ok1' && '一人が通れる幅です。すれ違うには1,100mm必要。'}
        {tight && 'やや狭くなっています。「動線」で詳しく確認できます。'}
      </p>
    </div>
  )
}

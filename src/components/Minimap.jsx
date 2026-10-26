import { useStore } from '../store/useStore'
import { I_PLAN } from '../data/floorplans/iType'

// 平面図データ(単位m)から、ミニマップ用の部屋矩形(SVG座標)を作る。
// 部屋タブと対応する区画(roomIdあり)だけを描き、同じ roomId の矩形はまとめて選択される。
const MINIMAP_SCALE = 20
const MINIMAP_MARGIN = 8
function minimapFromPlan(plan) {
  const { w, d } = plan.footprint
  const toSvg = v => v * MINIMAP_SCALE + MINIMAP_MARGIN
  return {
    viewBox: `0 0 ${w * MINIMAP_SCALE + MINIMAP_MARGIN * 2} ${d * MINIMAP_SCALE + MINIMAP_MARGIN * 2}`,
    outer: { x: MINIMAP_MARGIN, y: MINIMAP_MARGIN, w: w * MINIMAP_SCALE, h: d * MINIMAP_SCALE },
    rooms: plan.spaces.filter(s => s.roomId).flatMap(s =>
      [...s.rects, ...(s.aux ?? [])].map(([x, y, rw, rd]) => ({
        id: s.roomId, label: s.label,
        x: toSvg(x), y: toSvg(y), w: rw * MINIMAP_SCALE, h: rd * MINIMAP_SCALE,
      }))
    ),
  }
}

// 間取り図ミニマップ用の部屋矩形。
// Simulation画面の3D操作を邪魔しない範囲で、「今どこを見ているか」を伝えるための地図。
const MINIMAP_ROOMS = {
  I: minimapFromPlan(I_PLAN),
  H: {
    viewBox: '0 0 200 240',
    outer: { x: 16, y: 16, w: 172, h: 208 },
    rooms: [
      { id: 'living',   label: 'LDK', x: 76, y: 16,  w: 112, h: 132 },
      { id: 'bedroom',  label: '洋室', x: 76, y: 148, w: 112, h: 76  },
      { id: 'bathroom', label: '浴',   x: 16, y: 155, w: 60,  h: 69  },
    ],
  },
}

export default function Minimap({ planType }) {
  const selectedRoom    = useStore(s => s.selectedRoom)
  const setSelectedRoom = useStore(s => s.setSelectedRoom)
  const map = MINIMAP_ROOMS[planType]
  if (!map) return null

  return (
    <div className="sim-panel minimap">
      <div className="minimap-head">
        <span className="minimap-head-label">間取り</span>
        <i className="ph ph-arrows-out" />
      </div>
      <svg viewBox={map.viewBox} role="img" aria-label="間取りミニマップ">
        <rect
          x={map.outer.x} y={map.outer.y} width={map.outer.w} height={map.outer.h}
          fill="rgba(233,233,237,.05)" style={{ stroke: 'var(--text-faint)' }} strokeWidth="2"
        />
        {map.rooms.map((r, i) => {
          const sel = r.id === selectedRoom
          return (
            <rect
              key={`${r.id}-${i}`}
              x={r.x} y={r.y} width={r.w} height={r.h}
              rx="1"
              className="minimap-room"
              style={{
                fill: sel ? 'rgba(145,132,217,.30)' : 'rgba(233,233,237,.03)',
                stroke: sel ? 'var(--accent)' : 'rgba(233,233,237,.18)',
                cursor: r.label ? 'pointer' : 'default',
              }}
              strokeWidth={sel ? 2 : 1}
              onClick={r.label ? () => setSelectedRoom(r.id) : undefined}
            />
          )
        })}
      </svg>
    </div>
  )
}

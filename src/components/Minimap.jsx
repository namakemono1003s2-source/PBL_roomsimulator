import { useStore } from '../store/useStore'

// 間取り図ミニマップ用の部屋矩形（apartmentLayout.js の実面積区画と同一比率）。
// Simulation画面の3D操作を邪魔しない範囲で、「今どこを見ているか」を伝えるための地図。
const MINIMAP_ROOMS = {
  I: {
    viewBox: '0 0 200 268',
    outer: { x: 8, y: 16, w: 184, h: 236 },
    rooms: [
      { id: 'living',   label: 'LD',    x: 8,   y: 156, w: 124, h: 96  },
      { id: 'kitchen',  label: 'K',     x: 8,   y: 105, w: 72,  h: 51  },
      { id: 'bedroom',  label: '①',    x: 8,   y: 16,  w: 72,  h: 89  },
      { id: 'bedroom2', label: '②',    x: 132, y: 16,  w: 60,  h: 77  },
      { id: 'bedroom3', label: '③',    x: 132, y: 135, w: 60,  h: 117 },
      { id: 'bathroom', label: '浴',    x: 132, y: 93,  w: 60,  h: 42  },
      { id: 'toilet',   label: '',      x: 112, y: 80,  w: 20,  h: 21  },
    ],
  },
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
        {map.rooms.map(r => {
          const sel = r.id === selectedRoom
          return (
            <rect
              key={r.id}
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

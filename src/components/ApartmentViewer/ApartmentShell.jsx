import { useMemo } from 'react'
import * as THREE from 'three'
import { LAYOUTS } from '../../data/apartmentLayout'
import { getToonGradientMap } from '../../utils/toonGradient'
import {
  computeWallSegments,
  windowVerticalExtent,
  windowsForStructuralWall,
  doorsForRoomSide,
  windowsForRoomSide,
} from './wallOpenings'

// ── 床テクスチャ生成 ──────────────────────────────────────────────────────────
function makeFloorTexture(floorType, hexColor) {
  const safeHex = /^#[0-9A-Fa-f]{6}$/.test(hexColor) ? hexColor : '#C0A880'
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  const hr = parseInt(safeHex.slice(1,3), 16)
  const hg = parseInt(safeHex.slice(3,5), 16)
  const hb = parseInt(safeHex.slice(5,7), 16)
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)))
  const rgb = (r,g,b,a=1) => `rgba(${clamp(r)},${clamp(g)},${clamp(b)},${a})`

  if (floorType === 'tile') {
    ctx.fillStyle = safeHex
    ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = rgb(hr-30,hg-30,hb-30,0.55)
    ctx.lineWidth = 5
    for (let i = 0; i <= size; i += 128) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,size); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(size,i); ctx.stroke()
    }
  } else if (floorType === 'carpet') {
    ctx.fillStyle = hexColor
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 6000; i++) {
      const v = (Math.random()-0.5)*28
      ctx.fillStyle = rgb(hr+v,hg+v,hb+v,0.22)
      ctx.fillRect(Math.random()*size, Math.random()*size, 1, 2)
    }
  } else {
    const plankH = 76
    for (let row = 0; row*plankH < size+plankH; row++) {
      const y0 = row*plankH
      const offset = (row%3)*(size/3)
      const colW = size/2
      for (let col = -1; col <= 2; col++) {
        const x0 = col*colW + offset
        const vary = (Math.random()-0.5)*22
        ctx.fillStyle = rgb(hr+vary, hg+vary*0.8, hb+vary*0.6)
        ctx.fillRect(x0, y0, colW-2, plankH-2)
        for (let g = 0; g < 10; g++) {
          const gy = y0 + Math.random()*plankH
          const gv = (Math.random()-0.5)*14
          ctx.strokeStyle = rgb(hr+gv-18, hg+gv-14, hb+gv-10, 0.28)
          ctx.lineWidth = Math.random()*1.2
          ctx.beginPath()
          ctx.moveTo(x0, gy)
          ctx.bezierCurveTo(
            x0+colW*0.35, gy+(Math.random()-0.5)*6,
            x0+colW*0.70, gy+(Math.random()-0.5)*6,
            x0+colW-2,    gy+(Math.random()-0.5)*4
          )
          ctx.stroke()
        }
      }
    }
    ctx.strokeStyle = rgb(hr-25,hg-20,hb-15,0.18)
    ctx.lineWidth = 2
    for (let row = 0; row*plankH < size; row++) {
      ctx.beginPath(); ctx.moveTo(0,row*plankH); ctx.lineTo(size,row*plankH); ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(floorType==='tile' ? 2 : 3, floorType==='tile' ? 2 : 3)
  tex.needsUpdate = true
  return tex
}

// ── 部屋の床パネル ─────────────────────────────────────────────────────────────
function RoomFloor({ room, config, selected, onSelect }) {
  const floorType  = config?.floorType  ?? 'wood'
  const floorColor = config?.floorColor ?? '#D4A574'
  const tex = useMemo(
    () => makeFloorTexture(floorType, floorColor),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [floorType, floorColor]
  )
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[room.x, 0.001, room.z]}
      receiveShadow
      onClick={room.clickable ? (e) => { e.stopPropagation(); onSelect(room.id) } : undefined}
    >
      <planeGeometry args={[room.w - 0.08, room.d - 0.08]} />
      <meshToonMaterial
        map={tex}
        gradientMap={getToonGradientMap()}
        emissive={selected ? '#FFF4C0' : '#000000'}
        emissiveIntensity={selected ? 0.18 : 0}
      />
    </mesh>
  )
}

// ── 窓ガラスパネル ─────────────────────────────────────────────────────────────
function WindowPane({ win }) {
  // face='z' → z軸に垂直な壁に埋め込まれた窓 (南壁/北壁)
  // face='x' → x軸に垂直な壁に埋め込まれた窓 (東壁/西壁)
  const rot = win.face === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0]
  const y = win.face === 'z'
    ? (win.h < 2.0 ? 1.0 + win.h / 2 : win.h / 2 + 0.05)
    : (win.h < 2.0 ? 1.0 + win.h / 2 : win.h / 2 + 0.05)

  return (
    <group position={[win.cx, y, win.cz]}>
      {/* フレーム */}
      <mesh rotation={rot}>
        <planeGeometry args={[win.w + 0.12, win.h + 0.10]} />
        <meshToonMaterial color="#E8E2D8" gradientMap={getToonGradientMap()} side={THREE.DoubleSide} />
      </mesh>
      {/* ガラス */}
      <mesh rotation={rot} position={win.face === 'x' ? [-0.04, 0, 0] : [0, 0, 0.04]}>
        <planeGeometry args={[win.w, win.h]} />
        <meshStandardMaterial
          color="#B8D8F0"
          transparent
          opacity={0.28}
          roughness={0.02}
          metalness={0.05}
          emissive="#D0EEFF"
          emissiveIntensity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ── ドアパネル ────────────────────────────────────────────────────────────────
function DoorPanel({ door }) {
  // face='x' → x軸に垂直な壁の開口(幅はz方向) / face='z' → z軸に垂直な壁の開口(幅はx方向)
  const rot = door.face === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0]
  const knobSide = door.face === 'x' ? [0, 0, door.w / 2 - 0.08] : [door.w / 2 - 0.08, 0, 0]

  return (
    <group position={[door.cx, door.h / 2, door.cz]} rotation={rot}>
      {/* 扉パネル: 開口と同一サイズ */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[door.w, door.h, 0.045]} />
        <meshToonMaterial color="#8B6842" gradientMap={getToonGradientMap()} />
      </mesh>
      {/* ドアノブ */}
      <mesh position={[knobSide[0], 0, 0.03]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial color="#C0A060" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ── メイン ────────────────────────────────────────────────────────────────────
export default function ApartmentShell({ planType, rooms, selectedRoom, onSelectRoom }) {
  const layout = LAYOUTS[planType]
  if (!layout) return null

  const WALL_COLOR = '#F2EDE6'

  return (
    <group>
      {/* 地面 (アパート外周より少し広い) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[layout.footprint.w + 5, layout.footprint.d + 5]} />
        <meshToonMaterial color="#C8C0B0" gradientMap={getToonGradientMap()} />
      </mesh>

      {/* 廊下・非居住ゾーンの床 (中間色。room.floorColorで個別上書き可) */}
      {layout.rooms.filter(r => !r.clickable).map(room => (
        <mesh
          key={`uf-${room.id}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[room.x, 0.0005, room.z]}
          receiveShadow
        >
          <planeGeometry args={[room.w - 0.08, room.d - 0.08]} />
          <meshToonMaterial color={room.floorColor ?? '#E8E2DA'} gradientMap={getToonGradientMap()} />
        </mesh>
      ))}

      {/* 共用廊下 (専有部外の背景パッチ) */}
      {layout.commonCorridor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[layout.commonCorridor.x, -0.01, layout.commonCorridor.z]}>
          <planeGeometry args={[layout.commonCorridor.w, layout.commonCorridor.d]} />
          <meshToonMaterial color="#DDD8CE" gradientMap={getToonGradientMap()} />
        </mesh>
      )}

      {/* 居住室の床 (各部屋の設定を反映) */}
      {layout.rooms.filter(r => r.clickable).map(room => (
        <RoomFloor
          key={room.id}
          room={room}
          config={rooms[room.id]}
          selected={room.id === selectedRoom}
          onSelect={onSelectRoom}
        />
      ))}

      {/* 構造壁 [cx, cz, w, d, h] — 窓の位置は開口として切り出す（ドアは既に手作業で分割済みのため対象外） */}
      {layout.walls.flatMap(([cx, cz, w, d, h], i) => {
        const lengthAxisIsX = w >= d
        const spanCenter = lengthAxisIsX ? cx : cz
        const half = (lengthAxisIsX ? w : d) / 2
        const thickness = lengthAxisIsX ? d : w
        const openings = windowsForStructuralWall(cx, cz, w, d, layout.windows).map(win => {
          const along = lengthAxisIsX ? win.cx : win.cz
          const { bottom, top } = windowVerticalExtent(win)
          return { alongStart: along - win.w / 2, alongEnd: along + win.w / 2, yBottom: bottom, yTop: top }
        })
        const segments = computeWallSegments(spanCenter - half, spanCenter + half, h, openings)
        return segments.map((seg, j) => {
          const boxArgs = lengthAxisIsX
            ? [seg.alongLength, seg.yTop - seg.yBottom, thickness]
            : [thickness, seg.yTop - seg.yBottom, seg.alongLength]
          const position = lengthAxisIsX
            ? [seg.alongCenter, (seg.yBottom + seg.yTop) / 2, cz]
            : [cx, (seg.yBottom + seg.yTop) / 2, seg.alongCenter]
          return (
            <mesh key={`${i}-${j}`} position={position} receiveShadow castShadow>
              <boxGeometry args={boxArgs} />
              <meshToonMaterial color={WALL_COLOR} gradientMap={getToonGradientMap()} />
            </mesh>
          )
        })
      })}

      {/* 各居住室の壁色パネル (内壁面) — ドア・窓の位置は開口として切り出す */}
      {layout.rooms.filter(r => r.clickable).map(room => {
        const wallColor = rooms[room.id]?.wallColor ?? '#F5F2EC'
        const hw = room.w / 2, hd = room.d / 2, rh = room.h
        // Iタイプ: K/LD間・廊下/LD間・K/廊下間の壁を撤去したため、該当面は描画しない。
        const skipSouthWall = planType === 'I' && room.id === 'kitchen'
        const skipEastWall  = planType === 'I' && room.id === 'kitchen'
        const skipNorthWall = planType === 'I' && room.id === 'living'

        const panelSegments = (side) => {
          const isNS = side === 'N' || side === 'S'
          const worldCenter = isNS ? room.x : room.z
          const openings = [
            ...doorsForRoomSide(room, side, layout.doors).map(d => {
              const along = (isNS ? d.cx : d.cz) - worldCenter
              return { alongStart: along - d.w / 2, alongEnd: along + d.w / 2 }
            }),
            ...windowsForRoomSide(room, side, layout.windows).map(w => {
              const along = (isNS ? w.cx : w.cz) - worldCenter
              const { bottom, top } = windowVerticalExtent(w)
              return { alongStart: along - w.w / 2, alongEnd: along + w.w / 2, yBottom: bottom, yTop: top }
            }),
          ]
          const halfLen = (isNS ? room.w : room.d) / 2 - 0.1
          return computeWallSegments(-halfLen, halfLen, rh, openings)
        }

        return (
          <group key={`wp-${room.id}`} position={[room.x, 0, room.z]}>
            {/* 北内壁 */}
            {!skipNorthWall && panelSegments('N').map((seg, j) => (
              <mesh key={`n-${j}`} position={[seg.alongCenter, (seg.yBottom + seg.yTop) / 2, -hd + 0.06]}>
                <planeGeometry args={[seg.alongLength, seg.yTop - seg.yBottom]} />
                <meshToonMaterial color={wallColor} gradientMap={getToonGradientMap()} side={THREE.FrontSide} />
              </mesh>
            ))}
            {/* 南内壁 */}
            {!skipSouthWall && panelSegments('S').map((seg, j) => (
              <mesh key={`s-${j}`} position={[seg.alongCenter, (seg.yBottom + seg.yTop) / 2, hd - 0.06]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[seg.alongLength, seg.yTop - seg.yBottom]} />
                <meshToonMaterial color={wallColor} gradientMap={getToonGradientMap()} side={THREE.FrontSide} />
              </mesh>
            ))}
            {/* 西内壁 */}
            {panelSegments('W').map((seg, j) => (
              <mesh key={`w-${j}`} position={[-hw + 0.06, (seg.yBottom + seg.yTop) / 2, seg.alongCenter]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[seg.alongLength, seg.yTop - seg.yBottom]} />
                <meshToonMaterial color={wallColor} gradientMap={getToonGradientMap()} side={THREE.FrontSide} />
              </mesh>
            ))}
            {/* 東内壁 */}
            {!skipEastWall && panelSegments('E').map((seg, j) => (
              <mesh key={`e-${j}`} position={[hw - 0.06, (seg.yBottom + seg.yTop) / 2, seg.alongCenter]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[seg.alongLength, seg.yTop - seg.yBottom]} />
                <meshToonMaterial color={wallColor} gradientMap={getToonGradientMap()} side={THREE.FrontSide} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* 窓 */}
      {layout.windows.map((win, i) => (
        <WindowPane key={i} win={win} />
      ))}

      {/* ドア */}
      {layout.doors?.map((door, i) => (
        <DoorPanel key={i} door={door} />
      ))}

      {/* バルコニー床 */}
      {layout.balcony && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[layout.balcony.x, -0.015, layout.balcony.z]}>
          <planeGeometry args={[layout.balcony.w, layout.balcony.d]} />
          <meshToonMaterial color="#D8D2C4" gradientMap={getToonGradientMap()} />
        </mesh>
      )}

      {/* 天井 (内壁色、やや透過的に上から覗ける演出はなし — 開放型ドールハウス) */}
      {/* 天井なしで上から全室見渡せる設計 */}
    </group>
  )
}

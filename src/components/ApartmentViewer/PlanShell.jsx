// PlanShell.jsx — 平面図データ(planToLayout の結果)から、住戸の床・壁・ドア・窓・収納・作り付け設備を描画する。
// ApartmentShell.jsx は部屋を長方形の箱として並べる旧形式のレイアウト用（Hタイプ）。
// こちらは壁を平面図どおりに1本ずつ立て、壁の両面をそれぞれ隣の部屋の壁色で塗る。

import { useMemo } from 'react'
import { getToonGradientMap } from '../../utils/toonGradient'
import { makeFloorTexture, WindowPane, DoorPanel } from './ApartmentShell'
import { B } from './ApartmentFurniture'

const WALL_COLOR = '#F2EDE6'
const FLOOR_COLOR = { store: '#D9CFBC', out: '#D4CCB8' }
const STORE_COLOR = { shoes: '#B98B5E', ps: '#D0CCC4' }
const CLOSET_COLOR = '#E6DCC8'
const SEAM_COLOR = '#8F8270'

// ── 床（区画の矩形1枚ぶん） ────────────────────────────────────────────────────
function SpaceFloor({ rect, config, color, roomId, selected, onSelect }) {
  const floorType  = config?.floorType
  const floorColor = config?.floorColor
  const tex = useMemo(() => {
    if (!config) return null
    const t = makeFloorTexture(floorType, floorColor)
    // 板目・タイルの大きさが部屋の広さによらず同じになるよう、矩形の寸法に合わせて繰り返す
    const unit = floorType === 'tile' ? 0.9 : 1.6
    t.repeat.set(rect.w / unit, rect.d / unit)
    return t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorType, floorColor, rect.w, rect.d])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[rect.x, 0.001, rect.z]}
      receiveShadow
      onClick={roomId ? (e) => { e.stopPropagation(); onSelect(roomId) } : undefined}
    >
      <planeGeometry args={[rect.w, rect.d]} />
      <meshToonMaterial
        map={tex}
        color={tex ? '#FFFFFF' : color}
        gradientMap={getToonGradientMap()}
        emissive={selected ? '#FFF4C0' : '#000000'}
        emissiveIntensity={selected ? 0.18 : 0}
      />
    </mesh>
  )
}

// ── 壁ピース（箱＋両面の壁色パネル） ───────────────────────────────────────────
function WallPiece({ piece, rooms }) {
  const { horizontal, line, from, to, boxFrom, boxTo, yBottom, yTop, thickness: t } = piece
  const hgt = yTop - yBottom
  const ym = (yBottom + yTop) / 2
  const boxMid = (boxFrom + boxTo) / 2
  const boxLen = boxTo - boxFrom
  const mid = (from + to) / 2
  const len = to - from

  const colorOf = key => (key && key !== 'hallway' ? rooms[key]?.wallColor : null)
  const panels = [
    { color: colorOf(piece.negSide), sign: -1 },
    { color: colorOf(piece.posSide), sign: +1 },
  ].filter(p => p.color)

  return (
    <group>
      <mesh
        position={horizontal ? [boxMid, ym, line] : [line, ym, boxMid]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={horizontal ? [boxLen, hgt, t] : [t, hgt, boxLen]} />
        <meshToonMaterial color={WALL_COLOR} gradientMap={getToonGradientMap()} />
      </mesh>
      {panels.map(({ color, sign }) => {
        const offset = line + sign * (t / 2 + 0.003)
        // 水平な壁(z一定)の面は ±z 向き、垂直な壁(x一定)の面は ±x 向き
        const rotation = horizontal
          ? [0, sign > 0 ? 0 : Math.PI, 0]
          : [0, sign > 0 ? Math.PI / 2 : -Math.PI / 2, 0]
        return (
          <mesh key={sign} position={horizontal ? [mid, ym, offset] : [offset, ym, mid]} rotation={rotation}>
            <planeGeometry args={[len, hgt]} />
            <meshToonMaterial color={color} gradientMap={getToonGradientMap()} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── 収納（クローゼット・シューズボックス・PS・可動棚）: 箱＋扉の継ぎ目 ─────────────
function StoreBox({ space, rect, wallHeight }) {
  const h = space.storeHeight ?? (space.id === 'ps' ? wallHeight : 2.3)
  const inset = 0.03
  const w = rect.w - inset * 2, d = rect.d - inset * 2
  const color = STORE_COLOR[space.id] ?? CLOSET_COLOR

  const seams = []
  if (space.front) {
    const alongX = space.front === 'N' || space.front === 'S'
    const span = alongX ? w : d
    const doors = Math.max(1, Math.round(span / 0.45))
    const faceSign = space.front === 'S' || space.front === 'E' ? 1 : -1
    for (let i = 1; i < doors; i++) {
      const along = -span / 2 + (span * i) / doors
      seams.push(alongX
        ? { p: [along, h / 2, faceSign * (d / 2 + 0.004)], s: [0.012, h - 0.08, 0.008] }
        : { p: [faceSign * (w / 2 + 0.004), h / 2, along], s: [0.008, h - 0.08, 0.012] })
    }
  }

  return (
    <group position={[rect.x, 0, rect.z]}>
      <B p={[0, h / 2, 0]} s={[w, h, d]} c={color} />
      {seams.map((s, i) => (
        <mesh key={i} position={s.p}>
          <boxGeometry args={s.s} />
          <meshBasicMaterial color={SEAM_COLOR} />
        </mesh>
      ))}
    </group>
  )
}

// ── 作り付けの設備 ────────────────────────────────────────────────────────────
function Fixture({ f }) {
  const { x, z, w, d, h } = f
  switch (f.type) {
    case 'fridge':
      return (
        <group position={[x, 0, z]}>
          <B p={[0, h / 2, 0]} s={[w, h, d]} c="#ECECE8" />
          <mesh position={[0, 1.15, d / 2 + 0.004]}>
            <boxGeometry args={[w - 0.04, 0.012, 0.008]} />
            <meshBasicMaterial color={SEAM_COLOR} />
          </mesh>
        </group>
      )
    case 'counter':
      // 西側をコンロ、東側を流し台とする（対面型・ダイニング側を向く）
      return (
        <group position={[x, 0, z]}>
          <B p={[0, (h - 0.04) / 2, 0]} s={[w, h - 0.04, d]} c="#F3EEE6" />
          <B p={[0, h - 0.02, 0]} s={[w + 0.02, 0.04, d + 0.02]} c="#A39C92" />
          <B p={[-w / 4, h + 0.005, 0]} s={[0.6, 0.012, 0.45]} c="#1E1E22" sh={false} />
          <B p={[w / 4, h - 0.01, 0]} s={[0.55, 0.012, 0.4]} c="#A9B4BA" metal={0.6} rough={0.3} sh={false} />
        </group>
      )
    case 'basin':
      return (
        <group position={[x, 0, z]}>
          <B p={[0, h / 2, 0]} s={[w, h, d]} c="#F4F4F2" />
          <B p={[0, h + 0.005, 0]} s={[w * 0.6, 0.012, d * 0.6]} c="#DDE8EE" sh={false} />
          <B p={[w / 2 - 0.02, 1.45, 0]} s={[0.02, 0.7, d * 0.9]} c="#CFE3EC" metal={0.6} rough={0.1} sh={false} />
        </group>
      )
    case 'tub':
      return (
        <group position={[x, 0, z]}>
          <B p={[0, h / 2, 0]} s={[w, h, d]} c="#E8F4F8" />
          <B p={[0, h - 0.04, 0]} s={[w - 0.16, 0.012, d - 0.16]} c="#BFE1EE" sh={false} />
        </group>
      )
    case 'washer':
      return (
        <group position={[x, 0, z]}>
          <B p={[0, h / 2, 0]} s={[w - 0.06, h, d - 0.06]} c="#F2F2F0" />
          <B p={[0, h + 0.005, 0]} s={[0.36, 0.012, 0.36]} c="#9FB0BC" sh={false} />
        </group>
      )
    case 'toiletTank':
    case 'toiletBowl':
      return <B p={[x, h / 2, z]} s={[w, h, d]} c="#F7F7F5" />
    default:
      return <B p={[x, h / 2, z]} s={[w, h, d]} c="#E0DCD4" />
  }
}

// ── メイン ────────────────────────────────────────────────────────────────────
export default function PlanShell({ layout, rooms, selectedRoom, onSelectRoom }) {
  return (
    <group>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[layout.footprint.w + 6, layout.footprint.d + 9]} />
        <meshToonMaterial color="#C8C0B0" gradientMap={getToonGradientMap()} />
      </mesh>

      {/* 共用廊下 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[layout.commonCorridor.x, -0.001, layout.commonCorridor.z]}>
        <planeGeometry args={[layout.commonCorridor.w, layout.commonCorridor.d]} />
        <meshToonMaterial color="#DDD8CE" gradientMap={getToonGradientMap()} />
      </mesh>

      {/* 床: 部屋は内装設定の床材、廊下はLDと同じ床材、収納・専有部外は固定色 */}
      {layout.spaces.flatMap(space => {
        const configKey = space.roomId ?? (space.id === 'hallway' ? 'living' : null)
        const config = configKey ? rooms[configKey] : null
        return [...space.worldRects, ...space.worldAux].map((rect, i) => (
          <SpaceFloor
            key={`${space.id}-${i}`}
            rect={rect}
            config={config}
            color={FLOOR_COLOR[space.kind] ?? '#E8E2DA'}
            roomId={space.roomId}
            selected={!!space.roomId && space.roomId === selectedRoom}
            onSelect={onSelectRoom}
          />
        ))
      })}

      {/* 壁 */}
      {layout.wallPieces.map((piece, i) => (
        <WallPiece key={i} piece={piece} rooms={rooms} />
      ))}

      {/* 収納 */}
      {layout.spaces.filter(s => s.kind === 'store').flatMap(space =>
        space.worldRects.map((rect, i) => (
          <StoreBox key={`${space.id}-${i}`} space={space} rect={rect} wallHeight={layout.wallHeight} />
        ))
      )}

      {/* 作り付けの設備 */}
      {layout.fixtures.map((f, i) => <Fixture key={i} f={f} />)}

      {/* 窓・ドア */}
      {layout.windows.map((win, i) => <WindowPane key={i} win={win} />)}
      {layout.doors.map((door, i) => <DoorPanel key={i} door={door} />)}
    </group>
  )
}

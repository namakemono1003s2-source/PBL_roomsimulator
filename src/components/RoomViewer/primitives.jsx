// primitives.jsx — 手続き型家具メッシュ（GLBモデル未設定時のフォールバック描画）
// RoomViewer.jsx からそのまま移動。ロジック変更なし。

import { RoundedBox } from '@react-three/drei'

// ── Furniture primitives ─────────────────────────────────────────────────────
function Box({ pos=[0,0,0], rot=0, size, color, rough=0.6, metal=0 }) {
  return (
    <mesh position={pos} rotation={[0,rot,0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  )
}

// 角丸ボックス（ソファ・テーブルトップ等の視認面に使用）
function RBox({ pos=[0,0,0], rot=0, size, color, rough=0.6, metal=0 }) {
  const r = Math.min(size[0], size[1], size[2]) * 0.06
  return (
    <RoundedBox args={size} radius={r} smoothness={3}
      position={pos} rotation={[0,rot,0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </RoundedBox>
  )
}

function Sofa({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.23,0]}       size={[2.1,0.22,0.9]}  color={color} rough={0.85} />
      <Box pos={[0,0.56,-0.38]}   size={[2.1,0.55,0.18]} color={accent} rough={0.85} />
      <Box pos={[-0.95,0.44,-0.06]} size={[0.18,0.4,0.84]} color={accent} rough={0.85} />
      <Box pos={[0.95,0.44,-0.06]}  size={[0.18,0.4,0.84]} color={accent} rough={0.85} />
      {[-0.65,0,0.65].map((ox,i) => <RBox key={i} pos={[ox,0.38,-0.07]} size={[0.6,0.1,0.74]} color={color} rough={0.88} />)}
      {[[-0.88,-0.12],[0.88,-0.12],[-0.88,0.32],[0.88,0.32]].map(([lx,lz],i) => (
        <mesh key={`l${i}`} position={[lx,0.05,lz]} castShadow>
          <cylinderGeometry args={[0.035,0.035,0.1,8]} />
          <meshStandardMaterial color={accent} roughness={0.4} metalness={0.15} />
        </mesh>
      ))}
      {/* スロークッション（バックレスト両端） */}
      <RBox pos={[-0.52,0.58,-0.27]} size={[0.30,0.30,0.11]} color={color}  rough={0.92} />
      <RBox pos={[ 0.52,0.58,-0.27]} size={[0.28,0.26,0.10]} color={accent} rough={0.88} />
      {/* ブランケット（左アーム上） */}
      <mesh position={[-0.78,0.48,0.08]} rotation={[0.08,0,-0.18]} castShadow>
        <boxGeometry args={[0.38,0.045,0.52]} />
        <meshStandardMaterial color="#D8CCBA" roughness={0.96} />
      </mesh>
    </group>
  )
}

function TVUnit({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.22,0]}    size={[2.0,0.44,0.48]} color={color} rough={0.4} />
      <Box pos={[0,0.88,0.02]} size={[1.5,0.82,0.07]} color="#141414" rough={0.05} metal={0.4} />
      <Box pos={[0,0.88,0.06]} size={[1.36,0.68,0.02]} color="#080808" rough={0} metal={0.1} />
    </group>
  )
}

function CoffeeTable({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <RBox pos={[0,0.24,0]} size={[1.15,0.05,0.65]} color={color} rough={0.3} metal={0.18} />
      {[[-0.48,-0.24],[0.48,-0.24],[-0.48,0.24],[0.48,0.24]].map(([lx,lz],i) => (
        <Box key={i} pos={[lx,0.12,lz]} size={[0.05,0.24,0.05]} color={accent} rough={0.5} />
      ))}
      {/* 天板小物: トレイ＋本 */}
      <Box pos={[0.22,0.275,0.04]}  size={[0.30,0.02,0.20]} color={accent} rough={0.28} metal={0.22} />
      <Box pos={[-0.22,0.275,0.05]} size={[0.20,0.04,0.14]} color="#5A4438" rough={0.72} />
      <Box pos={[-0.22,0.312,0.05]} size={[0.18,0.03,0.12]} color="#7A6050" rough={0.72} />
    </group>
  )
}

function DiningTable({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      {/* テーブルトップ: 4人用1.5m×0.85m */}
      <RBox pos={[0,0.73,0]} size={[1.5,0.06,0.85]} color={color} rough={0.35} metal={0.05} />
      {/* 天板下フレーム（装飾） */}
      <Box pos={[0,0.68,0]} size={[1.35,0.04,0.7]} color={accent} rough={0.5} />
      {[[-0.65,-0.35],[0.65,-0.35],[-0.65,0.35],[0.65,0.35]].map(([lx,lz],i) => (
        <Box key={i} pos={[lx,0.36,lz]} size={[0.055,0.72,0.055]} color={accent} rough={0.5} />
      ))}
    </group>
  )
}

function DiningChair({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.45,0]}    size={[0.44,0.06,0.44]} color={color} rough={0.7} />
      <Box pos={[0,0.76,-0.19]} size={[0.44,0.56,0.06]} color={accent} rough={0.7} />
      {[[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].map(([lx,lz],i) => (
        <Box key={i} pos={[lx,0.22,lz]} size={[0.04,0.46,0.04]} color={accent} rough={0.5} />
      ))}
    </group>
  )
}

function Rug({ pos, color }) {
  return (
    <group position={[pos[0], 0.005, pos[2]]}>
      {/* ラグ本体: ソファ幅2.1mに対し各30cm拡張した2.7m×1.95m */}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[2.7, 1.95]} />
        <meshStandardMaterial color={color} roughness={0.97} />
      </mesh>
      {/* ラグ縁取り（微妙に明るい枠） */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0.001]}>
        <planeGeometry args={[2.82, 2.07]} />
        <meshStandardMaterial
          color={color}
          roughness={0.95}
          transparent opacity={0.45}
        />
      </mesh>
    </group>
  )
}

function Plant({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <mesh position={[0,0.18,0]} castShadow>
        <cylinderGeometry args={[0.16,0.13,0.35,10]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      <mesh position={[0,0.6,0]} castShadow>
        <sphereGeometry args={[0.32,14,14]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

function BedKing({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.16,0]}    size={[2.1,0.2,2.2]}  color={accent} rough={0.6} />
      <Box pos={[0,0.3,0.05]}  size={[1.92,0.18,1.95]} color={color} rough={0.9} />
      <Box pos={[-0.42,0.41,-0.72]} size={[0.65,0.1,0.42]} color={color} rough={0.9} />
      <Box pos={[0.42,0.41,-0.72]}  size={[0.65,0.1,0.42]} color={color} rough={0.9} />
      <Box pos={[0,0.38,0.35]}  size={[1.9,0.1,1.2]} color={color} rough={0.9} />
      <Box pos={[0,0.66,-1.0]}  size={[2.1,0.8,0.12]} color={accent} rough={0.6} />
    </group>
  )
}

function Bed({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.16,0]}    size={[1.75,0.2,2.1]}  color={accent} rough={0.6} />
      <Box pos={[0,0.3,0.05]}  size={[1.58,0.16,1.85]} color={color} rough={0.9} />
      <Box pos={[-0.35,0.39,-0.72]} size={[0.58,0.1,0.38]} color={color} rough={0.9} />
      <Box pos={[0.35,0.39,-0.72]}  size={[0.58,0.1,0.38]} color={color} rough={0.9} />
      <Box pos={[0,0.37,0.3]}  size={[1.56,0.08,1.2]} color={color} rough={0.9} />
      <Box pos={[0,0.64,-0.97]} size={[1.75,0.72,0.1]} color={accent} rough={0.6} />
    </group>
  )
}

function Nightstand({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <RBox pos={[0,0.3,0]}  size={[0.46,0.56,0.38]} color={color} rough={0.48} />
      <RBox pos={[0,0.59,0]} size={[0.45,0.04,0.37]} color={accent} rough={0.3} />
      <mesh position={[0,0.72,0]} castShadow>
        <cylinderGeometry args={[0.025,0.025,0.22,8]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0,0.9,0]}>
        <coneGeometry args={[0.15,0.18,12]} />
        <meshStandardMaterial color="#F0E8D0" roughness={0.9} emissive="#FFD080" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

function Dresser({ pos, rot=0, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <RBox pos={[0,0.52,0]}  size={[0.98,1.04,0.46]} color={color} rough={0.48} />
      <RBox pos={[0,1.06,0]}  size={[0.98,0.06,0.46]} color={accent} rough={0.3} />
      {[0.32,0.1,-0.12,-0.34].map((dy,i) => (
        <mesh key={i} position={[0,0.52+dy,0.25]} castShadow>
          <boxGeometry args={[0.1,0.04,0.04]} />
          <meshStandardMaterial color={accent} roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Desk({ pos, rot=0, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <Box pos={[0,0.73,0]}  size={[1.3,0.04,0.58]} color={color} rough={0.5} />
      {[[-0.6,-0.24],[0.6,-0.24],[-0.6,0.24],[0.6,0.24]].map(([lx,lz],i) => (
        <Box key={i} pos={[lx,0.365,lz]} size={[0.045,0.73,0.045]} color={accent} rough={0.4} />
      ))}
      <Box pos={[0,1.12,-0.22]} size={[0.55,0.34,0.04]} color="#181818" rough={0.05} metal={0.3} />
      <Box pos={[0,0.74,-0.22]} size={[0.04,0.34,0.04]} color="#282828" rough={0.4} />
    </group>
  )
}

function Chair({ pos, rot=0, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <Box pos={[0,0.46,0]}    size={[0.47,0.06,0.47]} color={color} rough={0.7} />
      <Box pos={[0,0.78,-0.2]} size={[0.47,0.62,0.06]} color={accent} rough={0.7} />
      {[[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]].map(([lx,lz],i) => (
        <Box key={i} pos={[lx,0.23,lz]} size={[0.04,0.46,0.04]} color={accent} rough={0.5} />
      ))}
    </group>
  )
}

function Counter({ pos, color, accent, rot=0 }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <RBox pos={[0,0.45,0]}  size={[2.0,0.9,0.55]} color={color} rough={0.38} />
      <RBox pos={[0,0.92,0]}  size={[2.04,0.06,0.58]} color={accent} rough={0.18} metal={0.12} />
      <Box pos={[0.5,0.93,0]} size={[0.5,0.08,0.38]} color="#D0D0D8" rough={0.1} metal={0.3} />
    </group>
  )
}

function Island({ pos, color, accent, rot=0 }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <RBox pos={[0,0.45,0]}  size={[1.1,0.9,0.65]} color={color} rough={0.45} />
      <RBox pos={[0,0.92,0]}  size={[1.14,0.06,0.68]} color={accent} rough={0.22} metal={0.18} />
    </group>
  )
}

function Stool({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <mesh position={[0,0.7,0]} castShadow>
        <cylinderGeometry args={[0.18,0.18,0.06,12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0,0.35,0]} castShadow>
        <cylinderGeometry args={[0.03,0.03,0.7,8]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Bathtub({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.24,0]}  size={[1.55,0.46,0.78]} color={color} rough={0.12} metal={0.05} />
      <Box pos={[0,0.4,0]}   size={[1.34,0.24,0.58]} color={accent} rough={0.08} metal={0.05} />
      <mesh position={[0.65,0.54,0]} castShadow>
        <cylinderGeometry args={[0.025,0.025,0.18,8]} />
        <meshStandardMaterial color="#C8C8C8" roughness={0.1} metalness={0.85} />
      </mesh>
    </group>
  )
}

function Vanity({ pos, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      <Box pos={[0,0.4,0]}  size={[0.92,0.78,0.46]} color={color} rough={0.4} />
      <Box pos={[0,0.8,0]}  size={[0.94,0.06,0.47]} color={accent} rough={0.15} metal={0.2} />
      <mesh position={[0,1.34,0.05]}>
        <boxGeometry args={[0.84,0.88,0.03]} />
        <meshStandardMaterial color="#C0D4DC" roughness={0} metalness={0.92} />
      </mesh>
    </group>
  )
}

function Toilet({ pos, rot=0, color, accent }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]} rotation={[0,rot,0]}>
      <Box pos={[0,0.24,0]}    size={[0.38,0.4,0.56]} color={color} rough={0.18} />
      <Box pos={[0,0.46,-0.18]} size={[0.37,0.1,0.26]} color={accent} rough={0.18} />
      <Box pos={[0,0.58,-0.18]} size={[0.37,0.08,0.22]} color={color} rough={0.14} />
    </group>
  )
}

function FloorLamp({ pos, color='#C8A860', accent='#808080' }) {
  const [x,y,z] = pos
  return (
    <group position={[x,y,z]}>
      {/* ベース */}
      <mesh position={[0,0.04,0]} castShadow>
        <cylinderGeometry args={[0.18,0.20,0.06,14]} />
        <meshStandardMaterial color={accent} roughness={0.28} metalness={0.55} />
      </mesh>
      {/* ポール */}
      <mesh position={[0,0.85,0]} castShadow>
        <cylinderGeometry args={[0.024,0.024,1.54,8]} />
        <meshStandardMaterial color={accent} roughness={0.20} metalness={0.68} />
      </mesh>
      {/* シェード */}
      <mesh position={[0,1.62,0]} castShadow>
        <cylinderGeometry args={[0.22,0.15,0.34,14]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
      {/* 発光体 */}
      <mesh position={[0,1.52,0]}>
        <sphereGeometry args={[0.05,8,8]} />
        <meshStandardMaterial color="#FFF8E0" roughness={0} emissive="#FFD870" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

export const MESH_MAP = {
  sofa: Sofa, tvUnit: TVUnit, coffeeTable: CoffeeTable, rug: Rug, plant: Plant,
  diningTable: DiningTable, diningChair: DiningChair,
  bedKing: BedKing, bed: Bed, nightstand: Nightstand, dresser: Dresser,
  desk: Desk, chair: Chair,
  counter: Counter, island: Island, stool: Stool,
  bathtub: Bathtub, vanity: Vanity, toilet: Toilet,
  floorLamp: FloorLamp,
}

// ApartmentFurniture.jsx
// インテリアコーディネート: モダンジャパニーズスタイル (参考画像1準拠)
// 全座標はアパート中心原点のワールド座標 (m)

import * as THREE from 'three'
import { getToonGradientMap } from '../../utils/toonGradient'

const GLOSSY_THRESHOLD = 0.15
const OUTLINE_COLOR = '#232232'
const OUTLINE_SCALE = 1.035

// ── 素材色 ────────────────────────────────────────────────────────────────────
const C = {
  leather:    '#4E3228',
  leatherDrk: '#3A2418',
  oakLight:   '#C4904A',
  walnut:     '#3C2010',
  black:      '#181818',
  white:      '#F8F6F2',
  marble:     '#E8E4DC',
  darkCab:    '#1C1610',
  chrome:     '#C0C0C0',
  steel:      '#909090',
  cream:      '#EDE8DC',
  green:      '#1E5028',
  rug:        '#181820',
  gray:       '#6A6A72',
  bedWhite:   '#F5F2EC',
  blue:       '#D0D8E8',
}

// ── 共通メッシュ ──────────────────────────────────────────────────────────────
// 2026-09: 「実写に寄せすぎるとモデルルームとのギャップが目立つ」との判断から、
// 光沢のない一般パーツはセルシェーディング(トゥーン)+輪郭線で描画する。
// 金属・鏡面などmetal値が高いパーツだけは、質感の対比のため光沢表現を残す。
export function B({ p=[0,0,0], r=0, s, c, rough=0.7, metal=0, sh=true }) {
  const glossy = metal > GLOSSY_THRESHOLD
  return (
    <group position={p} rotation={[0,r,0]}>
      {!glossy && (
        <mesh scale={OUTLINE_SCALE}>
          <boxGeometry args={s} />
          <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow={sh} receiveShadow>
        <boxGeometry args={s} />
        {glossy
          ? <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
          : <meshToonMaterial color={c} gradientMap={getToonGradientMap()} />}
      </mesh>
    </group>
  )
}
function Cyl({ p=[0,0,0], r=0, args, c, rough=0.7, metal=0 }) {
  const glossy = metal > GLOSSY_THRESHOLD
  return (
    <group position={p} rotation={[0,r,0]}>
      {!glossy && (
        <mesh scale={OUTLINE_SCALE} castShadow>
          <cylinderGeometry args={args} />
          <meshBasicMaterial color={OUTLINE_COLOR} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={args} />
        {glossy
          ? <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
          : <meshToonMaterial color={c} gradientMap={getToonGradientMap()} />}
      </mesh>
    </group>
  )
}

// ── 家具コンポーネント ─────────────────────────────────────────────────────────

// 3人掛けソファ (rot=π/2 → 幅2.2mがZ軸方向, 奥行0.9mがX軸方向, 正面が+X)
function Sofa({ p=[0,0,0], rot=Math.PI/2 }) {
  const W=2.2, D=0.9, SH=0.40, BH=0.38, legH=0.08
  return (
    <group position={p} rotation={[0,rot,0]}>
      {[[-W/2+0.1,-D/2+0.1],[W/2-0.1,-D/2+0.1],[-W/2+0.1,D/2-0.1],[W/2-0.1,D/2-0.1]].map(([x,z],i)=>(
        <mesh key={i} position={[x,legH/2,z]} castShadow>
          <boxGeometry args={[0.07,legH,0.07]} />
          <meshToonMaterial color={C.walnut} gradientMap={getToonGradientMap()} />
        </mesh>
      ))}
      {/* 座面 */}
      <B p={[0,legH+SH/2,0]} s={[W,SH,D]} c={C.leather} rough={0.65} metal={0.03} />
      {/* 背もたれ */}
      <B p={[0,legH+SH+BH/2,-D/2+0.11]} s={[W,BH,0.20]} c={C.leather} rough={0.65} metal={0.03} />
      {/* アームL */}
      <B p={[-W/2+0.11,legH+SH/2+0.14,0]} s={[0.20,0.28,D]} c={C.leather} rough={0.65} />
      {/* アームR */}
      <B p={[W/2-0.11,legH+SH/2+0.14,0]} s={[0.20,0.28,D]} c={C.leather} rough={0.65} />
      {/* クッション×3 */}
      {[-0.68,0,0.68].map((x,i)=>(
        <B key={i} p={[x,legH+SH+0.07,-D/2+0.30]} s={[0.64,0.16,0.50]} c={C.leatherDrk} rough={0.8} />
      ))}
    </group>
  )
}

// コーヒーテーブル (脚はマットブラック)
function CoffeeTable({ p=[0,0,0], rot=0 }) {
  const W=1.1, D=0.55, H=0.36
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,H,0]} s={[W,0.04,D]} c={C.oakLight} rough={0.6} metal={0.04} />
      {[[-W/2+0.06,-D/2+0.06],[W/2-0.06,-D/2+0.06],[-W/2+0.06,D/2-0.06],[W/2-0.06,D/2-0.06]].map(([x,z],i)=>(
        <Cyl key={i} p={[x,H/2,z]} args={[0.022,0.022,H,8]} c={C.black} rough={0.4} metal={0.8} />
      ))}
    </group>
  )
}

// TVユニット (rot=-π/2 → 幅1.5mがZ方向, 正面(スクリーン)が-X方向→西側)
function TVUnit({ p=[0,0,0], rot=-Math.PI/2 }) {
  const W=1.5, D=0.36, CH=0.44, SH=0.70, SW=1.24
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,CH/2,0]} s={[W,CH,D]} c={C.darkCab} rough={0.45} metal={0.2} />
      <B p={[0,CH+0.02,0]} s={[W+0.02,0.04,D+0.02]} c={C.marble} rough={0.15} metal={0.06} />
      {/* スクリーン本体 */}
      <B p={[0,CH+0.04+SH/2,-D/2-0.03]} s={[SW,SH,0.05]} c={C.black} rough={0.3} metal={0.3} />
      {/* 表示面 */}
      <mesh position={[0,CH+0.04+SH/2,-D/2-0.06]}>
        <boxGeometry args={[SW-0.04,SH-0.04,0.001]} />
        <meshStandardMaterial color="#060614" emissive="#0A1828" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

// フロアランプ (アーク型)
function FloorLamp({ p=[0,0,0] }) {
  return (
    <group position={p}>
      <Cyl p={[0,0.04,0]} args={[0.20,0.20,0.08,20]} c={C.black} rough={0.4} metal={0.7} />
      <Cyl p={[0,1.15,0]} args={[0.016,0.016,2.22,8]} c={C.black} rough={0.35} metal={0.8} />
      {/* アーチ (連続sphere近似) */}
      {Array.from({length:10}).map((_,i)=>{
        const t=i/9
        const ax = Math.sin(t*Math.PI*0.5)*0.6
        const ay = 2.3 - (1-Math.cos(t*Math.PI*0.5))*0.6
        return <mesh key={i} position={[ax,ay,0]}><sphereGeometry args={[0.013,6,6]}/><meshStandardMaterial color={C.black} roughness={0.35} metalness={0.8}/></mesh>
      })}
      {/* シェード */}
      <mesh position={[0.6,2.28,0]} castShadow>
        <cylinderGeometry args={[0.20,0.26,0.28,24,1,true]} />
        <meshToonMaterial color="#F8F4EE" gradientMap={getToonGradientMap()} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 観葉植物
function Plant({ p=[0,0,0], h=1.2 }) {
  return (
    <group position={p}>
      <Cyl p={[0,0.18,0]} args={[0.14,0.11,0.34,16]} c={'#2A2A26'} rough={0.75} />
      <Cyl p={[0,h*0.35+0.34,0]} args={[0.025,0.025,h*0.7,8]} c={'#2A1A08'} rough={0.85} />
      {[[0,h,0,0.24],[0.14,h*0.8,0.1,0.18],[-0.1,h*0.9,-0.12,0.16],[0,h*1.1,0,0.14]].map(([x,y,z,r],i)=>(
        <mesh key={i} position={[x,y,z]} castShadow>
          <sphereGeometry args={[r,8,6]} />
          <meshToonMaterial color={C.green} gradientMap={getToonGradientMap()} />
        </mesh>
      ))}
    </group>
  )
}

// 丸ダイニングテーブル
function DiningTable({ p=[0,0,0] }) {
  return (
    <group position={p}>
      <Cyl p={[0,0.74,0]} args={[0.56,0.56,0.04,32]} c={C.oakLight} rough={0.6} metal={0.02} />
      <Cyl p={[0,0.38,0]} args={[0.055,0.09,0.72,12]} c={C.walnut} rough={0.6} />
      <Cyl p={[0,0.03,0]} args={[0.28,0.28,0.06,16]} c={C.walnut} rough={0.6} />
    </group>
  )
}

// ダイニングチェア
function DiningChair({ p=[0,0,0], rot=0 }) {
  const lr=0.017
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.45,0]} s={[0.43,0.04,0.42]} c={C.oakLight} rough={0.65} />
      <B p={[0,0.78,-0.18]} s={[0.43,0.58,0.04]} c={C.oakLight} rough={0.65} />
      {[[-0.16,0.16],[0.16,0.16],[-0.16,-0.18],[0.16,-0.18]].map(([x,z],i)=>(
        <Cyl key={i} p={[x,0.22,z]} args={[lr,lr,0.44,8]} c={C.walnut} rough={0.6} />
      ))}
    </group>
  )
}

// キッチンカウンター
function KitchenCounter({ p=[0,0,0], rot=0, w=2.0, d=0.58 }) {
  const H=0.87
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,H/2,0]} s={[w,H,d]} c={C.darkCab} rough={0.45} metal={0.12} />
      <B p={[0,H+0.025,0]} s={[w+0.02,0.05,d+0.02]} c={C.marble} rough={0.14} metal={0.06} />
      <B p={[0,1.72,d/2-0.20]} s={[w,0.58,0.34]} c={C.darkCab} rough={0.45} metal={0.1} />
      {/* シンク */}
      <mesh position={[w*0.2,H+0.04,0]}>
        <boxGeometry args={[0.46,0.06,0.36]} />
        <meshStandardMaterial color={C.steel} roughness={0.12} metalness={0.85} />
      </mesh>
      {/* 蛇口 */}
      <Cyl p={[w*0.2,H+0.22,d/2-0.18]} args={[0.016,0.016,0.30,8]} c={C.chrome} rough={0.05} metal={0.95} />
    </group>
  )
}

// 冷蔵庫
function Refrigerator({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.90,0]} s={[0.62,1.80,0.68]} c={'#DDDBD5'} rough={0.28} metal={0.18} />
      <B p={[0,0.60,0.345]} s={[0.60,0.02,0.01]} c={'#AAAAAA'} rough={0.2} metal={0.3} />
      <Cyl p={[0.26,1.1,0.35]} args={[0.013,0.013,0.38,8]} c={C.chrome} rough={0.05} metal={0.95} />
    </group>
  )
}

// エリアラグ
function Rug({ p=[0,0,0], size=[2.4,1.8], color=C.rug }) {
  return (
    <mesh position={[p[0],0.007,p[2]]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={size} />
      <meshToonMaterial color={color} gradientMap={getToonGradientMap()} />
    </mesh>
  )
}

// ベッド
function Bed({ p=[0,0,0], rot=0, bw=1.4, color=C.bedWhite, headColor=C.walnut }) {
  const BD=2.0, FH=0.22, MH=0.20, HH=0.55
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,FH/2,0]} s={[bw+0.08,FH,BD+0.08]} c={headColor} rough={0.6} />
      <B p={[0,FH+MH/2,0]} s={[bw,MH,BD]} c={C.white} rough={0.9} />
      <B p={[0,FH+MH+0.07,BD*0.08]} s={[bw-0.04,0.12,BD*0.70]} c={color} rough={0.88} />
      <B p={[0,FH+HH/2,-BD/2-0.04]} s={[bw+0.08,HH,0.10]} c={headColor} rough={0.58} />
      {[-bw/4,bw/4].map((x,i)=>(
        <B key={i} p={[x,FH+MH+0.08,-BD/2+0.28]} s={[bw/2-0.06,0.07,0.46]} c={'#FAFAF8'} rough={0.9} />
      ))}
    </group>
  )
}

// ワードローブ
function Wardrobe({ p=[0,0,0], rot=0, w=1.6 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,1.08,0]} s={[w,2.16,0.56]} c={'#E8E2D8'} rough={0.7} />
      {[-w/4,w/4].map((x,i)=>(
        <B key={i} p={[x,1.08,0.285]} s={[0.018,2.10,0.01]} c={'#C0BAB0'} rough={0.5} sh={false} />
      ))}
      {[-w/4+0.10,w/4-0.10].map((x,i)=>(
        <Cyl key={i} p={[x,1.08,0.29]} args={[0.011,0.011,0.12,8]} c={C.chrome} rough={0.06} metal={0.95} />
      ))}
    </group>
  )
}

// サイドテーブル
function SideTable({ p=[0,0,0] }) {
  return (
    <group position={p}>
      <Cyl p={[0,0.52,0]} args={[0.22,0.22,0.03,20]} c={C.oakLight} rough={0.65} />
      <Cyl p={[0,0.26,0]} args={[0.022,0.022,0.50,8]} c={C.walnut} rough={0.6} />
    </group>
  )
}

// トイレ設備 (便器)
function Desk({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.73,0]} s={[0.90,0.03,0.50]} c={C.oakLight} rough={0.65} />
      {[[-0.42,0.36],[0.42,0.36],[-0.42,-0.21],[0.42,-0.21]].map(([x,z],i)=>(
        <B key={i} p={[x,0.36,z]} s={[0.04,0.72,0.04]} c={C.walnut} rough={0.6} />
      ))}
    </group>
  )
}

// ── H型配置 ───────────────────────────────────────────────────────────────────
// LDK: x[-0.885,+2.925] z[-3.535,+0.955]
// 洋室: x[-0.885,+2.925] z[+0.955,+3.535]
function HTypeFurniture() {
  return (
    <>
      {/* LDK・洋室のベッド類は InteriorPlanFurniture.jsx が担当。ここは固定設備のみ。 */}
      <Refrigerator p={[-0.60, 0, -2.90]} rot={0} />
      <Wardrobe p={[+2.72, 0, +2.90]} rot={-Math.PI/2} w={1.40} />
    </>
  )
}

export default function ApartmentFurniture({ planType }) {
  if (planType === 'H') return <HTypeFurniture />
  return null
}

// ApartmentFurniture.jsx
// インテリアコーディネート: モダンジャパニーズスタイル (参考画像1準拠)
// 全座標はアパート中心原点のワールド座標 (m)

import * as THREE from 'three'

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
function B({ p=[0,0,0], r=0, s, c, rough=0.7, metal=0, sh=true }) {
  return (
    <mesh position={p} rotation={[0,r,0]} castShadow={sh} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
    </mesh>
  )
}
function Cyl({ p=[0,0,0], r=0, args, c, rough=0.7, metal=0 }) {
  return (
    <mesh position={p} rotation={[0,r,0]} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} />
    </mesh>
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
          <meshStandardMaterial color={C.walnut} roughness={0.6} />
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
        <meshStandardMaterial color="#F8F4EE" roughness={0.85} side={THREE.DoubleSide} />
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
          <meshStandardMaterial color={C.green} roughness={0.9} />
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
      <meshStandardMaterial color={color} roughness={0.98} />
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
function ToiletFixture({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.19,0]} s={[0.38,0.38,0.46]} c={'#FFFFFF'} rough={0.25} />
      <B p={[0,0.46,-0.15]} s={[0.34,0.20,0.14]} c={'#F4F4F4'} rough={0.2} />
    </group>
  )
}

// シューズボックス (玄関収納)
function ShoeCabinet({ p=[0,0,0], rot=0, w=0.6 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.52,0]} s={[w,1.05,0.28]} c={'#E8E2D8'} rough={0.65} />
      {[0.20,0.60,0.90].map((y,i)=>(
        <B key={i} p={[0,y,0.145]} s={[w-0.04,0.01,0.01]} c={'#C0BAB0'} rough={0.5} sh={false} />
      ))}
    </group>
  )
}

// CL (built-in壁面収納・浅型)
function BuiltinCloset({ p=[0,0,0], rot=0, w=0.6, h=2.0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,h/2,0]} s={[w,h,0.25]} c={'#EDE8DE'} rough={0.7} />
      <Cyl p={[w/2-0.06,h/2,0.14]} args={[0.010,0.010,0.10,8]} c={C.chrome} rough={0.1} metal={0.9} />
    </group>
  )
}

// 可動棚収納 (棚板が見える収納)
function ShelfStorage({ p=[0,0,0], rot=0, w=0.6, h=2.0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,h/2,0]} s={[w,h,0.30]} c={'#E4DED2'} rough={0.75} />
      {[0.35,0.75,1.15,1.55].map((y,i)=>(
        <B key={i} p={[0,y,0.02]} s={[w-0.04,0.02,0.26]} c={'#D0C8B8'} rough={0.6} sh={false} />
      ))}
    </group>
  )
}

// 洗濯機置場
function WashingMachine({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,0.42,0]} s={[0.62,0.84,0.62]} c={'#F2F2F0'} rough={0.35} metal={0.1} />
      <mesh position={[0,0.40,0.32]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.20,0.20,0.02,20]} />
        <meshStandardMaterial color={'#C8CCD0'} roughness={0.15} metalness={0.3} />
      </mesh>
    </group>
  )
}

// PS (パイプスペース)
function PipeShaft({ p=[0,0,0], h=2.2 }) {
  return <B p={[p[0],h/2,p[2]]} s={[0.30,h,0.30]} c={'#B8B4AC'} rough={0.85} />
}

// MB (メーターボックス・外部設置)
function MeterBox({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <B p={[0,1.40,0]} s={[0.32,0.40,0.10]} c={'#D8D4CC'} rough={0.5} metal={0.15} />
      <B p={[0,1.40,0.06]} s={[0.28,0.36,0.01]} c={'#B0ACA4'} rough={0.4} metal={0.3} sh={false} />
    </group>
  )
}

// SK (屋外小型シンク)
function UtilitySink({ p=[0,0,0], rot=0 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      <Cyl p={[0,0.36,0]} args={[0.03,0.04,0.72,10]} c={'#909090'} rough={0.4} metal={0.5} />
      <mesh position={[0,0.78,0]} castShadow>
        <boxGeometry args={[0.42,0.16,0.34]} />
        <meshStandardMaterial color={'#E8E8E4'} roughness={0.3} metalness={0.05} />
      </mesh>
      <Cyl p={[0,0.98,-0.10]} args={[0.014,0.014,0.24,8]} c={C.chrome} rough={0.05} metal={0.95} />
    </group>
  )
}

// 備蓄倉庫内の棚
function StorageShelfUnit({ p=[0,0,0], rot=0, w=0.85 }) {
  return (
    <group position={p} rotation={[0,rot,0]}>
      {[0.30,0.65,1.00,1.35,1.70].map((y,i)=>(
        <B key={i} p={[0,y,0]} s={[w,0.03,0.55]} c={'#C8BEA8'} rough={0.7} />
      ))}
      {[-w/2+0.03,w/2-0.03].map((x,i)=>(
        <B key={i} p={[x,0.90,0]} s={[0.05,1.80,0.55]} c={'#B0A488'} rough={0.7} />
      ))}
    </group>
  )
}

// ポーチの装飾ピラー
function PorchPillar({ p=[0,0,0], h=2.0 }) {
  return <Cyl p={[p[0],h/2,p[2]]} args={[0.06,0.07,h,10]} c={'#D8D2C4'} rough={0.6} />
}

// デスク
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

// ── I型配置 (間取り図実測値に修正済み) ──────────────────────────────────────
// LD:  x[-3.68,+1.28]  z[+0.88,+4.72]
// K:   x[-3.68,-0.80]  z[-1.16,+0.88]
// BR1: x[-3.68,-0.80]  z[-4.72,-1.16]
// BR2: x[+1.28,+3.68]  z[-4.72,-1.64]  ★修正: 旧z_south=-2.32→-1.64
// BathZone: x[+1.28,+3.68] z[-1.64,+0.04]
// BR3: x[+1.28,+3.68]  z[+0.04,+4.72]  ★修正: 旧z_north=+0.84→+0.04
function ITypeFurniture() {
  return (
    <>
      {/* ════ LDリビングゾーン (南側 z≈+2.0→+4.66) ════ */}
      <Rug  p={[-1.40, 0, +3.50]} size={[2.5,1.85]} color={C.rug} />
      {/* ソファ: 西壁(x=-3.68)沿い, 東向き  back=x-3.62, center x=-3.17 */}
      <Sofa p={[-3.17, 0, +3.50]} rot={Math.PI/2} />
      {/* コーヒーテーブル */}
      <CoffeeTable p={[-1.60, 0, +3.50]} />
      {/* TVユニット: LD東端(x≈+1.28), スクリーン西向き */}
      <TVUnit p={[+0.90, 0, +3.50]} rot={-Math.PI/2} />
      {/* フロアランプ: LD南西角 */}
      <FloorLamp p={[-3.35, 0, +4.30]} />
      {/* 観葉植物: LD南東角 */}
      <Plant p={[+0.70, 0, +4.30]} h={1.3} />

      {/* ════ LDダイニングゾーン (北側 z≈+0.88→+2.2) ════ */}
      <DiningTable p={[-1.80, 0, +1.65]} />
      <DiningChair p={[-1.80, 0, +1.10]} rot={Math.PI} />
      <DiningChair p={[-1.80, 0, +2.22]} rot={0} />
      <DiningChair p={[-2.48, 0, +1.65]} rot={Math.PI/2} />
      <DiningChair p={[-1.12, 0, +1.65]} rot={-Math.PI/2} />

      {/* ════ キッチン x[-3.68,-0.80] z[-1.16,+0.88] ════ */}
      <KitchenCounter p={[-2.23, 0, -0.83]} rot={0} w={2.0} d={0.58} />
      <Refrigerator p={[-3.31, 0, -0.44]} rot={0} />

      {/* ════ 洋室① (6.1帖) x[-3.68,-0.80] z[-4.72,-1.16] ════ */}
      <Bed  p={[-2.23, 0, -3.60]} rot={0} bw={1.40} color={C.cream} headColor={C.walnut} />
      <Wardrobe p={[-1.14, 0, -3.00]} rot={-Math.PI/2} w={1.60} />
      <SideTable p={[-3.35, 0, -3.60]} />

      {/* ════ 洋室② (4.3帖) x[+1.28,+3.68] z[-4.72,-1.64] ════ */}
      <Bed  p={[+2.48, 0, -3.60]} rot={0} bw={1.05} color={C.blue} headColor={'#2A3040'} />
      <Desk p={[+3.29, 0, -2.30]} rot={-Math.PI/2} />

      {/* ════ 洋室③ (6.7帖) x[+1.28,+3.68] z[+0.04,+4.72] ════ */}
      <Bed  p={[+2.48, 0, +1.10]} rot={0} bw={1.40} color={C.bedWhite} headColor={'#2E1A0A'} />
      <Wardrobe p={[+3.26, 0, +3.50]} rot={-Math.PI/2} w={1.60} />
      <SideTable p={[+1.68, 0, +1.10]} />

      {/* ════ トイレ x[+0.48,+1.28] z[-2.15,-1.30] ════ */}
      <ToiletFixture p={[0.88, 0, -1.42]} rot={0} />

      {/* ════ 玄関 (シューズボックス・東壁沿い) ════ */}
      <ShoeCabinet p={[1.13, 0, -4.30]} rot={Math.PI/2} w={0.6} />

      {/* ════ 洋室② CL (北壁沿い) ════ */}
      <BuiltinCloset p={[3.35, 0, -4.535]} rot={0} w={0.7} h={2.2} />

      {/* ════ 廊下: 可動棚収納・CL×2 (東壁=浴室ゾーン側に沿って) ════ */}
      <ShelfStorage    p={[1.12, 0, 0.00]} rot={Math.PI/2} w={0.6} h={2.0} />
      <BuiltinCloset   p={[1.12, 0, 0.40]} rot={Math.PI/2} w={0.6} h={2.0} />
      <BuiltinCloset   p={[1.12, 0, 0.80]} rot={Math.PI/2} w={0.6} h={2.0} />

      {/* ════ 廊下: 洗濯機置場・PS ════ */}
      <WashingMachine p={[0.20, 0, -0.95]} rot={0} />
      <PipeShaft      p={[0.85, 0, -0.60]} h={2.2} />

      {/* ════ 備蓄倉庫 x[+2.68,+3.68] z[-5.52,-4.72] ════ */}
      <StorageShelfUnit p={[3.18, 0, -5.19]} rot={0} w={0.85} />

      {/* ════ ポーチ (装飾ピラー) ════ */}
      <PorchPillar p={[-0.20, 0, -5.55]} h={2.0} />
      <PorchPillar p={[+0.68, 0, -5.55]} h={2.0} />

      {/* ════ MB (メーターボックス・外部) / SK (屋外シンク) ════ */}
      <MeterBox    p={[3.75, 0, -4.90]} rot={0} />
      <UtilitySink p={[3.35, 0, 5.65]}  rot={0} />
    </>
  )
}

// ── H型配置 ───────────────────────────────────────────────────────────────────
// LDK: x[-0.885,+2.925] z[-3.535,+0.955]
// 洋室: x[-0.885,+2.925] z[+0.955,+3.535]
function HTypeFurniture() {
  return (
    <>
      <Rug p={[+0.60, 0, -1.80]} size={[2.2,1.6]} color={C.rug} />
      <Sofa p={[+0.20, 0, -2.10]} rot={0} />
      <CoffeeTable p={[+0.20, 0, -1.20]} />
      <TVUnit p={[+0.20, 0, -3.30]} rot={Math.PI} />
      <DiningTable p={[+1.60, 0, -0.60]} />
      <DiningChair p={[+1.60, 0, +0.06]} rot={Math.PI} />
      <DiningChair p={[+1.60, 0, -1.26]} rot={0} />
      <DiningChair p={[+0.92, 0, -0.60]} rot={Math.PI/2} />
      <DiningChair p={[+2.28, 0, -0.60]} rot={-Math.PI/2} />
      <KitchenCounter p={[+1.00, 0, -3.25]} rot={0} w={3.00} d={0.56} />
      <Refrigerator p={[-0.60, 0, -2.90]} rot={0} />
      <Plant p={[+2.70, 0, -2.90]} h={1.1} />
      {/* 洋室 */}
      <Bed p={[+1.02, 0, +2.00]} rot={0} bw={1.40} color={C.cream} />
      <Wardrobe p={[+2.72, 0, +2.90]} rot={-Math.PI/2} w={1.40} />
      <SideTable p={[+0.28, 0, +2.00]} />
    </>
  )
}

export default function ApartmentFurniture({ planType }) {
  if (planType === 'I') return <ITypeFurniture />
  if (planType === 'H') return <HTypeFurniture />
  return null
}

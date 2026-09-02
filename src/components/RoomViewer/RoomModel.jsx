// RoomModel.jsx — 部屋の外殻（壁・床・天井・窓・巾木）
// RoomViewer.jsx の Room() をそのまま移動。
// useRoomGLB を統合し、将来 GLB ルームシェルが用意され次第、透過的に切り替わる
// （現状 ROOM_MODELS が空のため isGLB は常に false = 現行と完全に同じ見た目）。

import { useMemo } from 'react'
import * as THREE from 'three'
import { getRoomSize } from '../../data/roomSizes'
import useRoomGLB from '../../hooks/useRoomGLB'
import Lighting from './Lighting'

// ── Procedural floor texture ──────────────────────────────────────────────────
function makeFloorTexture(floorType, hexColor) {
  // '#RRGGBB' 形式のみ処理、それ以外は単色テクスチャで返す
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
    // Wood planks with grain lines
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

export default function RoomModel({ config, roomId, planType, lighting }) {
  const [rw, rh, rd] = getRoomSize(roomId, planType)
  const hw = rw / 2, hd = rd / 2
  const floorRoughness = { tile: 0.15, carpet: 0.95, wood: 0.55 }[config.floorType] ?? 0.55
  const floorTex = useMemo(() => makeFloorTexture(config.floorType, config.floorColor), [config.floorType, config.floorColor])
  // Iタイプ LD: キッチン連続空間モード（x=-1.82 に仕切りカウンター）
  const isILiving = roomId === 'living' && planType === 'I'
  const kitchenSepX = -1.82
  const isLiving = roomId === 'living'

  // Phase2準備: GLBルームシェルが用意されればここで自動的に切り替わる
  const { model: glbModel, isGLB } = useRoomGLB(roomId, planType)

  if (isGLB && glbModel) {
    return (
      <>
        <Lighting lighting={lighting} rw={rw} rh={rh} rd={rd} hw={hw} hd={hd} isLiving={isLiving} isILiving={isILiving} />
        <primitive object={glbModel} />
      </>
    )
  }

  return (
    <>
      <Lighting lighting={lighting} rw={rw} rh={rh} rd={rd} hw={hw} hd={hd} isLiving={isLiving} isILiving={isILiving} />

      {/* Floor with procedural texture */}
      <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[rw, rd]} />
        <meshStandardMaterial
          map={floorTex}
          roughness={floorRoughness}
          metalness={config.floorType === 'tile' ? 0.06 : 0}
        />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, rh, 0]}>
        <planeGeometry args={[rw, rd]} />
        <meshStandardMaterial color={config.ceilingColor} roughness={0.92} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, rh/2, -hd]}>
        <planeGeometry args={[rw, rh]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.88} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-hw, rh/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[rd, rh]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.88} />
      </mesh>
      {/* Right wall */}
      <mesh position={[hw, rh/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[rd, rh]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.88} />
      </mesh>

      {/* Window on right wall — フレーム+ガラス、正しい向きに修正 */}
      <group position={[hw - 0.01, rh * 0.54, 0.3]}>
        {/* フレーム */}
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.72, 1.28]} />
          <meshStandardMaterial color="#F2EDE6" roughness={0.65} />
        </mesh>
        {/* ガラス */}
        <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.52, 1.08]} />
          <meshStandardMaterial
            color="#C8E8FA"
            transparent opacity={0.22}
            roughness={0.02} metalness={0.08}
            emissive="#ECF8FF" emissiveIntensity={0.2}
          />
        </mesh>
        {/* 縦桟 */}
        <mesh position={[-0.015, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.04, 1.08]} />
          <meshStandardMaterial color="#E8E2D8" roughness={0.6} />
        </mesh>
        {/* 横桟 */}
        <mesh position={[-0.014, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.52, 0.04]} />
          <meshStandardMaterial color="#E8E2D8" roughness={0.6} />
        </mesh>
      </group>
      {/* Iタイプ LD: 採光窓（後壁） */}
      {isILiving && (
        <group position={[1.2, rh * 0.57, -hd + 0.01]}>
          {/* フレーム */}
          <mesh>
            <planeGeometry args={[1.72, 1.28]} />
            <meshStandardMaterial color="#F2EDE6" roughness={0.65} />
          </mesh>
          {/* ガラス */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.52, 1.08]} />
            <meshStandardMaterial
              color="#C8E8FA"
              transparent opacity={0.22}
              roughness={0.02} metalness={0.08}
              emissive="#ECF8FF" emissiveIntensity={0.18}
            />
          </mesh>
        </group>
      )}

      {/* Iタイプ LD+K 仕切りカウンター（x = kitchenSepX、手前側は開放） */}
      {isILiving && (
        <group position={[kitchenSepX, 0, 0]}>
          {/* カウンター本体（奥側 3.6m 分） */}
          <mesh position={[0, 0.45, -hd*0.62]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.9, hd * 1.24]} />
            <meshStandardMaterial color={config.wallColor} roughness={0.6} />
          </mesh>
          {/* カウンタートップ（大理石調） */}
          <mesh position={[0, 0.93, -hd*0.62]}>
            <boxGeometry args={[0.18, 0.045, hd * 1.24 + 0.04]} />
            <meshStandardMaterial color="#D4CEC8" roughness={0.15} metalness={0.12} />
          </mesh>
        </group>
      )}

      {/* Baseboards */}
      {[[-hw+0.03, [0.06,0.1,rd]], [hw-0.03, [0.06,0.1,rd]], [0, [rw,0.1,0.06]]].map(([x, size], i) => (
        <mesh key={i} position={[x, 0.05, 0]} castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#F8F5F0" roughness={0.5} />
        </mesh>
      ))}
      {/* Crown molding */}
      {[[-hw+0.04, [0.06,0.1,rd]], [hw-0.04, [0.06,0.1,rd]], [0, [rw,0.1,0.06]]].map(([x, size], i) => (
        <mesh key={`c${i}`} position={[x, rh-0.06, 0]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color="#F8F5F0" roughness={0.5} />
        </mesh>
      ))}
    </>
  )
}

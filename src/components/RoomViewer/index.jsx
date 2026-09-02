// RoomViewer/index.jsx — 3Dルームビューア エントリーポイント
// 構成: Canvas > RoomModel（部屋の外殻+照明） / FurnitureLayer（家具+設計ルール検証） / CameraRig（視点操作）

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { getRoomSize } from '../../data/roomSizes'
import { LIGHTING_OPTIONS } from '../../data/roomData'
import RoomModel from './RoomModel'
import FurnitureLayer from './FurnitureLayer'
import CameraRig from './CameraRig'

export default function RoomViewer({ config, roomId, planType, furnitureTemplate, onValidate }) {
  const [rw, rh, rd] = getRoomSize(roomId, planType)
  const isBedroom = roomId.startsWith('bedroom')
  const isBath    = roomId === 'bathroom'
  const camDist = Math.max(rw, rd) * (isBedroom || isBath ? 0.62 : 0.7)
  const camY = isBedroom ? rh * 0.44 : rh * 0.52
  const lighting  = LIGHTING_OPTIONS.find(l => l.id === config.lighting) || LIGHTING_OPTIONS[1]
  const skyColor  = lighting.skyColor || '#87CEEB'
  // 夜は室内の明るさを少し上げてラウンジ感を演出
  const exposure  = lighting.id === 'night' ? 1.4 : 1.1

  return (
    <Canvas
      shadows
      camera={{ position: [camDist * 0.88, camY, camDist * 0.88], fov: 52 }}
      gl={{ antialias: true, alpha: false, toneMapping: 4, toneMappingExposure: exposure }}
      style={{ background: skyColor }}
    >
      <Suspense fallback={null}>
        <RoomModel config={config} roomId={roomId} planType={planType} lighting={lighting} />
        <FurnitureLayer roomId={roomId} planType={planType} style={config.style} template={furnitureTemplate} onValidate={onValidate} />
        <CameraRig roomId={roomId} planType={planType} />
      </Suspense>
    </Canvas>
  )
}

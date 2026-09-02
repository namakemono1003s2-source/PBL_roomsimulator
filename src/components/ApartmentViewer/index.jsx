import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import ApartmentShell from './ApartmentShell'
import ApartmentFurniture from './ApartmentFurniture'
import { LAYOUTS } from '../../data/apartmentLayout'

export default function ApartmentViewer({ planType, furnitureTemplate }) {
  const rooms        = useStore(s => s.rooms)
  const selectedRoom = useStore(s => s.selectedRoom)
  const setSelectedRoom = useStore(s => s.setSelectedRoom)

  const layout = LAYOUTS[planType]
  if (!layout) return null

  const fp = layout.footprint
  const span = Math.max(fp.w, fp.d)
  // アイソメトリック気味の俯瞰カメラ (SE方向から)
  const cam = [span * 0.62, span * 1.08, span * 0.72]

  return (
    <Canvas
      shadows
      camera={{ position: cam, fov: 46, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: false, toneMapping: 4, toneMappingExposure: 1.05 }}
      style={{ background: '#B8CCD8' }}
    >
      <Suspense fallback={null}>
        {/* 主光源: 太陽光 (北西上方) */}
        <directionalLight
          position={[-6, 16, -8]}
          intensity={1.6}
          color="#FFF8EE"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0004}
        />
        {/* 補助光: 東から柔らか */}
        <directionalLight position={[10, 8, 6]} intensity={0.45} color="#FFE8C8" />
        {/* アンビエント */}
        <ambientLight intensity={0.5} color="#E8F0F8" />

        <ApartmentShell
          planType={planType}
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
        />

        <ApartmentFurniture planType={planType} />

        <ContactShadows
          position={[0, 0.004, 0]}
          opacity={0.38}
          scale={26}
          blur={3.5}
          far={4}
          frames={1}
        />

        <OrbitControls
          makeDefault
          target={[0, 0.9, 0]}
          minDistance={3}
          maxDistance={38}
          maxPolarAngle={Math.PI * 0.465}
          enablePan
          panSpeed={0.8}
        />
      </Suspense>
    </Canvas>
  )
}

import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import ApartmentShell from './ApartmentShell'
import ApartmentFurniture from './ApartmentFurniture'
import { LAYOUTS } from '../../data/apartmentLayout'
import { LIGHTING_OPTIONS } from '../../data/roomData'
import InteriorPlanFurniture from './InteriorPlanFurniture'

// 部屋タブを切り替えると、カメラがその部屋へ寄っていく（420ms・イージング）。
// 移動の軌跡そのものが部屋どうしの位置関係を伝えるため、瞬間移動はさせない。
const CAMERA_TRANSITION_SEC = 0.42
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

function AnimatedCameraRig({ planType, selectedRoom }) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const mounted = useRef(false)
  const progress = useRef(1) // 1 = アニメーション完了（待機中）
  const fromPos  = useRef(new THREE.Vector3())
  const fromLook = useRef(new THREE.Vector3())
  const toPos    = useRef(new THREE.Vector3())
  const toLook   = useRef(new THREE.Vector3())

  useEffect(() => {
    const layout = LAYOUTS[planType]
    const room = layout?.rooms.find(r => r.id === selectedRoom)
    if (!room) return

    // 初回マウント時は、既存の全体俯瞰カメラ位置のままにする（いきなり1部屋へ寄らない）
    if (!mounted.current) { mounted.current = true; return }
    if (!controlsRef.current) return

    // room.w / room.d / room.h は apartmentLayout.js の同じワールド座標系(メートル)で
    // 定義済みのため、ここでそのまま使う（roomSizes.js は別のローカル座標系なので使わない）。
    // 天井のない「開放型ドールハウス」構造なので、壁の高さ(最大2.8m)より十分高い位置から、
    // かつ水平方向のオフセットはその部屋自身の半径以内に収めることで、
    // 隣室の壁を突き抜けたアングルにならないようにする。
    // トイレのような極小の部屋では、実寸そのままだと壁に近づきすぎるため下限を設ける
    const effW = Math.max(room.w, 1.8), effD = Math.max(room.d, 1.8)
    const halfW = effW / 2, halfD = effD / 2
    // キッチンのような細長い部屋でも設備全体が見えるよう、少し引き気味にする
    const height = Math.max(effW, effD) * 0.95 + 1.3

    fromPos.current.copy(camera.position)
    fromLook.current.copy(controlsRef.current.target)
    toLook.current.set(room.x, room.h * 0.3, room.z)
    toPos.current.set(room.x + halfW * 0.85, height, room.z + halfD * 0.85)
    progress.current = 0
  }, [selectedRoom, planType, camera])

  useFrame((_, delta) => {
    if (progress.current >= 1 || !controlsRef.current) return
    progress.current = Math.min(1, progress.current + delta / CAMERA_TRANSITION_SEC)
    const e = easeOutCubic(progress.current)
    camera.position.lerpVectors(fromPos.current, toPos.current, e)
    controlsRef.current.target.lerpVectors(fromLook.current, toLook.current, e)
    controlsRef.current.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 0.9, 0]}
      minDistance={1.4}
      maxDistance={38}
      maxPolarAngle={Math.PI * 0.465}
      enablePan
      panSpeed={0.8}
      enableDamping
      dampingFactor={0.08}
    />
  )
}

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

  // 選択中の部屋の「光の入り方」(朝/昼/夕/夜)を、実際のライティングへ反映する。
  // これまでこの値はラベル表示にのみ使われ、3D側の見た目には一切反映されていなかった。
  const lightingId = rooms[selectedRoom]?.lighting || 'warm'
  const lighting = LIGHTING_OPTIONS.find(l => l.id === lightingId) || LIGHTING_OPTIONS[2]

  return (
    <Canvas
      shadows
      camera={{ position: cam, fov: 46, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: false, toneMapping: 4, toneMappingExposure: 1.05 }}
      style={{ background: lighting.skyColor, transition: 'background 0.6s ease' }}
    >
      <color attach="background" args={[lighting.skyColor]} />
      <Suspense fallback={null}>
        {/* 主光源: 太陽光（北西上方）— 色・強さを「光の入り方」の設定に合わせる */}
        <directionalLight
          position={[-6, 16, -8]}
          intensity={lighting.sunIntensity * 0.6}
          color={lighting.sunColor}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0004}
        />
        {/* 補助光: 東から柔らか */}
        <directionalLight position={[10, 8, 6]} intensity={lighting.sunIntensity * 0.16} color={lighting.sunColor} />
        {/* アンビエント */}
        <ambientLight intensity={lighting.intensity * 0.4} color={lighting.color} />

        <ApartmentShell
          planType={planType}
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
        />

        <ApartmentFurniture planType={planType} />
        <InteriorPlanFurniture planType={planType} furnitureTemplate={furnitureTemplate} rooms={rooms} />

        <ContactShadows
          position={[0, 0.004, 0]}
          opacity={0.38}
          scale={26}
          blur={3.5}
          far={4}
          frames={1}
        />

        <AnimatedCameraRig planType={planType} selectedRoom={selectedRoom} />
      </Suspense>
    </Canvas>
  )
}

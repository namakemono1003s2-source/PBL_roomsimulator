// CameraRig.jsx — OrbitControls
// RoomViewer.jsx からそのまま移動。ロジック変更なし。

import { OrbitControls } from '@react-three/drei'
import { getRoomSize } from '../../data/roomSizes'

export default function CameraRig({ roomId, planType }) {
  const [rw, rh, rd] = getRoomSize(roomId, planType)
  const isBedroom = roomId.startsWith('bedroom')
  const isBath    = roomId === 'bathroom'
  const dist = Math.max(rw, rd) * (isBedroom || isBath ? 0.62 : 0.7)
  // 寝室はベッド全体が見えるよう少し低めに注視
  const targetY = isBedroom ? rh * 0.3 : rh * 0.36
  return (
    <OrbitControls
      target={[0, targetY, 0]}
      minDistance={dist * 0.42} maxDistance={dist * 1.55}
      minPolarAngle={Math.PI / 12} maxPolarAngle={Math.PI / 2.05}
      enablePan={false} dampingFactor={0.07} enableDamping
    />
  )
}

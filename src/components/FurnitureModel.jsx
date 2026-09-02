// FurnitureModel.jsx
// 新しいインテリアプランデータ形式 { position:{x,y,z}, rotation:{y°}, scale, material }
// に対応したスマートコンポーネント。
//   ・modelUrl あり → useGLTF で GLB ロード
//   ・modelUrl なし → PrimitiveComponent（MESH_MAP から渡される）をフォールバック

import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

// ── GLB ローダー ─────────────────────────────────────────────────────────────
function GLBLoader({ url, position, rotation, scale }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(n => {
      if (n.isMesh) { n.castShadow = true; n.receiveShadow = true }
    })
    return c
  }, [scene])
  const s = scale ?? 1
  return (
    <primitive
      object={obj}
      position={[position.x, position.y ?? 0, position.z]}
      rotation={[0, ((rotation?.y ?? 0) * Math.PI) / 180, 0]}
      scale={Array.isArray(s) ? s : [s, s, s]}
    />
  )
}

// ── アダプター：新形式 → 既存プリミティブ用 props ────────────────────────────
function posArr(position)  { return [position.x, position.y ?? 0, position.z] }
function rotRad(rotation)  { return ((rotation?.y ?? 0) * Math.PI) / 180 }

// ── メインコンポーネント ──────────────────────────────────────────────────────
// piece:              新インテリアプラン形式の家具オブジェクト
// PrimitiveComponent: MESH_MAP[piece.category]（RoomViewer から渡す）
export default function FurnitureModel({ piece, PrimitiveComponent }) {
  if (piece.modelUrl) {
    return (
      <Suspense fallback={null}>
        <GLBLoader
          url={piece.modelUrl}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
        />
      </Suspense>
    )
  }

  if (PrimitiveComponent) {
    return (
      <PrimitiveComponent
        pos={posArr(piece.position)}
        rot={rotRad(piece.rotation)}
        color={piece.material?.color  ?? '#888888'}
        accent={piece.material?.accent ?? '#666666'}
      />
    )
  }

  return null
}

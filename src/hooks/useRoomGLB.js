// useRoomGLB — 部屋GLBモデルロードフック（Phase2準備スタブ）
//
// Phase2でRevit/ArchiCAD/SketchUpからエクスポートしたGLBを
// public/models/rooms/ に配置し、ROOM_MODELS マップを埋めると
// 自動的に GLB ルームが使われるようになる。
//
// 現在: 常に { model: null, isGLB: false } を返す（プロシージャルRoom使用）

import { useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

// GLBファイルのパスマップ（Phase2でURLを追加する）
const ROOM_MODELS = {
  // 'living-I':   '/models/rooms/living-i-type.glb',
  // 'living-H':   '/models/rooms/living-h-type.glb',
  // 'bedroom-I':  '/models/rooms/bedroom-i-type.glb',
  // 'bedroom-H':  '/models/rooms/bedroom-h-type.glb',
  // 'kitchen-I':  '/models/rooms/kitchen-i-type.glb',
  // 'bathroom':   '/models/rooms/bathroom.glb',
}

function getRoomModelKey(roomId, planType) {
  if (roomId === 'bathroom') return 'bathroom'
  return `${roomId}-${planType}`
}

export default function useRoomGLB(roomId, planType) {
  const key = getRoomModelKey(roomId, planType)
  const modelUrl = ROOM_MODELS[key] || null

  // GLBがない場合は即座にfalse/nullを返す
  if (!modelUrl) {
    return { model: null, isGLB: false, isLoading: false }
  }

  // GLBが設定されている場合はuseGLTFでロード
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { scene } = useGLTF(modelUrl)
  return { model: scene, isGLB: true, isLoading: false }
}

// Phase2: GLBファイルをプリロード（パフォーマンス最適化用）
export function preloadRoomModels() {
  Object.values(ROOM_MODELS).forEach(url => {
    if (url) useGLTF.preload(url)
  })
}

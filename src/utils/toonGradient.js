// toonGradient.js — セルシェーディング（アニメ調）用のグラデーションマップ
// meshToonMaterial の gradientMap に渡す小さなテクスチャを1つだけ生成し使い回す。
import * as THREE from 'three'

let _gradientTex = null

export function getToonGradientMap() {
  if (_gradientTex) return _gradientTex

  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  // 4段階の明暗バンド（暗部→ハイライト）
  const shades = ['#4a4a52', '#9a9aa2', '#cfcfd6', '#ffffff']
  shades.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i, 0, 1, 1) })

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  _gradientTex = tex
  return tex
}

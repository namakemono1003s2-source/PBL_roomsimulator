// designRules.js — 住宅設計ルール検証ユーティリティ
// 家具配置テンプレート作成時・実行時に利用する。

import { ROOM_SIZE as ROOM_SIZES } from '../data/roomSizes'

const MIN_CLEARANCE_M   = 0.6   // 通路幅 600mm
const WARN_CLEARANCE_M  = 0.75  // 750mm 以下は警告
const WALL_MARGIN_M     = 0.05  // 壁から最低 50mm

// ── AABB (Axis-Aligned Bounding Box) ─────────────────────────────────────────
// size.width/depth は mm 単位、position は m 単位
function getFurnitureAABB(piece) {
  const { position, size, rotation } = piece
  if (!size || !position) return null
  const hw = (size.width  / 1000) / 2
  const hd = (size.depth  / 1000) / 2
  // Y軸回転90°の場合はW/Dを入れ替え（簡易近似）
  const rotY = Math.abs((rotation?.y || 0) % 180)
  const [fw, fd] = rotY === 90 ? [hd, hw] : [hw, hd]
  return {
    minX: position.x - fw,
    maxX: position.x + fw,
    minZ: position.z - fd,
    maxZ: position.z + fd,
    id:   piece.id,
    name: piece.name,
  }
}

// 2つのAABB間の最短距離（重なっている場合は負の値）
function aabbGap(a, b) {
  const gapX = Math.max(a.minX, b.minX) - Math.min(a.maxX, b.maxX)
  const gapZ = Math.max(a.minZ, b.minZ) - Math.min(a.maxZ, b.maxZ)
  if (gapX > 0 && gapZ > 0) return Math.sqrt(gapX ** 2 + gapZ ** 2) // 対角方向
  if (gapX > 0) return gapX
  if (gapZ > 0) return gapZ
  return Math.min(gapX, gapZ) // 負 = 重なり量
}

// ── 通路幅チェック ─────────────────────────────────────────────────────────────
export function validateClearance(furniture) {
  const warnings = []
  const boxes = furniture.map(getFurnitureAABB).filter(Boolean)

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const gap = aabbGap(boxes[i], boxes[j])
      if (gap < MIN_CLEARANCE_M) {
        warnings.push({
          type:     'clearance',
          severity: gap < 0 ? 'error' : 'warning',
          message:  gap < 0
            ? `${boxes[i].name} と ${boxes[j].name} が重なっています`
            : `${boxes[i].name} と ${boxes[j].name} の間隔 ${Math.round(gap * 1000)}mm（推奨≥${MIN_CLEARANCE_M * 1000}mm）`,
          items: [boxes[i].id, boxes[j].id],
        })
      } else if (gap < WARN_CLEARANCE_M) {
        warnings.push({
          type:     'clearance',
          severity: 'info',
          message:  `${boxes[i].name}〜${boxes[j].name}: ${Math.round(gap * 1000)}mm（やや狭め）`,
          items: [boxes[i].id, boxes[j].id],
        })
      }
    }
  }
  return warnings
}

// ── 壁外チェック ───────────────────────────────────────────────────────────────
export function validateRoomBounds(furniture, roomId, planType) {
  const sizeArr = ROOM_SIZES[roomId]?.[planType]
  if (!sizeArr) return []
  const [rw, , rd] = sizeArr
  const hw = rw / 2 - WALL_MARGIN_M
  const hd = rd / 2 - WALL_MARGIN_M
  const warnings = []

  furniture.forEach(piece => {
    const b = getFurnitureAABB(piece)
    if (!b) return
    if (b.minX < -hw || b.maxX > hw || b.minZ < -hd || b.maxZ > hd) {
      warnings.push({
        type:     'bounds',
        severity: 'error',
        message:  `${piece.name} が壁の外に配置されています（要確認）`,
        items: [piece.id],
      })
    }
  })
  return warnings
}

// ── TV-ソファ距離チェック (リビング向け) ─────────────────────────────────────
export function validateTVSofaDistance(furniture) {
  const tv   = furniture.find(p => p.category === 'tvUnit')
  const sofa = furniture.find(p => p.category === 'sofa')
  if (!tv || !sofa) return []

  const dist = Math.abs(sofa.position.z - tv.position.z)
  if (dist < 2.5) {
    return [{ type: 'design', severity: 'warning', message: `TV〜ソファ距離 ${dist.toFixed(1)}m（推奨2.5〜3.5m）`, items: [tv.id, sofa.id] }]
  }
  if (dist > 3.5) {
    return [{ type: 'design', severity: 'info', message: `TV〜ソファ距離 ${dist.toFixed(1)}m（推奨2.5〜3.5m、やや遠め）`, items: [tv.id, sofa.id] }]
  }
  return []
}

// ── 全室一括バリデーション ────────────────────────────────────────────────────
export function validatePlan(planRooms, planType) {
  const results = {}
  Object.entries(planRooms).forEach(([roomId, roomPlan]) => {
    if (!roomPlan?.furniture?.length) return
    const w = [
      ...validateClearance(roomPlan.furniture),
      ...validateRoomBounds(roomPlan.furniture, roomId, planType),
      ...(roomId === 'living' ? validateTVSofaDistance(roomPlan.furniture) : []),
    ]
    if (w.length) results[roomId] = w
  })
  return results
}

// ── コンソールレポート（開発時用）────────────────────────────────────────────
export function reportValidation(planId, planRooms, planType) {
  const results = validatePlan(planRooms, planType)
  const total = Object.values(results).flat().length
  if (total === 0) {
    console.log(`[DesignRules] ✅ ${planId}: 全チェックOK`)
    return
  }
  console.group(`[DesignRules] ${planId}: ${total}件の指摘`)
  Object.entries(results).forEach(([room, warnings]) => {
    console.group(`  ${room}`)
    warnings.forEach(w => {
      const icon = w.severity === 'error' ? '🔴' : w.severity === 'warning' ? '🟡' : '🔵'
      console.log(`  ${icon} ${w.message}`)
    })
    console.groupEnd()
  })
  console.groupEnd()
}

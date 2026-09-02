// wallOpenings.js — 壁スパンからドア・窓の開口部を差し引き、残す矩形セグメントを算出する。
// ApartmentShell.jsx の構造壁と部屋内壁色パネルの両方から共有される純粋関数群。

// [start,end] から ranges を差し引いた残り区間を返す（ソート・マージ・クリップ込み）
function subtractRanges(start, end, ranges, minLen) {
  const clipped = ranges
    .map(([a, b]) => [Math.max(start, a), Math.min(end, b)])
    .filter(([a, b]) => b - a > 0)
    .sort((a, b) => a[0] - b[0])

  const merged = []
  for (const [a, b] of clipped) {
    const last = merged[merged.length - 1]
    if (last && a <= last[1]) last[1] = Math.max(last[1], b)
    else merged.push([a, b])
  }

  const gaps = []
  let cursor = start
  for (const [a, b] of merged) {
    if (a - cursor > minLen) gaps.push([cursor, a])
    cursor = Math.max(cursor, b)
  }
  if (end - cursor > minLen) gaps.push([cursor, end])
  return gaps
}

/**
 * 壁スパンを開口(door/window)で分割し、残す矩形セグメント群を返す。
 * ドアは全高開口（yBottom/yTop省略）、窓はyBottom/yTopを渡すと
 * 腰壁・まぐさのセグメントも自動生成される。
 *
 * @param {number} spanStart
 * @param {number} spanEnd
 * @param {number} wallHeight
 * @param {Array<{alongStart:number, alongEnd:number, yBottom?:number, yTop?:number}>} openings
 * @param {number} [minLen=0.02]
 * @returns {Array<{alongCenter:number, alongLength:number, yBottom:number, yTop:number}>}
 */
export function computeWallSegments(spanStart, spanEnd, wallHeight, openings, minLen = 0.02) {
  const segments = []

  // 開口の左右に残る、全高（床〜天井）のセグメント
  const sideRanges = subtractRanges(
    spanStart, spanEnd,
    openings.map(o => [o.alongStart, o.alongEnd]),
    minLen,
  )
  for (const [a, b] of sideRanges) {
    segments.push({ alongCenter: (a + b) / 2, alongLength: b - a, yBottom: 0, yTop: wallHeight })
  }

  // 各開口の腰壁（下）・まぐさ（上）セグメント（窓のみ発生。ドアは全高なので発生しない）
  for (const o of openings) {
    const a = Math.max(spanStart, o.alongStart)
    const b = Math.min(spanEnd, o.alongEnd)
    if (b - a <= minLen) continue
    const yBottom = o.yBottom ?? 0
    const yTop = o.yTop ?? wallHeight
    const center = (a + b) / 2
    const length = b - a
    if (yBottom > minLen) {
      segments.push({ alongCenter: center, alongLength: length, yBottom: 0, yTop: yBottom })
    }
    if (yTop < wallHeight - minLen) {
      segments.push({ alongCenter: center, alongLength: length, yBottom: yTop, yTop: wallHeight })
    }
  }

  return segments
}

// 窓の上下端（床からの高さ）を計算する。WindowPane の位置計算と同一のロジック。
export function windowVerticalExtent(win) {
  const centerY = win.h < 2.0 ? 1.0 + win.h / 2 : win.h / 2 + 0.05
  return { bottom: centerY - win.h / 2, top: centerY + win.h / 2 }
}

// 構造壁エントリ [cx,cz,w,d,h] に該当する窓を抽出する（face + 位置で判定）
export function windowsForStructuralWall(cx, cz, w, d, windows, eps = 0.1) {
  const lengthAxisIsX = w >= d
  const face = lengthAxisIsX ? 'z' : 'x'
  const thickness = lengthAxisIsX ? cz : cx
  const spanCenter = lengthAxisIsX ? cx : cz
  const half = (lengthAxisIsX ? w : d) / 2
  return windows.filter(win => {
    if (win.face !== face) return false
    const winThickness = lengthAxisIsX ? win.cz : win.cx
    if (Math.abs(winThickness - thickness) > eps) return false
    const along = lengthAxisIsX ? win.cx : win.cz
    return along + win.w / 2 > spanCenter - half && along - win.w / 2 < spanCenter + half
  })
}

// 部屋+辺(N/S/E/W) に該当する開口(door/window)を抽出する共通ロジック
function openingsForRoomSide(room, side, list, eps) {
  const hw = room.w / 2, hd = room.d / 2
  const face = (side === 'N' || side === 'S') ? 'z' : 'x'
  const thicknessCoord =
    side === 'N' ? room.z - hd :
    side === 'S' ? room.z + hd :
    side === 'W' ? room.x - hw :
    room.x + hw
  const spanCenter = face === 'z' ? room.x : room.z
  const half = (face === 'z' ? room.w : room.d) / 2 - 0.1
  return list.filter(o => {
    if (o.face !== face) return false
    const oThickness = face === 'z' ? o.cz : o.cx
    if (Math.abs(oThickness - thicknessCoord) > eps) return false
    const along = face === 'z' ? o.cx : o.cz
    return along + o.w / 2 > spanCenter - half && along - o.w / 2 < spanCenter + half
  })
}

// 部屋+辺(N/S/E/W) に該当するドアを抽出する（face + along範囲の内包判定）
export function doorsForRoomSide(room, side, doors, eps = 0.1) {
  return openingsForRoomSide(room, side, doors, eps)
}

// 部屋+辺(N/S/E/W) に該当する窓を抽出する（face + along範囲の内包判定）
export function windowsForRoomSide(room, side, windows, eps = 0.1) {
  return openingsForRoomSide(room, side, windows, eps)
}

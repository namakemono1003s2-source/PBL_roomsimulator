// planToLayout.js — 平面図データ(iType.js 形式)を3D描画用のワールド座標へ変換する純粋関数。
// ワールド座標: x=東, y=上, z=南。原点=住戸の中心。
// 部屋・壁・ドア・窓・設備をすべて1つの平面図から組み立てるので、どれか1つだけがずれることがない。

import { computeWallSegments, windowVerticalExtent } from '../../components/ApartmentViewer/wallOpenings'

const EXTERIOR_T = 0.18
const INTERIOR_T = 0.1
const DOOR_H = 2.0
const ON_LINE_EPS = 0.06

export function planToLayout(plan) {
  const { w: W, d: D } = plan.footprint
  const H = plan.wallHeight
  const toX = px => px - W / 2
  const toZ = py => py - D / 2
  const rectToWorld = ([x, y, w, d]) => ({ x: toX(x + w / 2), z: toZ(y + d / 2), w, d })

  const spaces = plan.spaces.map(s => ({
    ...s,
    worldRects: s.rects.map(rectToWorld),
    worldAux: (s.aux ?? []).map(rectToWorld),
  }))

  // 平面図上の点がどの区画にあるか（壁の両面の色決めに使う）
  const allRects = plan.spaces.flatMap(s => [...s.rects, ...(s.aux ?? [])].map(r => ({ s, r })))
  const spaceAt = (px, py) => allRects.find(({ r: [x, y, w, d] }) =>
    px > x && px < x + w && py > y && py < y + d)?.s ?? null
  const sideKey = s => (s ? (s.roomId ?? (s.id === 'hallway' ? 'hallway' : null)) : null)

  // 区画の境界の座標（壁を区画ごとに切り分け、面ごとに部屋の壁色を塗るため）
  const xBreaks = [...new Set(allRects.flatMap(({ r }) => [r[0], r[0] + r[2]]))]
  const yBreaks = [...new Set(allRects.flatMap(({ r }) => [r[1], r[1] + r[3]]))]

  const openingsOn = (horizontal, line, a, b) => {
    const result = []
    const collect = (list, isWindow) => {
      for (const o of list) {
        const [x1, y1, x2, y2] = o.seg
        const oHorizontal = Math.abs(y1 - y2) < 1e-6
        if (oHorizontal !== horizontal) continue
        const oLine = horizontal ? y1 : x1
        if (Math.abs(oLine - line) > ON_LINE_EPS) continue
        const s = Math.min(horizontal ? x1 : y1, horizontal ? x2 : y2)
        const e = Math.max(horizontal ? x1 : y1, horizontal ? x2 : y2)
        if (e <= a || s >= b) continue
        if (isWindow) {
          const { bottom, top } = windowVerticalExtent({ h: o.h })
          result.push({ alongStart: s, alongEnd: e, yBottom: bottom, yTop: top })
        } else {
          result.push({ alongStart: s, alongEnd: e, yBottom: 0, yTop: DOOR_H })
        }
      }
    }
    collect(plan.doors, false)
    collect(plan.windows, true)
    return result
  }

  // 壁1本を、開口(ドア・窓)と区画の境界で切り分けたピースにする
  const wallPieces = []
  const addWall = ([x1, y1, x2, y2], t, h, exterior) => {
    const horizontal = Math.abs(y1 - y2) < 1e-6
    const line = horizontal ? y1 : x1
    const a = Math.min(horizontal ? x1 : y1, horizontal ? x2 : y2)
    const b = Math.max(horizontal ? x1 : y1, horizontal ? x2 : y2)
    const segments = computeWallSegments(a, b, h, openingsOn(horizontal, line, a, b))
    const breaks = (horizontal ? xBreaks : yBreaks).filter(v => v > a + 1e-6 && v < b - 1e-6)
    for (const seg of segments) {
      const s0 = seg.alongCenter - seg.alongLength / 2
      const s1 = seg.alongCenter + seg.alongLength / 2
      const cuts = [s0, ...breaks.filter(v => v > s0 + 1e-6 && v < s1 - 1e-6), s1]
      for (let i = 0; i < cuts.length - 1; i++) {
        const p0 = cuts[i], p1 = cuts[i + 1]
        const mid = (p0 + p1) / 2
        const probe = t / 2 + 0.05
        const neg = horizontal ? spaceAt(mid, line - probe) : spaceAt(line - probe, mid)
        const pos = horizontal ? spaceAt(mid, line + probe) : spaceAt(line + probe, mid)
        // 壁の端は厚みの半分だけ延ばして、直交する壁との角に隙間ができないようにする
        const e0 = Math.abs(p0 - a) < 1e-6 ? t / 2 : 0
        const e1 = Math.abs(p1 - b) < 1e-6 ? t / 2 : 0
        wallPieces.push({
          horizontal,
          line: horizontal ? toZ(line) : toX(line),
          from: (horizontal ? toX : toZ)(p0),
          to: (horizontal ? toX : toZ)(p1),
          boxFrom: (horizontal ? toX : toZ)(p0 - e0),
          boxTo: (horizontal ? toX : toZ)(p1 + e1),
          yBottom: seg.yBottom,
          yTop: seg.yTop,
          thickness: t,
          exterior,
          negSide: exterior && !neg ? null : sideKey(neg),
          posSide: exterior && !pos ? null : sideKey(pos),
        })
      }
    }
  }

  addWall([0, 0, W, 0], EXTERIOR_T, H, true)
  addWall([0, D, W, D], EXTERIOR_T, H, true)
  addWall([0, 0, 0, D], EXTERIOR_T, H, true)
  addWall([W, 0, W, D], EXTERIOR_T, H, true)
  for (const w of plan.walls) addWall(w, INTERIOR_T, H, false)
  for (const [x1, y1, x2, y2, h] of plan.outerWalls ?? []) addWall([x1, y1, x2, y2], INTERIOR_T, h, true)

  const segToOpening = ({ seg: [x1, y1, x2, y2] }, h) => {
    const horizontal = Math.abs(y1 - y2) < 1e-6
    return {
      cx: toX((x1 + x2) / 2),
      cz: toZ((y1 + y2) / 2),
      w: horizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1),
      h,
      face: horizontal ? 'z' : 'x',
    }
  }

  // 部屋タブ・カメラ・家具配置用の部屋の範囲（同じ roomId の区画をまとめた外接矩形。aux は含めない）
  const roomIds = [...new Set(plan.spaces.map(s => s.roomId).filter(Boolean))]
  const bbox = rects => {
    const x0 = Math.min(...rects.map(r => r[0])), y0 = Math.min(...rects.map(r => r[1]))
    const x1 = Math.max(...rects.map(r => r[0] + r[2])), y1 = Math.max(...rects.map(r => r[1] + r[3]))
    return rectToWorld([x0, y0, x1 - x0, y1 - y0])
  }
  const rooms = [
    ...roomIds.map(id => {
      const group = plan.spaces.filter(s => s.roomId === id)
      return { id, label: group[0].label, clickable: true, h: H, ...bbox(group.flatMap(s => s.rects)) }
    }),
    ...plan.spaces.filter(s => s.id === 'hallway').map(s => ({ id: s.id, label: s.label, clickable: false, h: H, ...bbox(s.rects) })),
  ]

  return {
    fromPlan: true,
    footprint: { w: W, d: D },
    wallHeight: H,
    spaces,
    rooms,
    wallPieces,
    doors: plan.doors.map(o => segToOpening(o, DOOR_H)),
    windows: plan.windows.map(o => segToOpening(o, o.h)),
    fixtures: plan.fixtures.map(f => ({ ...f, ...rectToWorld(f.rect) })),
    commonCorridor: { x: 0, z: toZ(-2.6), w: W + 1.2, d: 1.2 },
  }
}

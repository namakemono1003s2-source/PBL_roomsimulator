// apartmentLayout.js — 住戸の3Dレイアウト定義
// 座標系: x=東(右), y=上, z=南(手前/バルコニー側)。原点=住戸中心。単位m。
//
// I型: 推定平面図 floorplans/iType.js から planToLayout で組み立てる（2026-10-27〜）。
//      旧来の「SVG間取り図の矩形を面積から逆算して拡大する」方式は形が合わなかったため廃止。
// H型: 旧方式のまま（SVG間取り図の座標をメートルへ変換）。
//   H型 専有面積 42.12㎡, SVG部屋ゾーン 172×208 = 35,776 SVG²
//   scale = sqrt(42.12 / 35776) ≈ 0.034 m/SVGunit
//   → 3D床面積: 5.85m × 7.07m ≈ 41.4㎡ (実寸に一致)

import { I_PLAN } from './floorplans/iType'
import { planToLayout } from './floorplans/planToLayout'

function derive(rooms, sx, sz, cx, cz) {
  return rooms.map(r => ({
    ...r,
    x: (r.svg.x + r.svg.w / 2 - cx) * sx,
    z: (r.svg.y + r.svg.h / 2 - cz) * sz,
    w: r.svg.w * sx,
    d: r.svg.h * sz,
  }))
}

// H-type: SVGビューボックス 0 0 200 240, 部屋ゾーン (16,16)→(188,224) = 172×208単位
// 均一スケール 0.034 m/SVGunit (専有面積42.12㎡から逆算)
const HSX = 0.034
const HSZ = 0.034
const HCX = 102   // (16+188)/2
const HCZ = 120   // (16+224)/2

export const LAYOUTS = {
  I: planToLayout(I_PLAN),

  H: {
    // 実寸フットプリント: 5.85m × 7.07m
    footprint: { w: 5.85, d: 7.07 },
    rooms: derive([
      { id: 'living',   label: 'LDK', icon: '🛋️', clickable: true,  h: 2.8, svg: { x: 76, y: 16,  w: 112, h: 132 } },
      { id: 'bedroom',  label: '洋室', icon: '🛏️', clickable: true,  h: 2.7, svg: { x: 76, y: 148, w: 112, h: 76  } },
      { id: 'bathroom', label: '浴室', icon: '🚿', clickable: true,  h: 2.5, svg: { x: 16, y: 155, w: 60,  h: 69  } },
      { id: 'hallway',  label: '玄関', icon: '🚪', clickable: false, h: 2.7, svg: { x: 16, y: 16,  w: 60,  h: 92  } },
      { id: 'washroom', label: '洗面', icon: '🪥', clickable: false, h: 2.5, svg: { x: 16, y: 108, w: 60,  h: 47  } },
    ], HSX, HSZ, HCX, HCZ),

    // 内壁は各部屋に1箇所ドア開口(幅0.9m)を設けるため、開口の両側2本のセグメントに分割している。
    walls: [
      [  0,      -3.535, 5.85, 0.12, 2.8 ],
      [  0,      +3.535, 5.85, 0.12, 2.8 ],
      [ -2.924,   0,     0.12, 7.07, 2.8 ],
      [ +2.924,   0,     0.12, 7.07, 2.8 ],
      // SVG x=76 縦仕切り。ドア: LDK→廊下 (z=-2.45〜-1.55)
      [ -0.884,  -2.9925, 0.08, 1.085, 2.8 ],
      [ -0.884,  +0.9925, 0.08, 5.085, 2.8 ],
      // SVG y=108。ドア: 廊下→洗面 (x=-2.35〜-1.45)
      [ -2.637,  -0.408, 0.574, 0.08, 2.5 ],
      [ -1.167,  -0.408, 0.566, 0.08, 2.5 ],
      // SVG y=148。ドア: LDK→洋室 (x=+0.55〜+1.45)
      [ -0.1675, +0.952, 1.435, 0.08, 2.8 ],
      [ +2.1875, +0.952, 1.475, 0.08, 2.8 ],
      // SVG y=155。ドア: 洗面→浴室 (x=-2.35〜-1.45)
      [ -2.637,  +1.19,  0.574, 0.08, 2.5 ],
      [ -1.167,  +1.19,  0.566, 0.08, 2.5 ],
    ],

    windows: [
      { cx: 2.924, cz:  0.40, w: 3.2, h: 1.6, face: 'x' },
      { cx: 2.924, cz:  2.24, w: 1.8, h: 1.1, face: 'x' },
    ],

    doors: [
      { cx: -0.884, cz: -2.00,  w: 0.9, h: 2.8, face: 'x' },  // LDK→廊下
      { cx: -1.90,  cz: -0.408, w: 0.9, h: 2.5, face: 'z' },  // 廊下→洗面
      { cx: +1.00,  cz: +0.952, w: 0.9, h: 2.8, face: 'z' },  // LDK→洋室
      { cx: -1.90,  cz: +1.19,  w: 0.9, h: 2.5, face: 'z' },  // 洗面→浴室
    ],

    balcony: { x: 1.02, z: 3.90, w: 3.81, d: 0.8 },
  },
}

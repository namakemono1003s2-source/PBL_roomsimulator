// roomSizes.js — 部屋サイズの単一情報源
// RoomViewer（描画）と designRules（設計ルール検証）の両方から参照される。
// 値の単位はメートル: [width, height, depth]

export const ROOM_SIZE = {
  // I-type LD は キッチン連続空間として広めに設定（10.8帖LD + 3.1帖K = 約7.2m幅）
  living:   { I: [7.2, 2.8, 5.0], H: [6.2, 2.8, 6.5] },
  kitchen:  { I: [2.5, 2.5, 3.2], H: null },
  bedroom:  { I: [4.2, 2.7, 4.8], H: [3.8, 2.7, 4.5] },
  bedroom2: { I: [3.5, 2.7, 3.8], H: null },
  bedroom3: { I: [4.2, 2.7, 4.8], H: null },
  bathroom: { I: [2.8, 2.5, 3.2], H: [2.8, 2.5, 3.2] },
}

export function getRoomSize(roomId, planType) {
  return ROOM_SIZE[roomId]?.[planType] || ROOM_SIZE[roomId]?.I || [4, 2.7, 4]
}

import { create } from 'zustand'

const defaultRoom = (o) => ({
  wallColor:    '#F5F2EC',
  floorType:    'wood',
  floorColor:   '#C8956C',
  ceilingColor: '#FFFFFF',
  style:        'modern',
  lighting:     'warm',
  ...o,
})

// 初期room状態を定数化して resetToStart・selectPlan で共用
// wallColor / floorColor は WALL_COLORS / FLOOR_OPTIONS の値と一致させる（ラベル表示のため）
const INITIAL_ROOMS = {
  living:   defaultRoom({ wallColor: '#E8DCCB', floorColor: '#D4A574' }),
  // キッチンはLDと壁で仕切られておらず床が繋がっているため、床材はLDと同じ値にする
  kitchen:  defaultRoom({ wallColor: '#D8EDE6', floorColor: '#D4A574' }),
  bedroom:  defaultRoom({ wallColor: '#E4DCF0', floorColor: '#D4A574', style: 'scandinavian' }),
  bedroom2: defaultRoom({ wallColor: '#E8DCCB', floorColor: '#D4A574' }),
  bedroom3: defaultRoom({ wallColor: '#F5F2EC', floorColor: '#D4A574' }),
  bathroom: defaultRoom({ wallColor: '#D4E4F0', floorColor: '#B0B0B0', floorType: 'tile', lighting: 'bright' }),
  toilet:   defaultRoom({ wallColor: '#F0EEE8', floorColor: '#B0B0B0', floorType: 'tile', lighting: 'bright' }),
}

export const useStore = create((set) => ({
  // ── Step management ──
  appStep:           'welcome',
  planType:          null,
  furnitureTemplate: null,

  startSimulation:  () => set({ appStep: 'plan-select' }),
  // #13: planType変更時にrooms・selectedRoomをリセット
  selectPlan:       (type) => set({ planType: type, appStep: 'furniture-select', rooms: { ...INITIAL_ROOMS }, selectedRoom: 'living' }),
  // style を渡すとAIおすすめ診断の結果を全部屋へ反映（省略時は現行の部屋別style設定を維持）
  selectFurniture:  (tmpl, style) => set((s) => ({
    furnitureTemplate: tmpl,
    appStep: 'simulation',
    rooms: style
      ? Object.fromEntries(Object.entries(s.rooms).map(([id, r]) => [id, { ...r, style }]))
      : s.rooms,
  })),
  goBack: () => set((s) =>
    s.appStep === 'plan-select'
      ? { appStep: 'welcome' }
      : s.appStep === 'furniture-select'
      ? { appStep: 'plan-select', planType: null }
      : { appStep: 'furniture-select', furnitureTemplate: null }
  ),
  // #12: resetToStartでroomsも初期値に戻す
  resetToStart: () => set({
    appStep: 'welcome',
    planType: null,
    furnitureTemplate: null,
    selectedRoom: 'living',
    rooms: { ...INITIAL_ROOMS },
  }),

  // ── Room state ──
  selectedRoom: 'living',
  setSelectedRoom: (room) => set({ selectedRoom: room }),

  rooms: { ...INITIAL_ROOMS },

  // Iタイプはキッチン/LD間の壁を撤去し床が繋がっているため、床材の変更は両部屋に連動させる
  updateRoom: (roomId, key, value) =>
    set((s) => {
      const rooms = { ...s.rooms, [roomId]: { ...s.rooms[roomId], [key]: value } }
      const openFloorPair = { living: 'kitchen', kitchen: 'living' }
      const pairId = openFloorPair[roomId]
      if (s.planType === 'I' && pairId && (key === 'floorType' || key === 'floorColor')) {
        rooms[pairId] = { ...s.rooms[pairId], [key]: value }
      }
      return { rooms }
    }),
}))

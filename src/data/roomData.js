// Plan-specific room definitions
export const PLAN_ROOMS = {
  I: {
    living:   { label: 'LD',      icon: '🛋️', size: '10.8帖', area: '17.9㎡' },
    kitchen:  { label: 'キッチン', icon: '🍳', size: '3.1帖',  area: '5.1㎡'  },
    bedroom:  { label: '洋室①',   icon: '🛏️', size: '6.1帖',  area: '10.1㎡' },
    bedroom2: { label: '洋室②',   icon: '🛏️', size: '4.3帖',  area: '7.1㎡'  },
    bedroom3: { label: '洋室③',   icon: '🛏️', size: '6.7帖',  area: '11.1㎡' },
    bathroom: { label: '浴室・洗面', icon: '🚿', size: '1.5坪', area: '4.9㎡'  },
    toilet:   { label: 'トイレ',   icon: '🚽', size: '0.4帖',  area: '0.7㎡'  },
  },
  H: {
    living:   { label: 'LDK',  icon: '🛋️', size: '11.2帖', area: '18.6㎡' },
    bedroom:  { label: '洋室', icon: '🛏️', size: '6.2帖',  area: '10.2㎡' },
    bathroom: { label: '浴室', icon: '🚿', size: '1.5坪',  area: '4.9㎡'  },
  },
}

export const PLAN_INFO = {
  I: { name: 'I タイプ', type: '3LDK+備蓄倉庫', area: '68.26㎡', floor: '8F/14F', rooms: 3 },
  H: { name: 'H タイプ', type: '1LDK', area: '42.12㎡', floor: '2F/14F', rooms: 1 },
}

export const FURNITURE_TEMPLATES = [
  {
    id: 'luxury',
    label: 'プレミアムプラン',
    sub: 'Premium',
    desc: 'スタイリッシュで洗練されたシンプルな家具配置。\n余白を生かした上質な空間づくり。',
    features: ['厳選した少数の高級家具', 'ゆとりある空間設計', 'デザイン性重視'],
    icon: '◆',
  },
  {
    id: 'family',
    label: 'ファミリープラン',
    sub: 'Family',
    desc: 'ご家族の暮らしに合わせた実用的な家具配置。\n収納や使い勝手を重視した空間。',
    features: ['充実した家具・収納', '家族みんなが使いやすい配置', '機能性重視'],
    icon: '⌂',
  },
]

export const WALL_COLORS = [
  { name: 'オフホワイト',     value: '#F5F2EC' },
  { name: 'クリーム',        value: '#F0E8D0' },
  { name: 'ライトグレー',     value: '#E0DDD8' },
  { name: 'ウォームベージュ', value: '#E8DCCB' },
  { name: 'ミントグリーン',   value: '#D8EDE6' },
  { name: 'ライトブルー',     value: '#D4E4F0' },
  { name: 'ラベンダー',       value: '#E4DCF0' },
  { name: 'ローズ',          value: '#F0DEDE' },
  { name: 'ダークグレー',     value: '#8A8A8A' },
  { name: 'ネイビー',         value: '#2C3E50' },
  { name: 'テラコッタ',       value: '#C0725A' },
  { name: 'ダークグリーン',   value: '#3A6B4A' },
]

export const FLOOR_OPTIONS = [
  { type: 'wood',   name: 'オーク (ライト)',    color: '#D4A574' },
  { type: 'wood',   name: 'ウォルナット',       color: '#7A4A2A' },
  { type: 'wood',   name: 'ナチュラルパイン',   color: '#E0C08A' },
  { type: 'wood',   name: 'ダークウッド',       color: '#4A3020' },
  { type: 'tile',   name: 'ホワイトタイル',     color: '#F0F0F0' },
  { type: 'tile',   name: 'グレータイル',       color: '#B0B0B0' },
  { type: 'tile',   name: 'ベージュタイル',     color: '#D4C4A8' },
  { type: 'tile',   name: 'テラコッタタイル',   color: '#C87848' },
  { type: 'carpet', name: 'アイボリーカーペット', color: '#E8E4D8' },
  { type: 'carpet', name: 'グレーカーペット',   color: '#A0A0B0' },
  { type: 'carpet', name: 'ベージュカーペット', color: '#C8B898' },
]

export const STYLE_OPTIONS = [
  { id: 'modern',       label: 'モダン',    desc: 'シンプルで洗練された現代的スタイル' },
  { id: 'scandinavian', label: '北欧',      desc: '木の温かみと機能美を融合' },
  { id: 'natural',      label: 'ナチュラル', desc: '自然素材を活かした温かい空間' },
  { id: 'classic',      label: 'クラシック', desc: '伝統的で重厚感ある上質な空間' },
]

// 「雰囲気（スタイル）」ごとに成立する壁色・床材を4色ずつに絞ったパレット。
// Simulationの右パネルで「まず雰囲気を決め、次に微調整する」という階層を作るために使う。
// 値は WALL_COLORS / FLOOR_OPTIONS に実在する色のみを参照する（新しい色は増やさない）。
export const MOOD_PALETTES = {
  modern: {
    walls:  ['#E0DDD8', '#F5F2EC', '#2C3E50', '#8A8A8A'],
    floors: ['#D4A574', '#B0B0B0', '#F0F0F0', '#7A4A2A'],
  },
  scandinavian: {
    walls:  ['#F5F2EC', '#D8EDE6', '#D4E4F0', '#F0E8D0'],
    floors: ['#E0C08A', '#D4A574', '#E8E4D8', '#F0F0F0'],
  },
  natural: {
    walls:  ['#E8DCCB', '#F0E8D0', '#3A6B4A', '#F5F2EC'],
    floors: ['#D4A574', '#E0C08A', '#E8E4D8', '#7A4A2A'],
  },
  classic: {
    walls:  ['#8A8A8A', '#2C3E50', '#3A6B4A', '#E0DDD8'],
    floors: ['#7A4A2A', '#4A3020', '#D4A574', '#B0B0B0'],
  },
}

// 部屋タブ用アイコン（Phosphor Icons）
export const ROOM_ICON = {
  living: 'ph-armchair', kitchen: 'ph-cooking-pot',
  bedroom: 'ph-bed', bedroom2: 'ph-bed', bedroom3: 'ph-bed',
  bathroom: 'ph-shower', toilet: 'ph-toilet',
}

// color: 室内ライト色, intensity: 室内光強度
// skyColor: Canvas背景(空の色), sunColor: 窓から差し込む太陽光色, sunIntensity: 太陽光強度係数
export const LIGHTING_OPTIONS = [
  {
    id: 'morning',
    label: '朝',
    color: '#FFF8E0',
    intensity: 1.0,
    skyColor: '#B8DCF0',
    sunColor: '#FFE8A0',
    sunIntensity: 2.2,
  },
  {
    id: 'bright',
    label: '昼',
    color: '#FFFFFF',
    intensity: 1.4,
    skyColor: '#87CEEB',
    sunColor: '#FFFEF0',
    sunIntensity: 2.8,
  },
  {
    id: 'warm',
    label: '電球色',
    color: '#FFE4B5',
    intensity: 1.2,
    skyColor: '#87CEEB',
    sunColor: '#FFE4B5',
    sunIntensity: 2.0,
  },
  {
    id: 'soft',
    label: 'やわらか',
    color: '#FFF0D0',
    intensity: 0.9,
    skyColor: '#87CEEB',
    sunColor: '#FFF0D0',
    sunIntensity: 1.6,
  },
  {
    id: 'evening',
    label: '夕方',
    color: '#FFB870',
    intensity: 0.75,
    skyColor: '#E8703A',
    sunColor: '#FF6020',
    sunIntensity: 1.8,
  },
  {
    id: 'night',
    label: '夜',
    color: '#FFE4A0',
    intensity: 0.55,
    skyColor: '#0A1020',
    sunColor: '#102060',
    sunIntensity: 0.15,
  },
]

// 旧ROOM_PHOTOS/PROPERTY_GALLERYは外部ドメイン（kano-kensetsu.com）直参照が
// 応答不能になりページ全体のレンダリングを止める事故を起こしたため2026-09にUI再構築の際に削除。
// 画像は自リポジトリの src/assets 配下に置くこと。

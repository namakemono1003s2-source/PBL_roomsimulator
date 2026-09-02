// priceData.js — 標準仕様差額テーブルと住宅ローン計算
// Phase3 の価格シミュレーション UI から利用する。
// 単位: 万円。calcUpgradeCost() は円で返す。

// ── 床材アップグレード差額（FLOOR_OPTIONS.name をキーに使用） ──────────────────
export const FLOOR_UPGRADE = {
  'オーク (ライト)':      0,    // 標準仕様
  'ウォルナット':         18,
  'ナチュラルパイン':      8,
  'ダークウッド':         20,
  'ホワイトタイル':        0,   // 水回り標準
  'グレータイル':         12,
  'ベージュタイル':       10,
  'テラコッタタイル':     18,
  'アイボリーカーペット':  8,
  'グレーカーペット':      6,
  'ベージュカーペット':    6,
}

// ── 壁色アップグレード差額（WALL_COLORS.name をキーに使用） ──────────────────
export const WALL_UPGRADE = {
  'オフホワイト':     0,   // 標準
  'クリーム':         3,
  'ライトグレー':     3,
  'ウォームベージュ': 3,
  'ミントグリーン':   5,
  'ライトブルー':     5,
  'ラベンダー':       5,
  'ローズ':          5,
  'ダークグレー':     8,
  'ネイビー':         12,
  'テラコッタ':       10,
  'ダークグリーン':   12,
}

// ── スタイル差額 ─────────────────────────────────────────────────────────────
export const STYLE_UPGRADE = {
  modern:       0,
  scandinavian: 15,
  natural:      10,
  classic:      20,
}

// ── 照明差額 ─────────────────────────────────────────────────────────────────
export const LIGHTING_UPGRADE = {
  morning:  0,
  bright:   0,
  warm:     3,
  soft:     5,
  evening:  8,
  night:    8,
}

// ── 家具テンプレート差額 ────────────────────────────────────────────────────
export const FURNITURE_UPGRADE = {
  luxury:  0,    // プレミアム（標準）
  family: -30,   // ファミリープランは30万安い想定
}

// ── ローン計算定数 ───────────────────────────────────────────────────────────
// フラット35・金利0.725%・35年返済相当の月次係数
export const LOAN_MONTHLY_RATE = 0.00302
export const LOAN_MONTHS = 420 // 35年

// ── 集計関数 ─────────────────────────────────────────────────────────────────
// rooms: Zustand store の rooms オブジェクト（各部屋に wallName, floorName, style, lighting が必要）
// furnitureTemplate: 'luxury' | 'family'
// 戻り値: { total: number (円), breakdown: { floor, wall, style, lighting, furniture } }
export function calcUpgradeCost(rooms, furnitureTemplate) {
  let floor = 0, wall = 0, style = 0, lighting = 0

  Object.values(rooms).forEach(room => {
    floor    += FLOOR_UPGRADE[room.floorName]    || 0
    wall     += WALL_UPGRADE[room.wallName]      || 0
    style    += STYLE_UPGRADE[room.style]        || 0
    lighting += LIGHTING_UPGRADE[room.lighting]  || 0
  })

  const furniture = FURNITURE_UPGRADE[furnitureTemplate] || 0
  const totalMan  = floor + wall + style + lighting + furniture

  return {
    total:     totalMan * 10000,
    breakdown: { floor, wall, style, lighting, furniture },
  }
}

// 追加費用のローン月額への影響額（円）
export function calcLoanImpact(upgradeCostYen) {
  const r = LOAN_MONTHLY_RATE
  const n = LOAN_MONTHS
  return Math.round(upgradeCostYen * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

// 物件価格の月々返済額（参考表示用）
export function calcBaseLoan(propertyPriceYen, downPaymentYen = 0) {
  const principal = propertyPriceYen - downPaymentYen
  return calcLoanImpact(principal)
}

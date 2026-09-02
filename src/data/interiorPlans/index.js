// interiorPlans/index.js — インテリアプランテンプレートDBのデータアクセス層
// src/data/furniture.js（旧形式）を置き換える。

import * as premiumModernI from './I-type/premium-modern.js'
import * as premiumScandinavianI from './I-type/premium-scandinavian.js'
import * as premiumNaturalI from './I-type/premium-natural.js'
import * as premiumClassicI from './I-type/premium-classic.js'
import * as familyModernI from './I-type/family-modern.js'
import * as familyScandinavianI from './I-type/family-scandinavian.js'
import * as familyNaturalI from './I-type/family-natural.js'
import * as familyClassicI from './I-type/family-classic.js'

import * as premiumModernH from './H-type/premium-modern.js'
import * as premiumScandinavianH from './H-type/premium-scandinavian.js'
import * as premiumNaturalH from './H-type/premium-natural.js'
import * as premiumClassicH from './H-type/premium-classic.js'
import * as familyModernH from './H-type/family-modern.js'
import * as familyScandinavianH from './H-type/family-scandinavian.js'
import * as familyNaturalH from './H-type/family-natural.js'
import * as familyClassicH from './H-type/family-classic.js'

// キー形式: `${planType}:${template}:${style}`  （template は 'luxury' | 'family' のまま）
const PLAN_REGISTRY = {
  'I:luxury:modern':       premiumModernI,
  'I:luxury:scandinavian': premiumScandinavianI,
  'I:luxury:natural':      premiumNaturalI,
  'I:luxury:classic':      premiumClassicI,
  'I:family:modern':       familyModernI,
  'I:family:scandinavian': familyScandinavianI,
  'I:family:natural':      familyNaturalI,
  'I:family:classic':      familyClassicI,

  'H:luxury:modern':       premiumModernH,
  'H:luxury:scandinavian': premiumScandinavianH,
  'H:luxury:natural':      premiumNaturalH,
  'H:luxury:classic':      premiumClassicH,
  'H:family:modern':       familyModernH,
  'H:family:scandinavian': familyScandinavianH,
  'H:family:natural':      familyNaturalH,
  'H:family:classic':      familyClassicH,
}

function resolveModule(planType, template, style) {
  return PLAN_REGISTRY[`${planType}:${template}:${style}`]
      || PLAN_REGISTRY[`${planType}:${template}:modern`]
      || PLAN_REGISTRY[`${planType}:luxury:modern`]
}

// roomId('living'|'kitchen'|...) → プラン内の実際のキー('living_I' など)へ変換
function resolveRoomKey(roomId, planType) {
  return (roomId === 'living' && planType === 'I') ? 'living_I' : roomId
}

export function getInteriorPlan(planType, template, roomId, style) {
  const mod = resolveModule(planType, template, style)
  const key = resolveRoomKey(roomId, planType)
  return mod?.rooms?.[key]?.furniture || []
}

export function getTemplateMeta(planType, template, style) {
  const mod = resolveModule(planType, template, style)
  return { concept: mod?.concept || '', targetAudience: mod?.targetAudience || [] }
}

export function calcPlanFurniturePrice(planType, template, style) {
  const mod = resolveModule(planType, template, style)
  if (!mod) return 0
  return Object.values(mod.rooms).reduce(
    (sum, room) => sum + room.furniture.reduce((s, p) => s + (p.price || 0), 0),
    0
  )
}

// プラン比較・AIアドバイザー用にフラット化したメタ情報一覧
export const TEMPLATE_META = Object.fromEntries(
  Object.entries(PLAN_REGISTRY).map(([key, mod]) => [
    key,
    { template: mod.template, style: mod.style, planType: mod.planType, concept: mod.concept, targetAudience: mod.targetAudience },
  ])
)

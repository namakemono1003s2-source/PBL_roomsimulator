// interiorAdvisor.js — ルールベースの「AIインテリア提案アシスタント」
// 外部LLM APIは使用しない。家族構成・年代・趣味・生活スタイル・在宅勤務有無・予算から
// スコアリングで最適な template × style の組み合わせを決定し、日本語の理由文を生成する。

import { getTemplateMeta } from '../data/interiorPlans'

const TEMPLATES = ['luxury', 'family']
const STYLES = ['modern', 'scandinavian', 'natural', 'classic']

function comboKey(template, style) {
  return `${template}:${style}`
}

// 各ルール: { target: 'template'|'style', value, weight, phrase }
// phrase は、そのルールが勝者コンボに寄与した場合にのみ理由文として採用される。
function buildRules(profile) {
  const rules = []
  const add = (target, value, weight, phrase) => rules.push({ target, value, weight, phrase })

  switch (profile.familyType) {
    case 'single':
      add('template', 'luxury', 3, '一人暮らしでも上質さを楽しめる、ゆとりある家具構成です')
      add('style', 'modern', 2, 'シンプルで洗練されたモダンスタイルが好相性です')
      break
    case 'couple':
      add('template', 'luxury', 2, '夫婦二人の時間を大切にできる、ゆとりある空間設計です')
      add('style', 'scandinavian', 2, '北欧テイストの温かみがくつろぎの時間を演出します')
      break
    case 'couple_child':
      add('template', 'family', 4, '子育て動線を確保した収納重視のレイアウトです')
      add('style', 'natural', 2, '自然素材で落ち着いた、子どもにもやさしい空間です')
      break
    case 'multi_child':
      add('template', 'family', 4, '複数のお子様の生活動線・収納量を考慮した配置です')
      add('style', 'natural', 1, '自然素材でお子様にもやさしい空間です')
      add('style', 'modern', 1, '片付けやすいシンプルな機能美も両立します')
      break
    case 'senior':
      add('template', 'family', 2, '実用性と収納量を重視した安心の家具構成です')
      add('style', 'classic', 3, '落ち着きと気品のあるクラシックスタイルが調和します')
      break
  }

  switch (profile.ageBracket) {
    case '20s':
      add('style', 'modern', 2, '20代らしい洗練されたモダンテイストをおすすめします')
      add('style', 'scandinavian', 1, '北欧テイストの軽やかさも人気です')
      break
    case '30s':
      add('style', 'scandinavian', 2, '30代に人気の北欧テイストで心地よい空間に')
      add('style', 'natural', 1, 'ナチュラルテイストも落ち着きがあり好相性です')
      break
    case '40s':
      add('style', 'natural', 1, '自然素材の質感が暮らしに馴染みます')
      add('style', 'classic', 1, '重厚感のあるクラシックスタイルも上質です')
      break
    case '50s+':
      add('style', 'classic', 3, '伝統的で上質なクラシックスタイルがふさわしい年代です')
      break
  }

  switch (profile.hobby) {
    case 'reading':
      add('style', 'classic', 1, '読書を楽しむ落ち着いた空間としてクラシックが好相性です')
      add('template', 'luxury', 1, '書斎のような上質な佇まいを演出します')
      break
    case 'cooking':
      add('template', 'family', 1, 'アイランドキッチンなど調理を楽しめる設備を重視しています')
      add('style', 'natural', 1, 'キッチンに立つ時間が心地よいナチュラルテイストです')
      break
    case 'gaming':
      add('style', 'modern', 2, 'モダンなデザインが趣味の空間にもマッチします')
      break
    case 'gardening':
      add('style', 'natural', 2, '観葉植物や自然素材と調和するナチュラルテイストです')
      break
    case 'entertaining':
      add('template', 'luxury', 2, '来客をもてなすのにふさわしい上質な空間です')
      add('style', 'modern', 1, '洗練されたモダンな第一印象を演出します')
      break
  }

  switch (profile.lifestyle) {
    case 'minimalist':
      add('style', 'modern', 3, '物を持ちすぎないミニマルな暮らしにモダンスタイルが合います')
      add('template', 'luxury', 1, '厳選された家具でゆとりある空間を保てます')
      break
    case 'collector':
      add('template', 'family', 2, '収納量の多い家具構成でコレクションも収まります')
      add('style', 'classic', 1, 'こだわりの品と調和するクラシックスタイルです')
      break
    case 'social':
      add('template', 'luxury', 2, '友人・知人を招く機会が多い方に適した上質な空間です')
      add('style', 'scandinavian', 1, '北欧テイストの親しみやすさも魅力です')
      break
  }

  if (profile.remoteWork) {
    add('template', 'family', 2, '在宅ワークにも対応できる書斎スペース（デスク付き洋室）を確保しています')
    add('template', 'luxury', 1, 'ワークスペースにもなる洋室を用意できます')
  }

  switch (profile.budget) {
    case 'standard':
      add('template', 'family', 3, 'ご予算に合わせた実用性重視のプランです')
      break
    case 'plus':
      add('template', 'luxury', 3, 'ご予算にゆとりがあり、上質な家具を選べます')
      break
  }

  return rules
}

// profile: { familyType, ageBracket, hobby, lifestyle, remoteWork, budget }
// planType: 'I' | 'H'（呼び出し側で選択済みのプランタイプを渡す）
export function recommendInteriorPlan(profile, planType) {
  const rules = buildRules(profile)

  const scores = {}
  for (const t of TEMPLATES) for (const s of STYLES) scores[comboKey(t, s)] = 0

  for (const rule of rules) {
    if (rule.target === 'template') {
      for (const s of STYLES) scores[comboKey(rule.value, s)] += rule.weight
    } else {
      for (const t of TEMPLATES) scores[comboKey(t, rule.value)] += rule.weight
    }
  }

  const ranked = Object.entries(scores)
    .map(([key, score]) => {
      const [template, style] = key.split(':')
      return { template, style, score }
    })
    .sort((a, b) => b.score - a.score)

  const winner = ranked[0]

  const reasoning = rules
    .filter(r => (r.target === 'template' && r.value === winner.template) || (r.target === 'style' && r.value === winner.style))
    .map(r => r.phrase)
    .filter((phrase, i, arr) => arr.indexOf(phrase) === i) // 重複除去
    .slice(0, 5)

  const meta = getTemplateMeta(planType, winner.template, winner.style)

  return {
    planType,
    template: winner.template,
    style: winner.style,
    score: winner.score,
    concept: meta.concept,
    targetAudience: meta.targetAudience,
    reasoning,
    ranked,
  }
}

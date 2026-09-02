// FurnitureLayer.jsx — 家具レイヤー
// interiorPlans データを FurnitureModel.jsx 経由で描画する（GLB自動判定＋プリミティブフォールバック）。
// 併せて designRules.js の設計ルール検証を実行し、結果を onValidate で親へ通知する。

import { useEffect, useMemo } from 'react'
import { getInteriorPlan } from '../../data/interiorPlans'
import { validateClearance, validateRoomBounds, validateTVSofaDistance, reportValidation } from '../../utils/designRules'
import FurnitureModel from '../FurnitureModel'
import { MESH_MAP } from './primitives'

export default function FurnitureLayer({ roomId, planType, style, template, onValidate }) {
  const furniture = useMemo(
    () => getInteriorPlan(planType, template, roomId, style),
    [planType, template, roomId, style]
  )

  const warnings = useMemo(() => [
    ...validateClearance(furniture),
    ...validateRoomBounds(furniture, roomId, planType),
    ...(roomId === 'living' ? validateTVSofaDistance(furniture) : []),
  ], [furniture, roomId, planType])

  useEffect(() => {
    if (import.meta.env.DEV) {
      reportValidation(`${roomId}/${style}`, { [roomId]: { furniture } }, planType)
    }
    onValidate?.(warnings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warnings])

  return (
    <>
      {furniture.map(piece => (
        <FurnitureModel key={piece.id} piece={piece} PrimitiveComponent={MESH_MAP[piece.category]} />
      ))}
    </>
  )
}

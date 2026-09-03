// InteriorPlanFurniture.jsx
// 選んだ家具プラン(プレミアム/ファミリー)・部屋ごとのスタイルを、実際に3D画面へ反映する。
//
// これまで ApartmentFurniture.jsx は「見た目のためだけの固定レイアウト」を描画しており、
// FurnitureSelector で選んだプラン(7点/12点)や CustomizationPanel で選んだ部屋ごとの
// スタイルを一切参照していなかった。ここでは interiorPlans のデータ（動線チェック・
// 商談シートが実際に参照しているのと同じデータ）から、家具の種類・数・配置を組み立てる。
//
// 座標の変換について:
//   interiorPlans の position は、各部屋を「部屋単体」として設計したときの中心(0,0)基準。
//   その設計上の部屋サイズは roomSizes.js の ROOM_SIZE。
//   一方、実際にアパート全体を描画する apartmentLayout.js の部屋サイズは、間取り図実測に
//   基づくため ROOM_SIZE とは一致しない（例: LDは設計上7.2m×5.0mだが実際は4.96m×3.84m）。
//   そのため、比率(実際のw,d ÷ 設計上のw,d)で位置をスケールしてから、部屋の実際の
//   ワールド座標(room.x, room.z)へ平行移動する。

import FurnitureModel from '../FurnitureModel'
import { MESH_MAP } from '../RoomViewer/primitives'
import { getInteriorPlan } from '../../data/interiorPlans'
import { getRoomSize } from '../../data/roomSizes'
import { LAYOUTS } from '../../data/apartmentLayout'

// interiorPlans にデータが存在する部屋のみを対象にする（廊下・トイレ個室・玄関収納・
// 備蓄倉庫などの固定設備は対象外。ApartmentFurniture.jsx 側の固定描画のまま）。
const DATA_DRIVEN_ROOM_IDS = ['living', 'kitchen', 'bedroom', 'bedroom2', 'bedroom3', 'bathroom']

export default function InteriorPlanFurniture({ planType, furnitureTemplate, rooms }) {
  const layout = LAYOUTS[planType]
  if (!layout || !furnitureTemplate) return null

  return (
    <>
      {DATA_DRIVEN_ROOM_IDS.map(roomId => {
        const worldRoom = layout.rooms.find(r => r.id === roomId)
        if (!worldRoom) return null // H タイプには kitchen/bedroom2/bedroom3 が無い

        const style = rooms?.[roomId]?.style
        const furniture = getInteriorPlan(planType, furnitureTemplate, roomId, style)
        if (!furniture.length) return null

        const [designW, , designD] = getRoomSize(roomId, planType)
        const scaleX = designW ? worldRoom.w / designW : 1
        const scaleZ = designD ? worldRoom.d / designD : 1

        return furniture.map(piece => {
          const PrimitiveComponent = MESH_MAP[piece.category]
          if (!PrimitiveComponent || !piece.position) return null
          const worldPiece = {
            ...piece,
            position: {
              x: worldRoom.x + piece.position.x * scaleX,
              y: piece.position.y ?? 0,
              z: worldRoom.z + piece.position.z * scaleZ,
            },
          }
          return (
            <FurnitureModel
              key={`${roomId}-${piece.id}`}
              piece={worldPiece}
              PrimitiveComponent={PrimitiveComponent}
            />
          )
        })
      })}
    </>
  )
}

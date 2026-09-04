// InteriorPlanFurniture.jsx
// 選んだ家具プラン(プレミアム/ファミリー)・部屋ごとのスタイルを、実際に3D画面へ反映する。
//
// これまで ApartmentFurniture.jsx は「見た目のためだけの固定レイアウト」を描画しており、
// FurnitureSelector で選んだプラン(7点/12点)や CustomizationPanel で選んだ部屋ごとの
// スタイルを一切参照していなかった。ここでは interiorPlans のデータ（動線チェック・
// 商談シートが実際に参照しているのと同じデータ）から、家具の種類・数・配置を組み立てる。
//
// 座標・寸法の変換について:
//   interiorPlans の position/size は、各部屋を「部屋単体」として設計したときの
//   中心(0,0)基準・その設計上の部屋サイズ(roomSizes.js の ROOM_SIZE)を前提にしている。
//   一方、実際にアパート全体を描画する apartmentLayout.js の部屋サイズは、間取り図実測に
//   基づくため ROOM_SIZE とは一致しない（例: LDは設計上7.2m×5.0mだが実際は4.96m×3.84m）。
//
//   位置だけを比率でスケールして部屋の実座標へ平行移動すると、家具「本体の大きさ」は
//   そのままなので、実際の部屋が設計より狭い場合に壁や隣の部屋を突き抜けてしまう
//   （実測で最大99cmのはみ出しを確認）。
//   そこで、部屋ごとに <group position=部屋の実世界中心 scale=[実測w/設計w, 1, 実測d/設計d]>
//   で包み、家具は元の設計座標のまま配置する。こうすると位置と大きさの両方が同じ比率で
//   縮尺されるため、「設計上その部屋に収まっていたか」がそのまま実際の部屋にも引き継がれる。

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

        return (
          <group key={roomId} position={[worldRoom.x, 0, worldRoom.z]} scale={[scaleX, 1, scaleZ]}>
            {furniture.map(piece => {
              const PrimitiveComponent = MESH_MAP[piece.category]
              if (!PrimitiveComponent || !piece.position) return null
              return (
                <FurnitureModel
                  key={piece.id}
                  piece={piece}
                  PrimitiveComponent={PrimitiveComponent}
                />
              )
            })}
          </group>
        )
      })}
    </>
  )
}

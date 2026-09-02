// Lighting.jsx — 部屋の照明セットアップ
// RoomViewer.jsx の Room() 内にあった照明JSXをそのまま抽出（ロジック変更なし）。

export default function Lighting({ lighting, rw, rh, rd, hw, hd, isLiving, isILiving }) {
  return (
    <>
      {/* 全室共通: 環境光（HDRIが失敗してもベースを確保） */}
      <ambientLight color={lighting.color} intensity={lighting.intensity * (isLiving ? 0.60 : 0.85)} />
      <directionalLight color={lighting.color} position={[rw*0.3, rh*0.95, rd*0.2]}
        intensity={lighting.intensity * 0.85} castShadow
        shadow-mapSize={[1024,1024]} shadow-camera-near={0.1} shadow-camera-far={20}
        shadow-camera-left={-rw} shadow-camera-right={rw}
        shadow-camera-top={rd} shadow-camera-bottom={-rd} />
      {/* 天井中央ダウンライト */}
      <pointLight color={lighting.color} position={[0, rh*0.88, 0]} intensity={lighting.intensity * (isLiving ? 0.4 : 0.85)} decay={1.6} />
      <pointLight color="#FFD0A0" position={[-hw*0.5, rh*0.5, hd*0.4]} intensity={isLiving ? 0.12 : 0.22} />
      {/* 非リビング: 部屋の四隅を照らす補助ダウンライト（窓光が弱い部屋用） */}
      {!isLiving && (
        <>
          <pointLight color={lighting.color} position={[ hw*0.48, rh*0.88,  hd*0.44]} intensity={lighting.intensity * 0.65} decay={1.8} />
          <pointLight color={lighting.color} position={[-hw*0.48, rh*0.88, -hd*0.44]} intensity={lighting.intensity * 0.65} decay={1.8} />
          <pointLight color={lighting.color} position={[ hw*0.48, rh*0.88, -hd*0.44]} intensity={lighting.intensity * 0.50} decay={1.8} />
          <pointLight color={lighting.color} position={[-hw*0.48, rh*0.88,  hd*0.44]} intensity={lighting.intensity * 0.50} decay={1.8} />
        </>
      )}
      {/* 窓採光スポット — sunColor/sunIntensity でリアルな時間帯表現 */}
      <spotLight
        color={lighting.sunColor || '#FFF8EE'}
        position={[hw + 0.9, rh * 1.05, 0.3]}
        angle={0.52}
        penumbra={0.8}
        intensity={(lighting.sunIntensity ?? lighting.intensity * 2.4)}
        castShadow={false}
      />
      {/* 窓サッシからの散乱点光 */}
      <pointLight
        color={lighting.sunColor || '#FFF0D8'}
        position={[hw * 0.55, rh * 0.52, 0.3]}
        intensity={(lighting.sunIntensity ?? lighting.intensity * 2.4) * 0.09}
        decay={2}
      />
      {/* キッチンゾーン補助照明 */}
      {isILiving && (
        <pointLight color={lighting.color} position={[-2.6, rh*0.85, -0.6]} intensity={lighting.intensity * 0.3} />
      )}
    </>
  )
}

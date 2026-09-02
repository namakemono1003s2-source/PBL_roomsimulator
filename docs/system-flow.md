# システムフロー設計書

> 和建設株式会社 — 鷹匠マンション インテリアシミュレーター
> *最終更新: 2026-07-07*

---

## 1. 技術スタック

```
フロントエンド
  ├── React 19             UIコンポーネント・状態管理
  ├── Vite 8               ビルドツール・開発サーバー
  ├── Zustand 5            グローバル状態管理（ストア）
  ├── Three.js 0.184
  │    ├── @react-three/fiber    Three.js の React ラッパー
  │    └── @react-three/drei     OrbitControls / ContactShadows 等
  └── CSS（index.css）     スタイル・デザイントークン（CSS変数）
```

---

## 2. 画面フロー（4ステップ）

`Zustand ストア` の `appStep` 変数で表示コンポーネントを切り替える。

```
  ┌──────────────┐
  │   WELCOME    │  ← アプリ起動時・最初から戻る時
  │ WelcomeScreen│
  └──────┬───────┘
         │ startSimulation()
         ▼
  ┌──────────────┐
  │ PLAN-SELECT  │  ← 間取り選択
  │ PlanSelector │
  └──────┬───────┘
         │ selectPlan('I' | 'H')
         ▼
  ┌───────────────────┐
  │ FURNITURE-SELECT  │  ← 家具テンプレート選択
  │ FurnitureSelector │
  └──────┬────────────┘
         │ selectFurniture('luxury' | 'family')
         ▼
  ┌──────────────┐
  │  SIMULATION  │  ← 3Dシミュレーション本体
  │   App.jsx    │
  └──────────────┘

  ← 戻る操作 ─────────────────────────────────────────────────
  goBack()         1つ前のステップへ（simulation→furniture-select→plan-select→welcome）
  resetToStart()   全リセット → welcome へ（確認ダイアログあり）
```

### ステップ遷移の対応表

| 現在の appStep | 操作・トリガー | 次の appStep | 関数 |
|--------------|--------------|-------------|------|
| `welcome` | 「シミュレーションを始める」ボタン | `plan-select` | `startSimulation()` |
| `plan-select` | 間取りカードをクリック | `furniture-select` | `selectPlan(type)` |
| `plan-select` | 戻るボタン | `welcome` | `goBack()` |
| `furniture-select` | 家具プランカードをクリック | `simulation` | `selectFurniture(tmpl)` |
| `furniture-select` | 戻るボタン | `plan-select` | `goBack()` |
| `simulation` | 「← 変更」ボタン | `furniture-select` | `goBack()` |
| `simulation` | 「最初から」→確認OK | `welcome` | `resetToStart()` |

---

## 3. 各画面の詳細

### STEP 0 — ウェルカム画面（WelcomeScreen.jsx）

ランディングページ形式のエントリ画面。初訪問者向けにアプリの価値を伝える。

```
┌─────────────────────────────────────────────┐
│  lp-nav  [ 和 ] 和建設株式会社              │
├─────────────────────────────────────────────┤
│  lp-hero                                    │
│  ┌─────────────────────┬───────────────┐    │
│  │ 理想の住まいを       │ モデルルーム   │    │
│  │ 3Dで体感してください │ 実物写真グリッド│    │
│  │                     │               │    │
│  │ [シミュレーションを   │ [キッチン][風呂]│   │
│  │  始める →]          │               │    │
│  │                     │               │    │
│  │  ✦ 全室カスタマイズ  │               │    │
│  │  ✦ リアルタイム3D   │               │    │
│  │  ✦ 商談シート作成   │               │    │
│  └─────────────────────┴───────────────┘    │
├─────────────────────────────────────────────┤
│  lp-steps: 01→間取りを選ぶ 02→カスタマイズ 03→共有 │
│  [はじめる →]                               │
├─────────────────────────────────────────────┤
│  lp-footer: © 2026 和建設株式会社           │
└─────────────────────────────────────────────┘
```

| 要素 | 内容 |
|-----|------|
| 実物写真 | `PROPERTY_GALLERY`（roomData.js）から3枚を表示 |
| ナビゲッジ | 「信用顧客専用」バッジ |
| CTAボタン | `startSimulation()` → STEP1へ |

---

### STEP 1 — 間取り選択（PlanSelector.jsx）

```
┌─────────────────────────────────────────────┐
│  鷹匠マンション 間取りを選択してください      │
├──────────────────┬──────────────────────────┤
│   Iタイプ 3LDK   │   Hタイプ 1LDK           │
│  68.26㎡ 8F/14F  │  42.12㎡ 2F/14F          │
│                  │                          │
│  [SVG間取り図]    │  [SVG間取り図]            │
│  LD・K・洋室×3    │  LDK・洋室               │
│  浴室             │  浴室                    │
│                  │                          │
│  → 選択する      │  → 選択する              │
└──────────────────┴──────────────────────────┘
```

- 間取りはすべて **SVG でインライン描画**（外部画像ファイル不使用）
- クリックで `selectPlan('I')` または `selectPlan('H')` を実行
- planType 変更時に rooms・selectedRoom を初期値にリセット

---

### STEP 2 — 家具テンプレート選択（FurnitureSelector.jsx）

```
┌─────────────────────────────────────────────┐
│  ← [Iタイプ 3LDK]  家具テンプレートを選択    │
├──────────────────┬──────────────────────────┤
│ プレミアムプラン  │  ファミリープラン          │
│ Premium          │  Family                  │
│                  │                          │
│ ・厳選した高級家具 │ ・充実した家具・収納       │
│ ・ゆとりある空間  │ ・4人対応ダイニング        │
│ ・デザイン性重視  │ ・機能性重視              │
│                  │                          │
│ [SVGプレビュー]   │ [SVGプレビュー]           │
│   少ない家具      │   多い家具                │
│                  │                          │
│ → 選択する       │ → 選択する               │
└──────────────────┴──────────────────────────┘
```

- 選択した planType がパンくずに表示される
- 各プランのSVGは家具密度の違いを視覚的に表現

---

### STEP 3 — 3Dシミュレーション（App.jsx 内 Simulation コンポーネント）

```
┌──────────────────────────────────────────────────────────────┐
│ app-header                                                   │
│  [和] 和建設株式会社 / Iタイプ 3LDK / プレミアムプラン        │
│                              [←変更] [間取り図] [プラン確認] [最初から] │
├──────────────────────────────────────────────────────────────┤
│ room-tabs                                                    │
│  [🛋️ LD 10.8帖] [🍳 K] [🛏️ 洋室①] [🛏️ 洋室②] [🛏️ 洋室③] [🚿 浴室] │
├───────────────┬───────────────────────────┬──────────────────┤
│ sidebar-plan  │ viewer-section             │ sidebar-custom   │
│ (FloorPlan)   │                           │ (CustomizationP) │
│               │  viewer-hint-bar           │                  │
│ SVG間取り図   │  🛋️ LD — 17.9㎡ / 操作TIP │ [壁の色 12色]    │
│ クリックで    │ ┌────────────────────────┐│                  │
│ 部屋選択      │ │                        ││ [床材 11種]      │
│               │ │    Three.js Canvas     ││                  │
│ 選択部屋は    │ │    3D Room View        ││ [スタイル 4種]   │
│ ゴールドで    │ │    OrbitControls       ││ カラーパレット   │
│ ハイライト    │ │                        ││ ドット表示       │
│               │ └────────────────────────┘│                  │
│               │  photo-ref-strip           │ [照明 4種]       │
│               │  実物設備写真ストリップ     │ 色温度ヒント     │
└───────────────┴───────────────────────────┴──────────────────┘
```

---

## 4. コンポーネントツリー

```
main.jsx（エントリポイント）
└── App.jsx（ルート）
     │
     ├── [appStep='welcome']
     │    └── WelcomeScreen.jsx
     │         └── PROPERTY_GALLERY（roomData.js）参照
     │
     ├── [appStep='plan-select']
     │    └── PlanSelector.jsx
     │         ├── ITypeSVG()       Iタイプ間取りインラインSVG
     │         └── HTypeSVG()       Hタイプ間取りインラインSVG
     │
     ├── [appStep='furniture-select']
     │    └── FurnitureSelector.jsx
     │         ├── LuxuryPreview()  プレミアムプランSVGプレビュー
     │         └── FamilyPreview()  ファミリープランSVGプレビュー
     │
     └── [appStep='simulation']
          └── Simulation（App.jsx内コンポーネント）
               ├── <header class="app-header">
               │    ├── ブランド・物件情報表示
               │    ├── btn-back-sim「← 変更」→ goBack()
               │    ├── btn-plan「間取り図」表示トグル
               │    ├── btn-summary「プラン確認」→ SummaryModal表示
               │    └── btn-restart「最初から」→ ResetConfirmDialog
               │
               ├── <nav class="room-tabs">
               │    └── planTypeに応じた部屋タブ（動的生成）
               │
               ├── sidebar-plan（FloorPlan.jsx）
               │    ├── ITypeFloorPlan()  Iタイプ クリック可能SVG
               │    └── HTypeFloorPlan()  Hタイプ クリック可能SVG
               │
               ├── viewer-section
               │    ├── viewer-hint-bar（部屋名・操作説明）
               │    ├── RoomViewer.jsx（React.lazy 遅延ロード）
               │    │    ├── <Canvas>（Three.js WebGL）
               │    │    ├── Room()（壁・床・天井・窓・照明）
               │    │    ├── 各家具Mesh（Sofa, TVUnit, Bed, etc.）
               │    │    └── OrbitControls（視点操作）
               │    └── photo-ref-strip（ROOM_PHOTOS 実物写真）
               │
               ├── sidebar-custom（CustomizationPanel.jsx）
               │    ├── 壁の色（12色スウォッチ + 選択色名表示）
               │    ├── 床材（11種カード）
               │    ├── スタイル（4種 + カラーパレットドット）
               │    └── 照明（4種 + 色温度ヒント表示）
               │
               ├── SummaryModal.jsx（オーバーレイ）
               │    ├── 部屋ごと設定サマリーグリッド
               │    ├── 印刷ボタン（window.print()）
               │    ├── 問い合わせCTA（電話 / メール）
               │    └── 次ステップ導線（3ステップ）
               │
               ├── ResetConfirmDialog（App.jsx内インライン）
               │    confirm-overlay → confirm-box
               │    [キャンセル] [やり直す → resetToStart()]
               │
               └── GuideOverlay（App.jsx内インライン）
                    localStorage('sim-guide-seen')で初回のみ表示
                    操作方法3項目 → [シミュレーションを始める →]
```

---

## 5. Zustand グローバルストア（useStore.js）

### 状態（State）

```js
{
  // ステップ管理
  appStep:            'welcome' | 'plan-select' | 'furniture-select' | 'simulation'
  planType:           null | 'I' | 'H'
  furnitureTemplate:  null | 'luxury' | 'family'

  // 部屋選択
  selectedRoom:       'living' | 'kitchen' | 'bedroom' | 'bedroom2' | 'bedroom3' | 'bathroom'

  // 部屋ごとのインテリア設定（部屋ID → 設定オブジェクト）
  rooms: {
    living:   { wallColor, floorType, floorColor, ceilingColor, style, lighting }
    kitchen:  { ... }
    bedroom:  { ... }
    bedroom2: { ... }
    bedroom3: { ... }
    bathroom: { ... }
  }
}
```

### アクション（Action）

| 関数 | 引数 | 動作 |
|-----|-----|------|
| `startSimulation()` | — | appStep → `plan-select` |
| `selectPlan(type)` | `'I'`\|`'H'` | planType保存・rooms初期化・appStep → `furniture-select` |
| `selectFurniture(tmpl)` | `'luxury'`\|`'family'` | furnitureTemplate保存・appStep → `simulation` |
| `goBack()` | — | 1つ前のステップへ・関連状態クリア |
| `resetToStart()` | — | 全状態を初期値へ・appStep → `welcome` |
| `setSelectedRoom(roomId)` | 部屋ID | 表示する部屋を切り替え |
| `updateRoom(roomId, key, value)` | — | 部屋の設定1項目を更新 |

### 部屋初期値（INITIAL_ROOMS）

| 部屋 | 壁色 | 床材 | スタイル | 照明 |
|-----|-----|------|---------|------|
| living | ウォームベージュ #E8DCCB | オーク #D4A574 | モダン | 電球色 |
| kitchen | ミントグリーン #D8EDE6 | ホワイトタイル #F0F0F0 | モダン | 電球色 |
| bedroom | ラベンダー #E4DCF0 | オーク #D4A574 | 北欧 | 電球色 |
| bedroom2 | ウォームベージュ #E8DCCB | オーク #D4A574 | モダン | 電球色 |
| bedroom3 | オフホワイト #F5F2EC | オーク #D4A574 | モダン | 電球色 |
| bathroom | ライトブルー #D4E4F0 | グレータイル #B0B0B0 | モダン | 昼白色 |

---

## 6. 静的データ構造（src/data/）

### roomData.js

```js
PLAN_ROOMS[planType][roomId]    // 部屋の名前・アイコン・帖数・㎡
PLAN_INFO[planType]             // タイプ名・間取り・専有面積・階数
FURNITURE_TEMPLATES[]           // プラン一覧（id・label・desc・features）
WALL_COLORS[]                   // 壁色選択肢 { name, value:#hex }
FLOOR_OPTIONS[]                 // 床材選択肢 { type, name, color:#hex }
STYLE_OPTIONS[]                 // スタイル  { id, label, desc }
LIGHTING_OPTIONS[]              // 照明      { id, label, color, intensity }
ROOM_PHOTOS[roomId]             // 実物設備写真 { main, caption, details[] }
PROPERTY_GALLERY[]              // ウェルカム画面用ギャラリー写真
```

**間取り別部屋定義:**

| planType | 部屋ID | 表示名 | 帖数 |
|---------|--------|--------|------|
| I | living | LD | 10.8帖 |
| I | kitchen | キッチン | 3.1帖 |
| I | bedroom | 洋室① | 6.1帖 |
| I | bedroom2 | 洋室② | 4.3帖 |
| I | bedroom3 | 洋室③ | 6.7帖 |
| I | bathroom | 浴室 | 1.5坪 |
| H | living | LDK | 11.2帖 |
| H | bedroom | 洋室 | 6.2帖 |
| H | bathroom | 浴室 | 1.5坪 |

### furniture.js

```js
FURNITURE[template][roomId][style]
// → [ { type, pos:[x,y,z], color, scale? }, ... ]

// template: 'luxury' | 'family'
// roomId:   'living' | 'kitchen' | 'bedroom' | ...
// style:    'modern' | 'scandinavian' | 'natural' | 'classic'
```

**家具タイプ一覧（type値）:**

`sofa` / `tvUnit` / `coffeeTable` / `rug` / `plant` / `diningTable` / `diningChair` / `bedKing` / `bed` / `nightstand` / `dresser` / `desk` / `chair` / `counter` / `island` / `stool` / `bathtub` / `vanity` / `toilet`

---

## 7. カスタマイズのデータ反映フロー

```
ユーザーがパネルで色/床材/スタイル/照明を選択
             │
             ▼
CustomizationPanel.jsx
  updateRoom(selectedRoom, key, value) を呼ぶ
             │
             ▼
Zustand ストア: rooms[selectedRoom][key] が更新
             │
             ▼
RoomViewer.jsx（config プロパティで受け取る）
  ├── wallColor   → 壁Meshのmaterial.color
  ├── floorColor  → 床Meshのmaterial.color（roughnessも変化）
  ├── lighting    → ambientLight / pointLight の intensity・color
  └── style       → FURNITURE[template][roomId][style] から家具リストを取得
             │
             ▼
Three.js が Canvas をリアルタイム再描画（状態変化 → 即時反映）
```

### カスタマイズ選択肢

| 項目 | 種類数 | 詳細 |
|-----|-------|------|
| 壁の色 | 12色 | オフホワイト〜ダークグリーン |
| 床材 | 11種 | 木材4種・タイル4種・カーペット3種 |
| インテリアスタイル | 4種 | モダン・北欧・ナチュラル・クラシック |
| 照明 | 4種 | 昼白色(5000K)・電球色(2700K)・温白色(3000K)・夕暮れ色(2200K) |

### スタイルパレットヒント（CustomizationPanel 内）

| スタイル | カラーパレット（ドット表示） |
|---------|--------------------------|
| モダン | グレー #E8E8E8 / チャコール #4A4A4A / ホワイト #FFFFFF |
| 北欧 | クリーム #F0E8D8 / キャメル #C8A878 / グリーン #7AB840 |
| ナチュラル | ベージュ #D8C8A8 / ブラウン #A08058 / グリーン #6A9838 |
| クラシック | ダークブラウン #2A1A0A / ゴールド #C8A050 / タン #8A6840 |

---

## 8. 3D描画パイプライン（RoomViewer.jsx）

```
props: { config, roomId, planType, furnitureTemplate }
             │
             ▼
┌────────────────────────────────────────┐
│       Three.js Canvas (WebGL)          │
│                                        │
│  ① 部屋サイズ取得                       │
│     ROOM_SIZE[roomId][planType]         │
│     例: living/I → [5.8, 2.8, 6.2]     │
│         (幅m, 高さm, 奥行きm)           │
│                                        │
│  ② 照明配置                            │
│     ambientLight  ← 全体の明るさ        │
│     directionalLight ← 影付きサン光     │
│     pointLight    ← 天井照明           │
│     ※ config.lighting で intensity/color│
│                                        │
│  ③ 部屋の箱を生成                       │
│     ・床 (planeGeometry, Y=0)          │
│     ・天井 (planeGeometry, Y=高さ)     │
│     ・後壁・左壁・右壁                  │
│     ・窓（透過マテリアル）              │
│     ・巾木・廻縁（装飾モールディング）   │
│                                        │
│  ④ 家具の配置                          │
│     FURNITURE[furnitureTemplate]        │
│              [roomId][config.style]     │
│     → 各家具を pos:[x,y,z] に配置      │
│     → type に応じた Mesh コンポーネント │
│                                        │
│  ⑤ OrbitControls                       │
│     ドラッグ: 視点回転                 │
│     スクロール: ズームイン/アウト       │
└────────────────────────────────────────┘
             │
             ▼
ブラウザ画面に3Dルームをリアルタイムレンダリング
```

---

## 9. 特殊UI機能

### 初回操作ガイド（GuideOverlay）

```
localStorage.getItem('sim-guide-seen') で制御

初回起動時のみ guide-overlay を表示
  ├── 🏠 部屋を切り替える
  ├── 🎨 インテリアをカスタマイズ
  └── 🖱️ 3Dビューの操作

[シミュレーションを始める →] クリック
  → localStorage.setItem('sim-guide-seen', '1')
  → showGuide = false（非表示）
```

### リセット確認ダイアログ（ResetConfirmDialog）

```
「最初から」ボタン押下 → showResetConfirm = true
  → confirm-overlay 表示
     「最初からやり直しますか？設定はすべてリセットされます」
     [キャンセル]   → showResetConfirm = false
     [やり直す]     → resetToStart() + showResetConfirm = false
```

### 実物設備写真ストリップ（PhotoRefStrip）

```
ROOM_PHOTOS[activeRoom] が存在する部屋（living・kitchen・bathroom）のみ表示

photo-ref-strip
  ├── キャプション（例：モデルルーム キッチン）
  └── 横スクロール可能な写真列
       ├── メイン写真（全体）
       └── 詳細写真（各設備アップ）
           例: 静音シンク / ガラストップコンロ / 浄水器一体型水栓...
```

### プランサマリーモーダル（SummaryModal）

```
「プラン確認」ボタン → showSummary = true → modal-overlay 表示

modal-box の構成:
  ├── ヘッダー（物件名・タイプ・面積・テンプレート・日付）
  ├── 部屋ごとサマリーグリッド
  │    各部屋カード: 壁 / 床材 / スタイル / 照明
  ├── 印刷ボタン（window.print()）
  ├── 問い合わせCTA
  │    [📞 0120-000-000 電話で相談する]
  │    [✉️ メールで問い合わせ]
  └── 次ステップ導線
       01 印刷・保存 → 02 日程調整 → 03 プラン確定
```

---

## 10. 間取りSVGとルームビューの連動

```
FloorPlan.jsx（左サイドバー）

ユーザーが間取りSVGの部屋エリアをクリック
             │
             ▼
setSelectedRoom(storeId)  ← 各部屋に storeId が割り当て
             │
             ├──▶ FloorPlan: クリックした部屋がゴールドでハイライト
             ├──▶ room-tabs: 対応タブがアクティブに切り替わる
             ├──▶ RoomViewer: 該当部屋の3Dビューに切り替わる
             └──▶ CustomizationPanel: 部屋名・帖数が更新される
```

---

## 11. インテリアコーディネーター役割との連携

`docs/roles/interior-coordinator.md` で定義された提案内容をシステムに反映する際の対応表。

| インテリアコーディネーター提案 | 実装先ファイル | 具体的な場所 |
|--------------------------|--------------|------------|
| ① 家具一覧 | `src/data/furniture.js` | `FURNITURE[template][roomId][style]` |
| ③ 座標 `[x, y, z]` | `src/components/RoomViewer.jsx` | 各家具Meshの `position` prop |
| ④ 向き（Y軸回転度） | `src/components/RoomViewer.jsx` | 各家具Meshの `rotation` prop |
| ⑤ 推奨サイズ | `src/components/RoomViewer.jsx` | 各家具Meshの `scale` または geometry args |
| ⑥ 素材 | `src/data/roomData.js` | `FLOOR_OPTIONS` の `type` フィールド |
| ⑦ 色 | `src/data/roomData.js` | `WALL_COLORS` / `FLOOR_OPTIONS` の `color` |
| ⑧ スタイルテーマ | `src/data/roomData.js` | `STYLE_OPTIONS` |
| 照明 | `src/data/roomData.js` | `LIGHTING_OPTIONS` の `color` / `intensity` |

---

## 12. デザイントークン（index.css）

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--green` | `#75c222` | ブランドカラー・メインアクセント・選択状態 |
| `--green-dark` | `#4A8A10` | ホバー・強調 |
| `--green-light` | `#EAF7D4` | 背景ハイライト |
| `--amber` | `#E8963A` | CTAボタン（プラン確認）・暖色アクセント |
| `--amber-dark` | `#C07828` | CTAホバー |
| `--bg-app` | `#F5F8F2` | アプリ背景（薄いグリーン） |
| `--bg-sidebar` | `#FFFFFF` | サイドバー背景 |
| `--bg-panel` | `#EFF5E8` | パネル背景 |
| `--text-primary` | `#162810` | 見出しテキスト |
| `--text-sec` | `#345222` | サブテキスト |
| `--text-muted` | `#6A8A50` | 補足テキスト |
| `--border` | `#CEEAB8` | カード枠・区切り線 |
| `--gold` | `#75c222` | ※旧変数。--greenにリマップ済み |

---

## 13. ファイル構成

```
home-simulator/
├── src/
│   ├── main.jsx                  エントリポイント
│   ├── App.jsx                   ルート：ステップ管理 + Simulation画面
│   ├── index.css                 全スタイル（デザイントークン・コンポーネント）
│   │
│   ├── store/
│   │   └── useStore.js           Zustand グローバルストア
│   │
│   ├── data/
│   │   ├── roomData.js           間取り・色・スタイル・写真の静的データ
│   │   └── furniture.js          家具配置データ（template × room × style）
│   │
│   └── components/
│       ├── WelcomeScreen.jsx     STEP0: ランディングページ
│       ├── PlanSelector.jsx      STEP1: 間取り選択（SVG間取り図）
│       ├── FurnitureSelector.jsx STEP2: 家具テンプレート選択
│       ├── FloorPlan.jsx         STEP3左: クリック可能間取りSVG
│       ├── CustomizationPanel.jsx STEP3右: 壁/床/スタイル/照明パネル
│       ├── RoomViewer.jsx        STEP3中: Three.js 3Dキャンバス
│       └── SummaryModal.jsx      プラン確認モーダル（印刷・連絡CTA）
│
├── docs/
│   ├── system-flow.md            ← このファイル
│   └── roles/
│       ├── interior-coordinator.md  インテリアコーディネーター指示書
│       ├── react.md                 Reactエンジニア指示書
│       ├── ui.md                    UIデザイナー指示書
│       ├── ux.md                    UXデザイナー指示書
│       ├── pm.md                    プロジェクトマネージャー指示書
│       ├── bugfix.md                バグ修正担当指示書
│       └── review.md                コードレビュー指示書
│
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## 14. 実装メモ

| 項目 | 実装方針 |
|-----|---------|
| 3Dロード最適化 | `React.lazy` + `Suspense` でRoomViewerを遅延ロード |
| 部屋タブの動的生成 | `PLAN_ROOMS[planType]` のキーのみを表示（planType切り替え時に自動更新） |
| planType変更時のリセット | `selectPlan()` 内で `rooms` と `selectedRoom` を同時に初期化 |
| 外部画像の依存 | `ROOM_PHOTOS` / `PROPERTY_GALLERY` は外部URL参照（ネットワーク依存あり） |
| 間取りSVG | すべてインラインSVGで実装。外部ファイル不使用 |
| localStorage | `sim-guide-seen` キーで初回ガイド表示を制御 |
| 印刷対応 | `window.print()` のみ。@media print スタイルは未実装 |

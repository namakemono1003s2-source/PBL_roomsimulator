# 和建設 鷹匠マンション インテリアシミュレーター

住宅購入を検討している顧客が、間取り・家具・内装（壁色・床材・照明）をブラウザ上で自由にカスタマイズしながら3Dで確認できる、建設会社向け住宅シミュレーションWebアプリです。

## 概要

- **ターゲットユーザー:** 和建設の家を買うことを決めた信用顧客。リアルオーダーメイドサービスを利用したい、またはそのイメージをつかみたい人。
- **目的:** 建築知識がなくても直感的に操作でき、住宅購入の意思決定と問い合わせ促進につなげる。

## 画面フロー

1. **WELCOME** — ウェルカムページ（入口）
2. **PLAN-SELECT** — 間取り選択（Iタイプ 3LDK / Hタイプ 1LDK）
3. **FURNITURE-SELECT** — 家具プラン選択（ゆとり重視 / 収納重視）
4. **SIMULATION** — 3Dルームシミュレーション本体（没入型。壁色・床材・スタイル・照明を右のドックでカスタマイズ）
5. **FLOW-CHECK** — 動線チェック（家具どうしの実測間隔から通路幅を診断。SIMULATIONの「動線」から遷移）
6. **SUMMARY** — 商談シート（全画面。部屋ごとの設定一覧・PDF保存・担当者への相談導線）

詳細は [`docs/system-flow.md`](docs/system-flow.md) を参照してください（2026-09のUI再構築以前の設計書のため、画面構成の一部は現状と異なります）。

### 2026-09 UI/UX再構築について

Apple的な余白と暗い低彩度のトーンを基調にしたデザインへ全面刷新しました（旧: 明るいグリーン基調）。主な変更点:

- カラートークン・タイポグラフィを一新（`src/index.css` の `:root`）
- アイコンを絵文字から [Phosphor Icons](https://phosphoricons.com) に統一
- SIMULATION画面を「左サイドバー＋中央＋右サイドバー」の3分割から、3Dを全面に使う没入型レイアウトへ変更
- 新規追加: FLOW-CHECK（動線チェック）画面 — 家具の実寸データから通路幅を自動算出し、狭い箇所を診断
- SUMMARY（旧: プランサマリーのモーダル）を全画面表示に変更し、印刷用スタイルを追加
- 外部ドメイン（kano-kensetsu.com）直参照の実物写真は、応答不能でページ全体の描画が止まる事故があったため削除

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| フロントエンド | React 19 |
| ビルドツール | Vite 8 |
| 状態管理 | Zustand 5 |
| 3D描画 | Three.js 0.184 / @react-three/fiber / @react-three/drei |
| 言語 | TypeScript |
| テスト | Playwright |

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## プレビュー（ビルド後の確認）

```bash
npm run preview
```

## ディレクトリ構成

```
src/
  components/       画面・UIコンポーネント（ApartmentViewer, RoomViewer など）
  data/             間取り・価格・部屋データなどの静的データ
  hooks/            カスタムフック
  store/            Zustand グローバルストア
  utils/            デザインルール・インテリアアドバイザー等のロジック
public/
  models/           3Dモデル（家具・部屋）
docs/
  system-flow.md    システムフロー設計書
  roles/            各ロール（PM/UI/UX/React/インテリアコーディネーター/レビュー/バグ修正）の指示書
  design-guide/      デザインガイドライン
```

## ドキュメント

- [システムフロー設計書](docs/system-flow.md)
- [ロール別指示書](docs/roles/)
- [デザインガイド](docs/design-guide/room-design-rules.md)

## 更新をGitHubに反映する（push）

コードを修正したあと、その変更をGitHub上の保存場所に反映するには、以下の3つの操作をこの順番で行う。

```bash
git add -A
git commit -m "変更内容の説明"
git push
```

| コマンド | やっていること |
| --- | --- |
| `git add -A` | 変更したファイルを「アップロード対象」として選ぶ |
| `git commit -m "..."` | 選んだ変更を「区切り（履歴の1つ）」として記録する |
| `git push` | 記録した変更をGitHub上へアップロードする |

このプロジェクトではClaude Codeがこの3操作をまとめて代行できる。変更後に「GitHubに反映して」と伝えれば実行される。

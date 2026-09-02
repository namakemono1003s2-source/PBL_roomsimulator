import { useStore } from '../store/useStore'
import { PROPERTY_GALLERY } from '../data/roomData'

export default function WelcomeScreen() {
  const startSimulation = useStore(s => s.startSimulation)

  return (
    <div className="lp-screen">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <div className="brand-logo"><span className="logo-kanji">和</span></div>
            <div>
              <div className="brand-name">和建設株式会社</div>
              <div className="brand-tagline">リアルオーダーメイド サービス</div>
            </div>
          </div>
          <div className="lp-nav-badge">信用顧客専用</div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-property-badge">
            <span className="lp-badge-dot"/>
            鷹匠マンション　ご購入特典サービス
          </div>

          <h1 className="lp-headline">
            理想の住まいを<br/>
            <span className="lp-headline-accent">3Dで体感</span>してください
          </h1>

          <p className="lp-subhead">
            鷹匠マンションの実際の間取りをもとに、壁・床・照明を自分好みに組み合わせて3Dで確認できます。
          </p>

          <p className="lp-body">
            内装のイメージを固めてから打合せに進めるので、<br/>
            担当コーディネーターとの相談もよりスムーズに。
          </p>

          <div className="lp-cta-group">
            <button className="lp-cta" onClick={startSimulation}>
              シミュレーションを始める
              <span className="lp-cta-arrow">→</span>
            </button>
            <p className="lp-cta-hint">間取りを選ぶだけで、今すぐ体験できます</p>
          </div>

          <div className="lp-features">
            <div className="lp-feature">
              <span className="lp-feature-icon">🏠</span>
              <div>
                <div className="lp-feature-title">全室カスタマイズ</div>
                <div className="lp-feature-desc">各部屋の壁・床・照明を個別に設定できます</div>
              </div>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">🎨</span>
              <div>
                <div className="lp-feature-title">リアルタイム 3D プレビュー</div>
                <div className="lp-feature-desc">変更がその場で3Dビューに反映されます</div>
              </div>
            </div>
            <div className="lp-feature">
              <span className="lp-feature-icon">📋</span>
              <div>
                <div className="lp-feature-title">商談シートの作成</div>
                <div className="lp-feature-desc">選択内容を担当者と共有・印刷できます</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 実物写真グリッド（SVG→実写に差し替え） ── */}
        <div className="lp-hero-visual">
          <div className="lp-photo-grid">
            <div className="lp-photo-main">
              <img
                src={PROPERTY_GALLERY[0].src}
                alt={PROPERTY_GALLERY[0].label}
                className="lp-photo-main-img"
              />
              <div className="lp-photo-overlay">
                <span className="lp-photo-badge">モデルルーム実物写真</span>
                <span className="lp-photo-caption">{PROPERTY_GALLERY[0].label}</span>
              </div>
            </div>
            <div className="lp-photo-sub-row">
              {PROPERTY_GALLERY.slice(1).map((g, i) => (
                <div key={i} className="lp-photo-sub">
                  <img src={g.src} alt={g.label} className="lp-photo-sub-img" />
                  <div className="lp-photo-sub-label">{g.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-visual-link">
            <span className="lp-visual-link-arrow">↓</span>
            この空間を3Dで自分好みにカスタマイズ
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="lp-steps">
        <h2 className="lp-steps-title">ご利用の流れ</h2>
        <div className="lp-steps-row">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-name">間取りを選ぶ</div>
            <div className="lp-step-desc">IタイプまたはHタイプから<br/>ご希望の間取りをお選びください</div>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">→</div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-name">暮らし方を選ぶ</div>
            <div className="lp-step-desc">プレミアム・ファミリーなど<br/>好みのインテリアの方向性を選択</div>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">→</div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-name">3Dでカスタマイズ</div>
            <div className="lp-step-desc">壁・床・照明・スタイルを<br/>部屋ごとに自由に調整できます</div>
          </div>
          <div className="lp-step-arrow" aria-hidden="true">→</div>
          <div className="lp-step">
            <div className="lp-step-num">04</div>
            <div className="lp-step-name">完成したプランを確認</div>
            <div className="lp-step-desc">商談シートを作成して<br/>担当者との打合せにお役立てください</div>
          </div>
        </div>
        <button className="lp-cta-bottom" onClick={startSimulation}>
          はじめる →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span>© 2026 和建設株式会社</span>
          <span className="lp-footer-sep">｜</span>
          <span>鷹匠マンション リアルオーダーメイドサービス</span>
        </div>
      </footer>

    </div>
  )
}

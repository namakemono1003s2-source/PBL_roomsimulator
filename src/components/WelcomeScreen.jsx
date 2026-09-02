import { useStore } from '../store/useStore'
import interiorTheme from '../assets/interior-theme.png'

export default function WelcomeScreen() {
  const startSimulation = useStore(s => s.startSimulation)

  return (
    <div className="lp-screen">

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <div className="brand-logo"><span className="logo-kanji">和</span></div>
          <div>
            <div className="brand-name">和建設株式会社</div>
            <div className="brand-tagline">Real Order-made Service</div>
          </div>
        </div>
        <div className="lp-nav-right">
          <span className="lp-nav-link">鷹匠マンション</span>
          <span className="lp-nav-link">ご利用の流れ</span>
          <span className="pill-badge">ご契約者専用</span>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-kicker">
            <span className="lp-kicker-dot" />
            TAKAJO RESIDENCE ／ I・H TYPE
          </div>

          <h1 className="lp-headline">
            住んでからの暮らしを、<br />
            買う前に確かめる。
          </h1>

          <p className="lp-body">
            実際の間取りに、実寸の家具を置いた3D。ソファの前を人がすれ違えるか、朝の光がどこまで届くか。図面では分からないことを、契約前にご自身の目で。
          </p>

          <div className="lp-cta-row">
            <button className="lp-cta" onClick={startSimulation}>
              3Dで確かめる
              <i className="ph ph-arrow-right" />
            </button>
            <span className="lp-cta-hint">所要 約5分・登録不要</span>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-hero-img-wrap">
            <img src={interiorTheme} alt="内装テーマ SKY LOUNGE" className="lp-hero-img" />
          </div>
          <div className="lp-hero-img-caption">
            <i className="ph-light ph-image-square" />
            内装テーマ　SKY LOUNGE
          </div>
        </div>
      </section>

      {/* ── 3つの訴求 ────────────────────────────────────── */}
      <section className="lp-value">
        <div className="lp-value-item">
          <i className="ph-light ph-ruler lp-value-icon" />
          <div className="lp-value-title">実寸で置く</div>
          <div className="lp-value-desc">家具はすべて実寸。通路幅はミリ単位で表示されます。</div>
        </div>
        <div className="lp-value-item">
          <i className="ph-light ph-sun-horizon lp-value-icon" />
          <div className="lp-value-title">時間で見る</div>
          <div className="lp-value-desc">朝・昼・夕・夜の光の入り方をそのまま切り替え。</div>
        </div>
        <div className="lp-value-item">
          <i className="ph-light ph-images lp-value-icon" />
          <div className="lp-value-title">実物と並べる</div>
          <div className="lp-value-desc">同じアングルのモデルルーム写真と並べて確認できます。</div>
        </div>
      </section>

      {/* ── ご利用の流れ ─────────────────────────────────── */}
      <section className="lp-steps">
        <div className="lp-steps-head">
          <h2 className="lp-steps-title">ご利用の流れ</h2>
          <span className="lp-steps-note">4ステップ・途中で戻れます</span>
        </div>
        <div className="lp-steps-grid">
          <div className="lp-step-cell">
            <span className="lp-step-num">01</span>
            <div className="lp-step-name">間取りを選ぶ</div>
            <div className="lp-step-desc">Iタイプ 3LDK・Hタイプ 1LDK</div>
          </div>
          <div className="lp-step-cell">
            <span className="lp-step-num">02</span>
            <div className="lp-step-name">暮らし方を選ぶ</div>
            <div className="lp-step-desc">家具プランで方向性を決める</div>
          </div>
          <div className="lp-step-cell">
            <span className="lp-step-num">03</span>
            <div className="lp-step-name">3Dで確かめる</div>
            <div className="lp-step-desc">壁・床・照明・動線をその場で確認</div>
          </div>
          <div className="lp-step-cell">
            <span className="lp-step-num">04</span>
            <div className="lp-step-name">商談シートにする</div>
            <div className="lp-step-desc">PDFで保存し打合せに持参</div>
          </div>
        </div>
      </section>
    </div>
  )
}

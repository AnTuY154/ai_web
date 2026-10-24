import { site } from "../data/site";

type IconName = "arrow" | "check" | "map" | "phone" | "spark" | "store";

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "phone") {
    return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92Z" /></svg>;
  }
  if (name === "map") {
    return <svg {...common}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  }
  if (name === "check") {
    return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  }
  if (name === "arrow") {
    return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  }
  if (name === "spark") {
    return <svg {...common}><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>;
  }
  return <svg {...common}><path d="M3 9.5 12 4l9 5.5V21H3V9.5Z" /><path d="M8 21v-7h8v7M3 10h18" /></svg>;
}

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function Home() {
  const hasPhone = Boolean(site.phoneHref);
  const primaryHref = hasPhone ? site.phoneHref : site.mapUrl;
  const primaryLabel = hasPhone ? "Gọi cửa hàng" : "Xem đường đi";
  const primaryIcon: IconName = hasPhone ? "phone" : "map";

  return (
    <div className={"site-shell " + site.theme + " " + site.layout}>
      <a className="skip-link" href="#main">Bỏ qua đến nội dung chính</a>

      <header className="topbar">
        <div className="container nav-inner">
          <a className="brand" href="#top" aria-label={"Trang chủ " + site.name}>
            <span className="brand-mark"><Icon name="store" /></span>
            <span>
              <strong>{site.shortName}</strong>
              <small>{site.category}</small>
            </span>
          </a>
          <nav aria-label="Điều hướng chính">
            <a href="#san-pham">Gợi ý sản phẩm</a>
            <a href="#lien-he">Liên hệ</a>
          </nav>
          <ExternalLink className="nav-cta" href={primaryHref}><Icon name={primaryIcon} />{primaryLabel}</ExternalLink>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span /><Icon name="spark" />{site.area} · {site.category}</p>
              <h1>{site.hero.title}</h1>
              <p className="hero-lead">{site.hero.lead}</p>
              <div className="hero-actions">
                <ExternalLink className="button button-primary" href={primaryHref}><Icon name={primaryIcon} />{primaryLabel}</ExternalLink>
                <ExternalLink className="button button-secondary" href={site.mapUrl}><Icon name="map" />Mở Google Maps</ExternalLink>
              </div>
              <p className="microcopy">Xác nhận mẫu, giá và tình trạng còn hàng trực tiếp với cửa hàng.</p>
            </div>

            <div className="hero-art" aria-label={"Minh họa cho ngành " + site.category}>
              <div className="art-orbit art-orbit-one" />
              <div className="art-orbit art-orbit-two" />
              <div className="art-card">
                <span className="art-index">{site.indexLabel}</span>
                <p>{site.hero.kicker}</p>
                <strong>{site.shortName}</strong>
                <div className="art-lines"><span /><span /><span /></div>
              </div>
              <div className="floating-note note-one"><Icon name="map" /><span>{site.area}</span></div>
              <div className="floating-note note-two"><Icon name="check" /><span>Có đánh giá gần đây</span></div>
            </div>
          </div>
        </section>

        <section className="proof" aria-label="Thông tin kiểm chứng">
          <div className="container proof-grid">
            <div><span>Địa điểm</span><strong>{site.area}</strong></div>
            <div><span>Đánh giá gần nhất</span><strong>{site.latestReview}</strong></div>
            <div><span>Kiểm tra dữ liệu</span><strong>{site.checkedAt}</strong></div>
            <div><span>Kênh liên hệ</span><strong>{hasPhone ? site.phone : "Google Maps"}</strong></div>
          </div>
        </section>

        <section className="section" id="san-pham">
          <div className="container">
            <div className="section-heading">
              <p className="overline">Tìm đúng nhu cầu</p>
              <h2>{site.sections.offerTitle}</h2>
              <p>{site.sections.offerLead}</p>
            </div>
            <div className="offer-grid">
              {site.offerings.map((item, index) => (
                <article className="offer-card" key={item.title}>
                  <span className="card-number">0{index + 1}</span>
                  <div className="offer-icon"><Icon name="spark" /></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <ExternalLink href={site.mapUrl}>Hỏi cửa hàng <Icon name="arrow" /></ExternalLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft">
          <div className="container value-grid">
            <div className="value-copy">
              <p className="overline">Mua sắm gần bạn</p>
              <h2>{site.sections.valueTitle}</h2>
              <p>{site.sections.valueLead}</p>
              <address><Icon name="map" /><span>{site.address}</span></address>
            </div>
            <div className="benefit-list">
              {site.benefits.map((item) => (
                <div className="benefit" key={item.title}>
                  <span><Icon name="check" /></span>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading centered">
              <p className="overline">Ba bước đơn giản</p>
              <h2>Từ nhu cầu đến cửa hàng</h2>
            </div>
            <ol className="steps">
              {site.steps.map((step, index) => (
                <li key={step.title}><span>{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-faq">
          <div className="container faq-grid">
            <div className="section-heading">
              <p className="overline">Thông tin trước khi ghé</p>
              <h2>Câu hỏi thường gặp</h2>
              <p>Các câu trả lời dưới đây giúp bạn liên hệ đúng kênh; thông tin cụ thể cần được cửa hàng xác nhận.</p>
            </div>
            <div className="faq-list">
              {site.faqs.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="lien-he">
          <div className="container contact-card">
            <div>
              <p className="overline">Liên hệ trực tiếp</p>
              <h2>Ghé {site.shortName}</h2>
              <p>{site.address}</p>
            </div>
            <div className="contact-actions">
              {hasPhone && <a className="button button-light" href={site.phoneHref}><Icon name="phone" />{site.phone}</a>}
              <ExternalLink className="button button-outline-light" href={site.mapUrl}><Icon name="map" />Chỉ đường</ExternalLink>
              {site.existingLink && <ExternalLink className="text-link-light" href={site.existingLink}>Kênh hiện có <Icon name="arrow" /></ExternalLink>}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-inner">
          <div><strong>{site.name}</strong><p>{site.category} · {site.area}</p></div>
          <p>Thông tin giá, mẫu và tình trạng sản phẩm cần được xác nhận trực tiếp với cửa hàng.</p>
        </div>
      </footer>
    </div>
  );
}

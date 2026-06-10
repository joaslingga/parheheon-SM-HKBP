import db from "../lib/db";
import Navbar from "../components/Navbar";
import ContentList from "../components/ContentList";
import Link from "next/link";
import { Mail, Phone, MapPin, CalendarRange, Info, Ticket, ArrowRight, Users } from "lucide-react";

const isVideo = (url) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov") ||
    (url.includes("/uploads/candidate-") && (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".mov") || cleanUrl.endsWith(".webm"))) ||
    (url.includes("/uploads/highlight-") && (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".mov") || cleanUrl.endsWith(".webm")))
  );
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch Session from cookie and verify user exists in database
  let session = null;
  try {
    const cookieStore = require("next/headers").cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie && sessionCookie.value && sessionCookie.value !== "deleted") {
      try {
        const parsedSession = JSON.parse(sessionCookie.value);
        if (parsedSession && parsedSession.id) {
          const userExists = await db.prepare("SELECT id FROM users WHERE id = ?").get(parsedSession.id);
          if (userExists) {
            session = parsedSession;
          }
        }
      } catch (jsonErr) {
        // Safe fallback if session cookie contains invalid or empty JSON
      }
    }
  } catch (err) {
    console.error("Error reading session in homepage:", err);
  }

  // 2. Fetch Data
  const headerImage = (await db.prepare("SELECT value FROM settings WHERE key = 'header_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
  const highlights = await db.prepare("SELECT * FROM highlights ORDER BY id DESC").all();
  
  // Get stats banner image
  const statsImageUrl = (await db.prepare("SELECT value FROM settings WHERE key = 'stats_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop";

  // Fetch Content categories and items
  const contentCategories = await db.prepare("SELECT * FROM voting_categories ORDER BY order_index ASC").all();
  const contentItems = await db.prepare("SELECT * FROM voting_candidates ORDER BY id ASC").all();

  return (
    <div>
      {/* 1. Header Gambar */}
      <header id="home" className="header-container">
        <img 
          src={headerImage} 
          alt="Parheheon HKBP Ciputat Banner" 
          className="header-image"
        />
      </header>

      {/* 2. Menubar / Navbar */}
      <Navbar session={session} />

      {/* 2b. Quick Stats Beranda */}
      <div className="quick-stats-container">
        <div className="quick-stats-single-banner">
          <img src={statsImageUrl} alt="Parheheon Stats Banner" className="stats-banner-img" />
        </div>
      </div>

      {/* 3. Highlight Section */}
      <section id="highlight" className="section">
        <h2 className="section-title">Highlight </h2>
        <p className="section-subtitle">
          Temukan berbagai rangkaian acara seru dan perlombaan yang diadakan selama festival Parheheon Sekolah Minggu tahun ini.
        </p>

        <div className="grid-3">
          {highlights.map((item, idx) => (
            <div key={item.id} className="highlight-card">
              <div className="highlight-img-container">
                {isVideo(item.image_url) ? (
                  <video 
                    src={item.image_url} 
                    controls 
                    playsInline
                    preload="metadata"
                    className="highlight-img" 
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="highlight-img" 
                  />
                )}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "linear-gradient(135deg, var(--secondary), #fb923c)",
                  color: "var(--primary)",
                  padding: "4px 12px",
                  borderRadius: "50px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>Festival 2026</div>
              </div>
              <div className="highlight-content">
                <h3 className="highlight-title">{item.title}</h3>
                <p className="highlight-desc">{item.description}</p>
                <div style={{ marginTop: "auto", paddingTop: "16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--primary-light)", fontSize: "0.85rem", fontWeight: 600 }}>
                  <ArrowRight size={14} /> Lihat Detail
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", maxWidth: "1200px", margin: "0 auto" }}></div>

      {/* 3b. Content Section */}
      <section id="content" className="section">
        <h2 className="section-title">Content Anak</h2>
        <p className="section-subtitle">
          Saksikan berbagai penampilan, karya kreatif, dan dokumentasi festival anak Sekolah Minggu HKBP Ciputat.
        </p>
        <ContentList categories={contentCategories} items={contentItems} />
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", maxWidth: "1200px", margin: "0 auto" }}></div>

      {/* 4. Reservasi Section — CTA ke halaman /reservasi */}
      <section id="reservasi" className="section">
        <h2 className="section-title">Pemesanan Tiket (Reservasi)</h2>
        <p className="section-subtitle">
          Pesan tiket masuk acara puncak festival Parheheon secara online. Pilih tempat duduk terbaik untuk keluarga Anda!
        </p>

        <div className="reservasi-cta-card">
          {/* Decorative blobs */}
          <div className="reservasi-cta-blob reservasi-cta-blob-1" />
          <div className="reservasi-cta-blob reservasi-cta-blob-2" />

          <div className="reservasi-cta-icon">
            <Ticket size={40} />
          </div>
          <h3 className="reservasi-cta-title">Buka Halaman Pemesanan Tiket</h3>
          <p className="reservasi-cta-desc">
            Lihat peta tempat duduk secara interaktif, pilih kursi favorit Anda, dan lakukan pembayaran via QRIS — semua dalam satu halaman khusus.
          </p>

          <div className="reservasi-cta-features">
            <div className="reservasi-cta-feature">
              <span className="reservasi-cta-feature-icon">🎭</span>
              <span>Peta Kursi Interaktif</span>
            </div>
            <div className="reservasi-cta-feature">
              <span className="reservasi-cta-feature-icon">⚡</span>
              <span>Pemesanan Instan</span>
            </div>
            <div className="reservasi-cta-feature">
              <span className="reservasi-cta-feature-icon">📱</span>
              <span>Bayar via QRIS</span>
            </div>
            <div className="reservasi-cta-feature">
              <span className="reservasi-cta-feature-icon">✅</span>
              <span>Konfirmasi Otomatis</span>
            </div>
          </div>

          <Link href="/reservasi" className="reservasi-cta-btn">
            <Ticket size={20} />
            Pesan Tiket Sekarang
            <ArrowRight size={18} />
          </Link>

          {!session && (
            <p className="reservasi-cta-note">
              Sudah punya akun? <Link href="/login" style={{ color: "#fbbf24", fontWeight: 700 }}>Masuk dulu</Link> untuk langsung memesan.
            </p>
          )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .reservasi-cta-card {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1e40af 100%);
            border-radius: 24px;
            padding: 60px 40px;
            text-align: center;
            color: white;
            box-shadow: 0 20px 60px -10px rgba(30, 58, 138, 0.4);
          }
          .reservasi-cta-blob {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }
          .reservasi-cta-blob-1 {
            width: 400px; height: 400px;
            top: -150px; right: -100px;
            background: radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%);
          }
          .reservasi-cta-blob-2 {
            width: 300px; height: 300px;
            bottom: -100px; left: -80px;
            background: radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%);
          }
          .reservasi-cta-icon {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px; height: 80px;
            background: rgba(234,179,8,0.2);
            border: 2px solid rgba(234,179,8,0.35);
            border-radius: 24px;
            color: #fbbf24;
            margin-bottom: 24px;
            box-shadow: 0 8px 24px rgba(234,179,8,0.2);
          }
          .reservasi-cta-title {
            position: relative;
            z-index: 1;
            font-size: 2rem;
            font-weight: 900;
            color: white;
            margin-bottom: 14px;
          }
          .reservasi-cta-desc {
            position: relative;
            z-index: 1;
            font-size: 1rem;
            color: rgba(255,255,255,0.72);
            max-width: 520px;
            margin: 0 auto 32px;
            line-height: 1.6;
          }
          .reservasi-cta-features {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 36px;
          }
          .reservasi-cta-feature {
            display: flex;
            align-items: center;
            gap: 7px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            color: rgba(255,255,255,0.9);
          }
          .reservasi-cta-feature-icon { font-size: 1rem; }
          .reservasi-cta-btn {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #1c1917;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.05rem;
            text-decoration: none;
            box-shadow: 0 8px 24px rgba(245,158,11,0.4);
            transition: all 0.25s ease;
            margin-bottom: 20px;
          }
          .reservasi-cta-btn:hover {
            transform: translateY(-3px) scale(1.03);
            box-shadow: 0 12px 32px rgba(245,158,11,0.55);
          }
          .reservasi-cta-note {
            position: relative;
            z-index: 1;
            color: rgba(255,255,255,0.55);
            font-size: 0.88rem;
            margin: 0;
          }
          @media (max-width: 640px) {
            .reservasi-cta-card { padding: 40px 20px; }
            .reservasi-cta-title { font-size: 1.5rem; }
            .reservasi-cta-features { gap: 8px; }
            .reservasi-cta-btn { padding: 14px 28px; font-size: 0.95rem; }
          }
        ` }} />
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", maxWidth: "1200px", margin: "0 auto" }}></div>

      {/* 6. Kontak Section */}
      <section id="kontak" className="section">
        <h2 className="section-title">Hubungi Kami</h2>
        <p className="section-subtitle">
          Hubungi sekretariat Sekolah Minggu HKBP Ciputat atau kunjungi gereja kami untuk informasi lebih lanjut.
        </p>

        {/* Contact Grid */}
        <div className="contact-container">
          {/* Info card */}
          <div className="card" style={{ border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", fontSize: "1.2rem", color: "var(--primary)" }}>
              <span style={{ background: "rgba(30,58,138,0.08)", padding: "10px", borderRadius: "12px", display: "inline-flex" }}>
                <Info size={20} style={{ color: "var(--primary)" }} />
              </span>
              Sekretariat & Lokasi HKBP Ciputat
            </h3>
            <div className="contact-info-list">
              <div className="contact-item">
                <div className="contact-icon" style={{ background: "rgba(234,179,8,0.1)", color: "var(--secondary)" }}>
                  <MapPin size={20} />
                </div>
                <div className="contact-text">
                  <h4>Alamat Gereja</h4>
                  <p>Jl. Nusa Indah Raya No. 45, Ciputat, Tangerang Selatan, Banten 15411</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
                  <Phone size={20} />
                </div>
                <div className="contact-text">
                  <h4>Nomor Telepon / WhatsApp</h4>
                  <p>
                    <a 
                      href="https://wa.me/6281288468009" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-wa-link"
                    >
                      +62 812-8846-8009 (WhatsApp Panitia)
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon" style={{ background: "rgba(59,130,246,0.1)", color: "var(--primary-light)" }}>
                  <Mail size={20} />
                </div>
                <div className="contact-text">
                  <h4>Alamat Email</h4>
                  <p>sekolahminggu.ciputat@hkbp.or.id</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="schedule-card">
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-30px", width: "220px", height: "220px", background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
            <CalendarRange size={36} style={{ color: "var(--secondary)", marginBottom: "20px" }} />
            <h3 style={{ fontSize: "1.4rem", marginBottom: "16px", fontFamily: "var(--font-title)", fontWeight: 800 }}>Jadwal Ibadah Sekolah Minggu</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.1)", padding: "12px 16px", borderRadius: "10px" }}>
                <span style={{ fontSize: "1.2rem" }}>⏰</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", opacity: 1 }}>Setiap Minggu, Pukul 10.00 WIB</p>
                  <p style={{ opacity: 0.75, fontSize: "0.85rem", marginTop: "2px" }}>Balita, Kelas Kecil & Kelas Besar</p>
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "16px", fontSize: "0.9rem", opacity: 0.85, fontStyle: "italic" }}>
              "Tuhan Yesus Memberkati Anda dan Keluarga" 🙏
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "linear-gradient(135deg, #0f172a 0%, var(--primary) 60%, #1e40af 100%)",
        color: "rgba(255,255,255,0.75)",
        padding: "60px 24px 32px",
        borderTop: "4px solid var(--secondary)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Top row */}
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.8rem" }}>🎉</span>
                <h3 style={{ color: "white", fontFamily: "var(--font-title)", fontWeight: 800, fontSize: "1.4rem" }}>
                  Parheheon<span style={{ color: "var(--secondary)" }}>.</span>
                </h3>
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "420px" }}>
                Festival & Perayaan Kebangkitan Sekolah Minggu HKBP Ciputat 2026. Mempererat kebersamaan iman anak-anak dalam sukacita.
              </p>
            </div>
            <div className="footer-links-grid">
              <div>
                <h4 style={{ color: "white", fontWeight: 700, marginBottom: "12px", fontSize: "0.95rem" }}>Navigasi</h4>
                <style dangerouslySetInnerHTML={{ __html: `
                  .footer-nav-link {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 0.88rem;
                    color: rgba(255, 255, 255, 0.6);
                    transition: color 0.2s;
                    text-decoration: none;
                  }
                  .footer-nav-link:hover {
                    color: var(--secondary) !important;
                  }
                ` }} />
                 {[["#home","Home"],["#highlight","Highlight"],["#content","Content"],["/reservasi","Reservasi Tiket"]].map(([href, label]) => (
                  href.startsWith("/") 
                    ? <Link key={href} href={href} className="footer-nav-link">{label}</Link>
                    : <a key={href} href={href} className="footer-nav-link">{label}</a>
                ))}
              </div>
              <div>
                <h4 style={{ color: "white", fontWeight: 700, marginBottom: "12px", fontSize: "0.95rem" }}>Kontak</h4>
                <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>📍 Ciputat, Tangerang Selatan</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
                  <a 
                    href="https://wa.me/6281288468009" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="footer-wa-link"
                  >
                    📞 +62 812-8846-8009 (WhatsApp)
                  </a>
                </p>
                <p style={{ fontSize: "0.85rem" }}>✉️ sekolahminggu.ciputat@hkbp.or.id</p>
              </div>
            </div>
          </div>

          {/* Verse */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "32px",
            borderLeft: "3px solid var(--secondary)",
            fontStyle: "italic",
            fontSize: "0.92rem",
          }}>
            "Mendidik Anak dalam Jalan yang Benar sehingga setelah Dewasa pun mereka tidak akan menyimpang dari jalan itu." — Amsal 22:6
          </div>

          {/* Bottom copyright */}
          <div style={{ textAlign: "center", fontSize: "0.82rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
            © 2026 Panitia Parheheon HKBP Ciputat. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

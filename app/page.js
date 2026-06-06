import db from "../lib/db";
import { getSession } from "./actions";
import Navbar from "../components/Navbar";
import BookingForm from "../components/BookingForm";
import VotingForm from "../components/VotingForm";
import VotingFormNew from "../components/VotingFormNew";
import TokenShop from "../components/TokenShop";
import SeatMapPreview from "../components/SeatMapPreview";
import TokenShopPreview from "../components/TokenShopPreview";
import VotingPreview from "../components/VotingPreview";
import { getSeatCategories, getBookedSeatIds } from "../lib/seatConfig";
import Link from "next/link";
import { Mail, Phone, MapPin, CalendarRange, Info, Ticket, Award, ArrowRight, Sparkles, Users, Layers } from "lucide-react";

// Force dynamic rendering since this page uses cookies for session management
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

  // 2. Fetch SQLite Data
  const headerImage = (await db.prepare("SELECT value FROM settings WHERE key = 'header_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";
  const highlights = await db.prepare("SELECT * FROM highlights ORDER BY id DESC").all();
  const candidates = await db.prepare("SELECT * FROM candidates ORDER BY id ASC").all();
  
  // Get stats banner image
  const statsImageUrl = (await db.prepare("SELECT value FROM settings WHERE key = 'stats_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop";

  // Fetch QRIS settings
  const qrisRow = await db.prepare("SELECT TOP 1 * FROM qris_settings").get();


  // Get voting categories and user coins
  const votingCategories = await db.prepare("SELECT * FROM voting_categories ORDER BY order_index ASC").all();
  let userCoins = 0;
  
  if (session) {
    const userRow = await db.prepare("SELECT coins FROM users WHERE id = ?").get(session.id);
    userCoins = userRow?.coins || 0;
    // Update session with coins for navbar display
    session.coins = userCoins;
  }

  let reservations = [];
  let hasVoted = false;
  const seatCategories = await getSeatCategories();
  const bookedSeatIds = await getBookedSeatIds();

  if (session) {
    reservations = await db
      .prepare(
        `SELECT r.id, r.user_id, r.event_name, r.ticket_qty, r.status, r.payment_image_url, r.created_at,
                COALESCE(SUM(sb.price), 0) as total_price
         FROM reservations r
         LEFT JOIN seat_bookings sb ON sb.reservation_id = r.id
         WHERE r.user_id = ?
         GROUP BY r.id, r.user_id, r.event_name, r.ticket_qty, r.status, r.payment_image_url, r.created_at
         ORDER BY r.id DESC`
      )
      .all(session.id);
    const vote = await db.prepare("SELECT id FROM votes WHERE user_id = ?").get(session.id);
    hasVoted = !!vote;
  }

  return (
    <div>
      {/* 1. Header Gambar */}
      <header id="home" className="header-container">
        <img 
          src={headerImage} 
          alt="Parheheon HKBP Ciputat Banner" 
          className="header-image"
        />
        <div className="header-overlay" style={{ background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.75))" }}>
          <div className="hero-card">
            <span className="hero-badge">
              <Sparkles size={14} /> Festival & Perayaan Kebangkitan 2026
            </span>
            <h1 className="hero-title">Parheheon Sekolah Minggu</h1>
            <p className="hero-desc">
              Membina dan menumbuhkan iman anak-anak Sekolah Minggu HKBP Ciputat dalam sukacita dan kebersamaan.
            </p>
            <a href="#highlight" className="btn btn-secondary btn-pulse-primary" style={{ width: "auto", display: "inline-flex", gap: "8px", color: "white" }}>
              Mulai Menjelajahi <ArrowRight size={18} />
            </a>
          </div>
        </div>
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
        <h2 className="section-title">Highlight Acara</h2>
        <p className="section-subtitle">
          Temukan berbagai rangkaian acara seru dan perlombaan yang diadakan selama festival Parheheon Sekolah Minggu tahun ini.
        </p>

        <div className="grid-3">
          {highlights.map((item, idx) => (
            <div key={item.id} className="highlight-card">
              <div className="highlight-img-container">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="highlight-img" 
                />
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

      {/* 4. Reservasi Section */}
      <section id="reservasi" className="section">
        <h2 className="section-title">Pemesanan Tiket (Reservasi)</h2>
        <p className="section-subtitle">
          Pesan tiket masuk acara puncak festival Parheheon secara online untuk keluarga dan anak Anda.
        </p>

        {session ? (
          <BookingForm
            reservations={reservations}
            seatCategories={seatCategories}
            bookedSeatIds={bookedSeatIds}
            qris={qrisRow}
          />
        ) : (
          <SeatMapPreview categories={seatCategories} bookedSeatIds={bookedSeatIds} />
        )}
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", maxWidth: "1200px", margin: "0 auto" }}></div>

      {/* 4. Token Shop Section */}
      <section id="token-shop" className="section">
        <h2 className="section-title">Pembelian Coin Voting</h2>
        <p className="section-subtitle">
          Dapatkan coin untuk memberikan vote kepada kandidat favorit Anda di setiap kategori voting.
        </p>

        {session ? (
          <TokenShop session={session} userCoins={userCoins} />
        ) : (
          <TokenShopPreview />
        )}
      </section>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", maxWidth: "1200px", margin: "0 auto" }}></div>

      {/* 5. Voting Online Section */}
      <section id="voting" className="section">
        <h2 className="section-title">Voting Online</h2>
        <p className="section-subtitle">
          Dukung dan berikan apresiasi kepada penampilan kelas sekolah minggu terfavorit pilihan Anda.
        </p>

        {session ? (
          <VotingFormNew categories={votingCategories} session={session} userCoins={userCoins} />
        ) : (
          <VotingPreview categories={votingCategories} />
        )}
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
                  <p>+62 812-3456-7890 (Sekretariat Sekolah Minggu)</p>
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
                <style>{`
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
                `}</style>
                {["#home", "#highlight", "#reservasi", "#voting"].map((href, i) => (
                  <a key={href} href={href} className="footer-nav-link">
                    {["Home", "Highlight", "Reservasi Tiket", "Voting Online"][i]}
                  </a>
                ))}
              </div>
              <div>
                <h4 style={{ color: "white", fontWeight: 700, marginBottom: "12px", fontSize: "0.95rem" }}>Kontak</h4>
                <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>📍 Ciputat, Tangerang Selatan</p>
                <p style={{ fontSize: "0.85rem", marginBottom: "8px" }}>📞 +62 812-3456-7890</p>
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

import db from "../../lib/db";
import Navbar from "../../components/Navbar";
import BookingForm from "../../components/BookingForm";
import SeatMapPreview from "../../components/SeatMapPreview";
import { getSeatCategories, getBookedSeatIdsByStatus } from "../../lib/seatConfig";
import Link from "next/link";
import { Lock, Ticket, ArrowLeft, MapPin, CalendarRange, Users } from "lucide-react";

export const metadata = {
  title: "Reservasi Tiket — Parheheon HKBP Ciputat 2026",
  description: "Pesan tiket masuk acara puncak festival Parheheon Sekolah Minggu HKBP Ciputat secara online. Pilih tempat duduk favoritmu!",
};

export default async function ReservasiPage() {
  // 1. Fetch session
  let session = null;
  try {
    const cookieStore = require("next/headers").cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie?.value && sessionCookie.value !== "deleted") {
      try {
        const parsedSession = JSON.parse(sessionCookie.value);
        if (parsedSession?.id) {
          const userExists = await db.prepare("SELECT id FROM users WHERE id = ?").get(parsedSession.id);
          if (userExists) session = parsedSession;
        }
      } catch {}
    }
  } catch (err) {
    console.error("Error reading session in reservasi:", err);
  }

  // 2. Fetch seat data — split by status
  const seatCategories = await getSeatCategories();
  const { pending: pendingSeatIds, approved: approvedSeatIds, all: allBookedIds } = await getBookedSeatIdsByStatus();

  // 3. Fetch QRIS
  const qrisRow = await db.prepare("SELECT TOP 1 * FROM qris_settings").get();

  // 4. Fetch reservations (if logged in)
  let reservations = [];
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
  }

  // Count stats
  const totalSeats = Object.values(seatCategories).reduce(
    (sum, cat) => sum + (cat.layout.seatsPerRow * cat.layout.rows * cat.layout.sections),
    0
  );
  const bookedCount = allBookedIds.length;
  const availableCount = totalSeats - bookedCount;

  return (
    <div className="reservasi-page">
      <Navbar session={session} />

      {/* Hero Banner */}
      <div className="reservasi-hero">
        <div className="reservasi-hero-bg" />
        <div className="reservasi-hero-content">
          <Link href="/" className="reservasi-back-btn">
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
          <div className="reservasi-hero-badge">
            <Ticket size={14} />
            Pemesanan Tiket Online
          </div>
          <h1 className="reservasi-hero-title">
            Reservasi Tiket<br />
            <span className="reservasi-hero-accent">Parheheon 2026</span>
          </h1>
          <p className="reservasi-hero-desc">
            Pilih tempat duduk terbaik untuk menyaksikan Festival Parheheon Sekolah Minggu HKBP Ciputat. Pesan sekarang sebelum kehabisan!
          </p>

          {/* Quick Stats */}
          <div className="reservasi-stats">
            <div className="reservasi-stat-item">
              <span className="reservasi-stat-num">{totalSeats}</span>
              <span className="reservasi-stat-label">Total Kursi</span>
            </div>
            <div className="reservasi-stat-divider" />
            <div className="reservasi-stat-item">
              <span className="reservasi-stat-num" style={{ color: "#10b981" }}>{availableCount}</span>
              <span className="reservasi-stat-label">Tersedia</span>
            </div>
            <div className="reservasi-stat-divider" />
            <div className="reservasi-stat-item">
              <span className="reservasi-stat-num" style={{ color: "#ef4444" }}>{bookedCount}</span>
              <span className="reservasi-stat-label">Terbooking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Strip */}
      <div className="reservasi-info-strip">
        <div className="reservasi-info-strip-inner">
          <div className="reservasi-info-item">
            <CalendarRange size={16} />
            <span>Acara Puncak: 2026</span>
          </div>
          <div className="reservasi-info-item">
            <MapPin size={16} />
            <span>Jl. Nusa Indah Raya No. 45, Ciputat</span>
          </div>
          <div className="reservasi-info-item">
            <Users size={16} />
            <span>Maks. 10 kursi per akun</span>
          </div>
        </div>
      </div>

      {/* Main Booking Area */}
      <main className="reservasi-main">
        {session ? (
          <BookingForm
            reservations={reservations}
            seatCategories={seatCategories}
            bookedSeatIds={approvedSeatIds}
            pendingSeatIds={pendingSeatIds}
            qris={qrisRow}
          />
        ) : (
          <div className="reservasi-guest-wrapper">
            {/* Lock overlay card */}
            <div className="reservasi-lock-banner">
              <div className="reservasi-lock-icon">
                <Lock size={28} />
              </div>
              <div className="reservasi-lock-content">
                <h2 className="reservasi-lock-title">Masuk untuk Memesan Tiket</h2>
                <p className="reservasi-lock-desc">
                  Anda dapat melihat peta tempat duduk di bawah ini. Silakan masuk atau daftar akun untuk mulai memesan kursi.
                </p>
                <div className="reservasi-lock-actions">
                  <Link href="/login" className="btn btn-pulse-primary" style={{ width: "auto", padding: "11px 28px", display: "inline-flex", gap: "8px", alignItems: "center", fontSize: "0.95rem" }}>
                    <Lock size={16} /> Masuk Sekarang
                  </Link>
                  <Link href="/login?tab=register" className="btn btn-outline" style={{ width: "auto", padding: "11px 28px", fontSize: "0.95rem" }}>
                    Daftar Akun Baru
                  </Link>
                </div>
              </div>
            </div>

            {/* Seat preview (read only + blurred interaction) */}
            <div className="reservasi-preview-wrapper">
              <div className="reservasi-preview-label">
                <span>👁 Peta Tempat Duduk (Mode Pratinjau)</span>
              </div>
              <SeatMapPreview
              categories={seatCategories}
              bookedSeatIds={approvedSeatIds}
              pendingSeatIds={pendingSeatIds}
            />
            </div>
          </div>
        )}
      </main>

      {/* Footer mini */}
      <footer className="reservasi-footer">
        <p>© 2026 Panitia Parheheon HKBP Ciputat · <Link href="/" style={{ color: "var(--primary-light)" }}>Kembali ke Beranda</Link></p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .reservasi-page {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        /* Hero */
        .reservasi-hero {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
          color: white;
          padding: 60px 24px 80px;
          overflow: hidden;
        }

        .reservasi-hero-bg {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.25) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(234,179,8,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .reservasi-hero-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .reservasi-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 24px;
          transition: color 0.2s;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
        }
        .reservasi-back-btn:hover { color: white; background: rgba(255,255,255,0.12); }

        .reservasi-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(234,179,8,0.18);
          color: #fbbf24;
          border: 1px solid rgba(234,179,8,0.3);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
        }

        .reservasi-hero-title {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 16px;
          color: white;
        }

        .reservasi-hero-accent {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reservasi-hero-desc {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.75);
          max-width: 580px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        /* Stats */
        .reservasi-stats {
          display: inline-flex;
          align-items: center;
          gap: 0;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 16px 32px;
          backdrop-filter: blur(10px);
        }

        .reservasi-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 24px;
        }

        .reservasi-stat-num {
          font-size: 1.8rem;
          font-weight: 900;
          color: white;
          line-height: 1;
        }

        .reservasi-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reservasi-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.2);
        }

        /* Info strip */
        .reservasi-info-strip {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .reservasi-info-strip-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          align-items: center;
        }

        .reservasi-info-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.88rem;
          color: #475569;
          font-weight: 500;
        }
        .reservasi-info-item svg { color: var(--primary); }

        /* Main content */
        .reservasi-main {
          flex: 1;
          max-width: 1400px;
          width: 100%;
          margin: 32px auto;
          padding: 0 24px 40px;
        }

        /* Guest wrapper */
        .reservasi-guest-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .reservasi-lock-banner {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          padding: 32px 40px;
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }

        .reservasi-lock-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(30,58,138,0.08), rgba(59,130,246,0.12));
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(30,58,138,0.12);
        }

        .reservasi-lock-content {
          flex: 1;
          min-width: 280px;
        }

        .reservasi-lock-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 6px;
        }

        .reservasi-lock-desc {
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.5;
          margin-bottom: 18px;
        }

        .reservasi-lock-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reservasi-preview-wrapper {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .reservasi-preview-label {
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 20px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Footer */
        .reservasi-footer {
          text-align: center;
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #64748b;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .reservasi-hero { padding: 48px 20px 60px; }
          .reservasi-hero-title { font-size: 2.1rem; }
          .reservasi-stats {
            padding: 14px 16px;
            gap: 0;
          }
          .reservasi-stat-item { padding: 0 14px; }
          .reservasi-stat-num { font-size: 1.4rem; }
          .reservasi-lock-banner { padding: 24px 20px; flex-direction: column; text-align: center; }
          .reservasi-lock-icon { margin: 0 auto; }
          .reservasi-lock-actions { justify-content: center; }
          .reservasi-main { padding: 0 12px 32px; margin-top: 20px; }
        }

        @media (max-width: 480px) {
          .reservasi-hero-title { font-size: 1.7rem; }
          .reservasi-info-strip-inner { gap: 12px; flex-direction: column; align-items: flex-start; }
          .reservasi-stats { flex-wrap: wrap; gap: 12px; }
          .reservasi-stat-divider { display: none; }
        }
      ` }} />
    </div>
  );
}

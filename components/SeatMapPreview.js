"use client";

import Link from "next/link";
import SeatMap from "./SeatMap";
import { Lock } from "lucide-react";
import { formatPrice } from "../lib/seatData";

const seatSpecs = [
  { name: "Kategori 1", price: 200000 },
  { name: "Kategori 2", price: 100000 },
  { name: "Kategori 3", price: 50000 },
  { name: "Tribun 1", price: 100000 },
  { name: "Tribun 2", price: 50000 },
];

export default function SeatMapPreview({ categories, bookedSeatIds, pendingSeatIds = [] }) {
  return (
    <div className="seat-booking-wrapper" style={{ marginTop: "24px" }}>
      <div className="booking-container">
        {/* Right column: Seating Chart Section */}
        <div className="seating-section">
          <div className="stage-label">PANGGUNG</div>
          
          <div className="seating-container">
            <SeatMap
              categories={categories}
              bookedSeatIds={bookedSeatIds}
              pendingSeatIds={pendingSeatIds}
              selectedSeatIds={[]}
              readOnly={true}
              showLegend={true}
            />
          </div>

          {/* Door indicators */}
          <div className="door-indicators">
            <div className="door door-left">Pintu 4</div>
            <div className="door door-right">Pintu 3</div>
          </div>
        </div>

        {/* Bottom span: Login CTA */}
        <div className="summary-section" style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "1.15rem", fontWeight: 800 }}>Pemesanan Tiket Terkunci</h3>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Anda dapat melihat status keterisian kursi di atas. Silakan masuk (Log In) atau daftar akun baru terlebih dahulu untuk memesan tiket.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/login" className="btn btn-pulse-primary" style={{ width: "auto", padding: "10px 24px", display: "inline-flex", gap: "6px", alignItems: "center" }}>
              <Lock size={16} /> Masuk Sekarang
            </Link>
            <Link href="/login?tab=register" className="btn btn-outline" style={{ width: "auto", padding: "10px 24px" }}>
              Daftar Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

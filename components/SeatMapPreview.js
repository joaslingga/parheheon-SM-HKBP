"use client";

import Link from "next/link";
import SeatMap from "./SeatMap";
import { Ticket, Lock } from "lucide-react";

export default function SeatMapPreview({ categories, bookedSeatIds }) {
  // Select a subset of seat categories to show in preview for a cleaner, compact look
  // or just show the whole seat map but read-only and blurred.
  return (
    <div className="preview-relative-wrapper" style={{ marginTop: "24px" }}>
      {/* Background Seating Map (Semi-Visible/Blurred) */}
      <div style={{ opacity: 0.35, pointerEvents: "none", filter: "blur(2px)" }}>
        <SeatMap 
          categories={categories} 
          bookedSeatIds={bookedSeatIds} 
          readOnly={true} 
          showLegend={true}
          compact={false}
        />
      </div>

      {/* Glassmorphic Lock Overlay */}
      <div className="preview-overlay-blur">
        <div className="preview-lock-card">
          <div className="preview-lock-icon">
            <Ticket size={28} />
          </div>
          <h3 className="preview-lock-title">Pemesanan Tiket Terkunci</h3>
          <p className="preview-lock-desc">
            Lihat area denah kursi dan pilih tempat duduk favorit Anda. Silakan masuk (Log In) atau daftar akun baru terlebih dahulu untuk memesan tiket.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Link href="/login" className="btn btn-pulse-primary" style={{ width: "auto", display: "inline-flex", gap: "8px", padding: "12px 28px" }}>
              Masuk Sekarang
            </Link>
            <Link href="/login?tab=register" className="btn btn-outline" style={{ width: "auto", display: "inline-flex", padding: "12px 28px" }}>
              Daftar Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

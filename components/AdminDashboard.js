"use client";

import { useState } from "react";
import { approveReservationAction, deleteReservationAction } from "../app/actions";
import { useRouter } from "next/navigation";
import { Ticket, Award, CheckCircle, Trash2, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertTriangle, Armchair, Coins, Users, Crown, Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import AdminSeatReservation from "./AdminSeatReservation";
import { formatPrice } from "../lib/seatData";
import UserManagement from "./UserManagement";

export default function AdminDashboard({ 
  initialReservations, 
  candidates, 
  stats,
  seatCategories,
  bookedSeatIds,
  pendingSeatIds = [],
  seatStats,
  session,
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("reservasi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleApprove(id) {
    if (!confirm("Setujui reservasi tiket ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await approveReservationAction(id);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("Reservasi berhasil disetujui.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal memperbarui data.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus reservasi tiket ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await deleteReservationAction(id);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Reservasi berhasil dihapus.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal menghapus data.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", paddingBottom: "60px" }} className="premium-dashboard">
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-dashboard {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .admin-header-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%);
          position: relative;
          overflow: hidden;
          padding: 50px 24px;
          border-bottom: 4px solid #fb923c;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .admin-header-glow {
          position: absolute;
          top: -50%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
        }

        .admin-header-glow-left {
          position: absolute;
          bottom: -50%;
          left: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

      ` }} />

      {/* Top Banner with gradients and glows */}
      <div className="admin-header-gradient">
        <div className="admin-header-glow" />
        <div className="admin-header-glow-left" />
        
        <div className="admin-header-container" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <Link href="/" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "0.85rem", padding: "6px 12px", background: "rgba(255,255,255,0.08)", borderRadius: "8px", textDecoration: "none", color: "white", fontWeight: 600 }}>
              <ArrowLeft size={16} /> Kembali ke Beranda
            </Link>
            <h1 style={{ color: "white", fontFamily: "var(--font-title)", fontSize: "2.4rem", fontWeight: 800, textShadow: "0 2px 4px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
              Panel Admin Utama <Sparkles size={24} style={{ color: "#fb923c" }} />
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", marginTop: "4px" }}>
              Kelola Penjualan Tiket Reservasi
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="admin-nav" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button 
              onClick={() => setActiveTab("reservasi")} 
              className={`premium-tab-button ${activeTab === "reservasi" ? "active" : ""}`}
            >
              <Ticket size={18} /> Tiket Reservasi
            </button>
            <button 
              onClick={() => setActiveTab("kursi")} 
              className={`premium-tab-button ${activeTab === "kursi" ? "active" : ""}`}
            >
              <Armchair size={18} /> Reservasi Kursi
            </button>
            <button 
              onClick={() => setActiveTab("manajemen-user")} 
              className={`premium-tab-button ${activeTab === "manajemen-user" ? "active" : ""}`}
            >
              <Users size={18} /> Kelola User
            </button>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: "40px", maxWidth: "1200px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "24px" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: "24px" }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Reservasi */}
        {activeTab === "reservasi" && (
          <div>
            {/* Stat Cards with Border Gradients */}
            <div className="premium-stat-grid">
              <div className="premium-stat-card blue">
                <div className="premium-stat-icon-wrapper blue">
                  <Ticket size={24} />
                </div>
                <div>
                  <div className="premium-stat-value">{stats.reservationCount}</div>
                  <div className="premium-stat-label">Total Transaksi</div>
                </div>
              </div>

              <div className="premium-stat-card green">
                <div className="premium-stat-icon-wrapper green">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="premium-stat-value">{stats.approvedTickets}</div>
                  <div className="premium-stat-label">Tiket Disetujui</div>
                </div>
              </div>

              <div className="premium-stat-card yellow">
                <div className="premium-stat-icon-wrapper yellow">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <div className="premium-stat-value">{stats.pendingReservations}</div>
                  <div className="premium-stat-label">Reservasi Pending</div>
                </div>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="premium-card">
              <h3 style={{ margin: "0 0 20px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>Log Pengajuan Penjualan Tiket</h3>
              
              {initialReservations.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 20px" }}>
                  <Ticket size={48} style={{ opacity: 0.3, marginBottom: "12px", color: "var(--primary)" }} />
                  <p style={{ fontWeight: 600 }}>Belum ada data reservasi tiket yang masuk.</p>
                </div>
              ) : (
                <div className="premium-table-container">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Pemesan</th>
                        <th>Acara</th>
                        <th>Jumlah Tiket</th>
                        <th>Total Harga</th>
                        <th>Bukti Pembayaran</th>
                        <th>Tanggal Pengajuan</th>
                        <th>Status</th>
                        <th style={{ textAlign: "center" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialReservations.map((res) => (
                        <tr key={res.id}>
                          <td style={{ fontWeight: 800, color: "#3b82f6" }}>#{res.id}</td>
                          <td>
                            <div style={{ fontWeight: 800 }}>{res.user_name}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>@{res.username}</div>
                          </td>
                          <td>{res.event_name}</td>
                          <td><strong style={{ fontSize: "1.05rem" }}>{res.ticket_qty}</strong> Pcs</td>
                          <td style={{ fontWeight: 700, color: "#1e3a8a" }}>{formatPrice(res.total_price || 0)}</td>
                          <td>
                            {res.payment_image_url ? (
                              <a
                                href={res.payment_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="premium-btn-action approve"
                                style={{ padding: "6px 12px", fontSize: "0.8rem", width: "auto", textDecoration: "none" }}
                              >
                                <Eye size={13} style={{ marginRight: "4px" }} /> Lihat Bukti
                              </a>
                            ) : (
                              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontStyle: "italic" }}>
                                Belum Upload
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{res.created_at}</td>
                          <td>
                            <span className={`premium-badge ${res.status === 'approved' ? 'approved' : 'pending'}`}>
                              {res.status === 'approved' ? 'Disetujui' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                              {res.status === "pending" && (
                                <button 
                                  onClick={() => handleApprove(res.id)} 
                                  className="premium-btn-action approve"
                                >
                                  <CheckCircle size={14} /> Setujui
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(res.id)} 
                                className="premium-btn-action delete"
                              >
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reservasi Kursi */}
        {activeTab === "kursi" && (
          <AdminSeatReservation
            categories={seatCategories}
            bookedSeatIds={bookedSeatIds}
            pendingSeatIds={pendingSeatIds}
            seatStats={seatStats}
            isAdmin={session?.role === "admin" || session?.role === "superadmin"}
          />
        )}
        {/* Tab 5: Kelola User */}
        {activeTab === "manajemen-user" && (
          <div style={{ marginTop: "12px" }}>
            <UserManagement />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { approveReservationAction, deleteReservationAction, resetVotesAction } from "../app/actions";
import { useRouter } from "next/navigation";
import { Ticket, Award, CheckCircle, Trash2, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertTriangle, Armchair, Coins, Users, Crown, Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import AdminSeatReservation from "./AdminSeatReservation";
import { formatPrice } from "../lib/seatData";
import UserManagement from "./UserManagement";
import AdminTokenTransactions from "./AdminTokenTransactions";

export default function AdminDashboard({ 
  initialReservations, 
  candidates, 
  stats,
  seatCategories,
  bookedSeatIds,
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

  async function handleResetVoting() {
    if (!confirm("PERINGATAN Kritis: Ini akan menghapus semua suara voting yang telah masuk dan mereset hitungan ke 0. Lanjutkan?")) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await resetVotesAction();
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Voting berhasil direset.");
        router.refresh();
      }
    } catch (err) {
      setError("Gagal mereset data voting.");
    } finally {
      setLoading(false);
    }
  }

  const totalVotes = stats.totalVotes || 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", paddingBottom: "60px" }} className="premium-dashboard">
      {/* Dynamic Style Sheet Overrides */}
      <style>{`
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

        .premium-tab-button {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
        }

        .premium-tab-button:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .premium-tab-button.active {
          background: linear-gradient(135deg, #fb923c, #f97316);
          color: #0f172a;
          border-color: #fb923c;
          box-shadow: 0 8px 20px rgba(251, 146, 60, 0.35);
        }

        .premium-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          margin-bottom: 36px;
        }

        .premium-stat-card {
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 24px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.015);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .premium-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .premium-stat-card::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 100%;
          left: 0;
          top: 0;
        }

        .premium-stat-card.blue::after { background: #3b82f6; }
        .premium-stat-card.green::after { background: #10b981; }
        .premium-stat-card.yellow::after { background: #f59e0b; }
        .premium-stat-card.rose::after { background: #f43f5e; }

        .premium-stat-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          transition: transform 0.3s ease;
        }

        .premium-stat-card:hover .premium-stat-icon-wrapper {
          transform: scale(1.08) rotate(5deg);
        }

        .premium-stat-icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .premium-stat-icon-wrapper.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .premium-stat-icon-wrapper.yellow { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .premium-stat-icon-wrapper.rose { background: rgba(244, 63, 148, 0.1); color: #f43f5e; }

        .premium-stat-value {
          font-size: 2.2rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .premium-stat-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .premium-card {
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 28px;
          padding: 36px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
          margin-bottom: 32px;
        }

        .premium-table-container {
          overflow-x: auto;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.01);
          background: white;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }

        .premium-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 800;
          padding: 18px 24px;
          border-bottom: 2px solid #e2e8f0;
          text-transform: uppercase;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
        }

        .premium-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }

        .premium-table tr:last-child td {
          border-bottom: none;
        }

        .premium-table tr:hover td {
          background-color: #f8fafc;
        }

        .premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: 1px solid transparent;
        }

        .premium-badge.approved {
          background: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
        }

        .premium-badge.pending {
          background: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }

        .premium-btn-action {
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
        }

        .premium-btn-action.approve {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
        }

        .premium-btn-action.approve:hover {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35);
        }

        .premium-btn-action.delete {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
        }

        .premium-btn-action.delete:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.35);
        }

        /* Voting styling updates */
        .voting-results-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .voting-result-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .voting-result-card:hover {
          border-color: rgba(59, 130, 246, 0.35);
          background: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }

        .voting-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 800;
          color: #0f172a;
          font-size: 1.05rem;
        }

        .voting-result-bar-bg {
          height: 16px;
          background: #e2e8f0;
          border-radius: 50px;
          overflow: hidden;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
        }

        .voting-result-bar-fill {
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .voting-result-card.winner-highlight {
          border: 2px solid rgba(251, 146, 60, 0.5);
          background: linear-gradient(180deg, #fffbeb 0%, #ffffff 100%);
          box-shadow: 0 12px 30px rgba(251, 146, 60, 0.12);
        }

        .voting-result-card.winner-highlight .voting-result-bar-fill {
          background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
        }
      `}</style>

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
              Kelola Penjualan Tiket Reservasi & Pantau Polling Voting Online
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
              onClick={() => setActiveTab("voting")} 
              className={`premium-tab-button ${activeTab === "voting" ? "active" : ""}`}
            >
              <Award size={18} /> Polling Voting
            </button>
            <button 
              onClick={() => setActiveTab("transaksi-koin")} 
              className={`premium-tab-button ${activeTab === "transaksi-koin" ? "active" : ""}`}
            >
              <Coins size={18} /> Transaksi Coin
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
            seatStats={seatStats}
            isAdmin={session?.role === "admin" || session?.role === "superadmin"}
          />
        )}

        {/* Tab 3: Voting Online */}
        {activeTab === "voting" && (
          <div>
            {/* Stat Cards */}
            <div className="premium-stat-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="premium-stat-card blue">
                <div className="premium-stat-icon-wrapper blue">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="premium-stat-value">{stats.totalVotes}</div>
                  <div className="premium-stat-label">Total Suara Masuk</div>
                </div>
              </div>

              <div className="premium-stat-card yellow" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div className="premium-stat-icon-wrapper yellow">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <div className="premium-stat-value" style={{ fontSize: "1.4rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
                      {candidates[0]?.votes_count > 0 ? candidates[0].name.split(" - ")[0] : "Belum Ada"}
                    </div>
                    <div className="premium-stat-label">Pemenang Sementara</div>
                  </div>
                </div>

                <button 
                  onClick={handleResetVoting} 
                  className="btn btn-danger" 
                  disabled={loading}
                  style={{ width: "auto", display: "inline-flex", gap: "6px", alignSelf: "center", padding: "10px 18px", borderRadius: "12px", fontWeight: 700 }}
                >
                  <RefreshCw size={16} /> Reset Polling
                </button>
              </div>
            </div>

            {/* Voting Visual Results Chart */}
            <div className="premium-card">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>Hasil Polling Suara Terbanyak</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "0.95rem" }}>
                Grafik persentase suara real-time untuk pemilihan penampilan Sekolah Minggu Terfavorit.
              </p>

              <div className="voting-results-grid">
                {candidates.map((cand, index) => {
                  const pct = totalVotes > 0 ? Math.round((cand.votes_count / totalVotes) * 100) : 0;
                  const isLeader = index === 0 && cand.votes_count > 0;
                  return (
                    <div key={cand.id} className={`voting-result-card ${isLeader ? "winner-highlight" : ""}`}>
                      <div className="voting-result-header">
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isLeader && <Crown size={20} style={{ color: "#f59e0b", fill: "#f59e0b" }} />}
                          {cand.name}
                        </span>
                        <span style={{ color: isLeader ? "#f97316" : "var(--primary-light)", fontWeight: 800 }}>
                          {cand.votes_count} Suara ({pct}%)
                        </span>
                      </div>
                      <div className="voting-result-bar-bg">
                        <div 
                          className="voting-result-bar-fill" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Transaksi Koin */}
        {activeTab === "transaksi-koin" && (
          <div style={{ marginTop: "12px" }}>
            <AdminTokenTransactions session={session} />
          </div>
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

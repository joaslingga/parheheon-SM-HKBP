"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  Coins,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getAdminAllTransactionsAction,
  approveTokenTransactionAction,
  rejectTokenTransactionAction,
} from "@/app/actions";

export default function AdminTokenTransactions({ session }) {
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const prevCountRef = useRef(0);
  const bellRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    loadTransactions();
    const interval = setInterval(loadTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowBellDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadTransactions = async () => {
    try {
      const result = await getAdminAllTransactionsAction();
      if (result.success) {
        const txList = result.transactions || [];
        setTransactions(txList);
        const pendingList = txList.filter((t) => t.status === "pending");
        const newCount = pendingList.length;

        // Show toast if new transactions arrived
        if (newCount > prevCountRef.current && prevCountRef.current !== 0) {
          showToast(`🔔 ${newCount - prevCountRef.current} transaksi baru masuk!`, "info");
        }
        prevCountRef.current = newCount;
        setNotificationCount(newCount);
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
  };

  const filterTransactions = () => {
    let filtered = transactions;
    if (statusFilter !== "all") {
      filtered = transactions.filter((t) => t.status === statusFilter);
    }
    setFilteredTransactions(filtered);
  };

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (transaction) => {
    setProcessingId(transaction.id);
    try {
      const result = await approveTokenTransactionAction(transaction.id);
      if (result.success) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id
              ? { ...t, status: "verified", verified_at: new Date().toISOString() }
              : t
          )
        );
        showToast(`✅ Berhasil! ${transaction.coins_amount} coin diberikan ke ${transaction.user_name}`, "success");
      } else {
        showToast(`❌ Gagal: ${result.error}`, "error");
      }
    } catch (err) {
      console.error("Approve error:", err);
      showToast("❌ Terjadi kesalahan", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transaction) => {
    const reason = prompt("Alasan penolakan (opsional):");
    if (reason === null) return;

    setProcessingId(transaction.id);
    try {
      const result = await rejectTokenTransactionAction(transaction.id, reason);
      if (result.success) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id
              ? { ...t, status: "rejected", verified_at: new Date().toISOString() }
              : t
          )
        );
        showToast(`Transaksi #${transaction.id} ditolak`, "warning");
      } else {
        showToast(`❌ Gagal: ${result.error}`, "error");
      }
    } catch (err) {
      console.error("Reject error:", err);
      showToast("❌ Terjadi kesalahan", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const showImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        bg: "rgba(245, 158, 11, 0.12)",
        border: "1px solid #f59e0b",
        color: "#d97706",
        icon: <Clock size={13} />,
        label: "Menunggu",
      },
      verified: {
        bg: "rgba(34, 197, 94, 0.12)",
        border: "1px solid #22c55e",
        color: "#16a34a",
        icon: <CheckCircle2 size={13} />,
        label: "Terverifikasi",
      },
      rejected: {
        bg: "rgba(239, 68, 68, 0.12)",
        border: "1px solid #ef4444",
        color: "#dc2626",
        icon: <XCircle size={13} />,
        label: "Ditolak",
      },
    };

    const cfg = config[status] || config.pending;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "5px 12px",
          background: cfg.bg,
          border: cfg.border,
          color: cfg.color,
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  const pendingTransactions = transactions.filter((t) => t.status === "pending");

  if (!isMounted) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <Loader2
          size={48}
          style={{
            color: "var(--primary)",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite",
            display: "block",
          }}
        />
        <p style={{ color: "var(--text-muted)" }}>Memuat...</p>
      </div>
    );
  }

  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <AlertCircle size={48} style={{ color: "var(--accent)", marginBottom: "16px" }} />
        <h3>Akses Ditolak</h3>
        <p>Hanya admin yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  const filterTabs = [
    { value: "all", label: "Semua", color: "var(--primary)", count: transactions.length },
    { value: "pending", label: "Menunggu", color: "#f59e0b", count: pendingTransactions.length },
    { value: "verified", label: "Terverifikasi", color: "#22c55e", count: transactions.filter((t) => t.status === "verified").length },
    { value: "rejected", label: "Ditolak", color: "#ef4444", count: transactions.filter((t) => t.status === "rejected").length },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            background:
              toastMessage.type === "success"
                ? "#22c55e"
                : toastMessage.type === "error"
                ? "#ef4444"
                : toastMessage.type === "warning"
                ? "#f59e0b"
                : "#3b82f6",
            color: "white",
            padding: "14px 24px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.95rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            animation: "slideInRight 0.3s ease",
            maxWidth: "380px",
          }}
        >
          {toastMessage.message}
        </div>
      )}

      {/* Header with Notification Bell */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "4px",
            }}
          >
            Manajemen Transaksi Coin
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Validasi pembelian coin dari user
          </p>
        </div>

        {/* Bell + Refresh */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Notification Bell */}
          <div ref={bellRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowBellDropdown((v) => !v)}
              style={{
                position: "relative",
                background:
                  notificationCount > 0
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, var(--primary), var(--secondary))",
                color: "white",
                border: "none",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: notificationCount > 0 ? "0 4px 12px rgba(239,68,68,0.4)" : "0 4px 12px rgba(0,0,0,0.12)",
                animation: notificationCount > 0 ? "bellRing 1.5s ease infinite" : "none",
              }}
              title={`${notificationCount} transaksi menunggu verifikasi`}
            >
              <Bell size={22} />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "white",
                    color: "#ef4444",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    border: "2px solid #ef4444",
                  }}
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* Bell Dropdown */}
            {showBellDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "white",
                  borderRadius: "14px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                  border: "1px solid var(--border)",
                  width: "320px",
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Bell size={16} />
                  {notificationCount > 0
                    ? `${notificationCount} Transaksi Menunggu Verifikasi`
                    : "Tidak ada transaksi pending"}
                </div>
                {pendingTransactions.length === 0 ? (
                  <div
                    style={{
                      padding: "20px 16px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    Semua transaksi sudah diproses 🎉
                  </div>
                ) : (
                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {pendingTransactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary)" }}>
                            {tx.user_name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {tx.coins_amount} Coin — Rp {Number(tx.amount).toLocaleString("id-ID")}
                          </div>
                        </div>
                        <span
                          style={{
                            background: "rgba(245,158,11,0.12)",
                            color: "#d97706",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: "10px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          #{tx.id}
                        </span>
                      </div>
                    ))}
                    {pendingTransactions.length > 5 && (
                      <div
                        style={{
                          padding: "10px 16px",
                          textAlign: "center",
                          fontSize: "0.82rem",
                          color: "var(--primary)",
                          fontWeight: 600,
                        }}
                      >
                        +{pendingTransactions.length - 5} lainnya...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              background: "var(--bg-light)",
              border: "2px solid var(--border)",
              color: "var(--primary)",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              cursor: isRefreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            title="Refresh data"
          >
            <RefreshCw
              size={20}
              style={{
                animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total", value: transactions.length, color: "var(--primary)", bg: "rgba(99,102,241,0.08)" },
          { label: "Menunggu", value: pendingTransactions.length, color: "#d97706", bg: "rgba(245,158,11,0.08)" },
          { label: "Terverifikasi", value: transactions.filter((t) => t.status === "verified").length, color: "#16a34a", bg: "rgba(34,197,94,0.08)" },
          { label: "Ditolak", value: transactions.filter((t) => t.status === "rejected").length, color: "#dc2626", bg: "rgba(239,68,68,0.08)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {filterTabs.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            style={{
              padding: "8px 16px",
              border:
                statusFilter === filter.value
                  ? `2px solid ${filter.color}`
                  : "2px solid var(--border)",
              background:
                statusFilter === filter.value ? `${filter.color}15` : "white",
              color: statusFilter === filter.value ? filter.color : "var(--text-muted)",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            {filter.label}
            <span
              style={{
                background: statusFilter === filter.value ? filter.color : "#e5e7eb",
                color: statusFilter === filter.value ? "white" : "#6b7280",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "0.75rem",
                fontWeight: 800,
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <Loader2
            size={48}
            style={{
              color: "var(--primary)",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
              display: "block",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Memuat transaksi...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "var(--bg-light)",
            borderRadius: "16px",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📋</div>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            Tidak ada transaksi{statusFilter !== "all" ? ` dengan status '${statusFilter}'` : ""}
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "white",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.88rem",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                }}
              >
                {[
                  "ID",
                  "Nama User",
                  "Amount",
                  "Koin",
                  "Tanggal Transaksi",
                  "Gambar Bukti",
                  "Status",
                  "Validasi",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "white",
                      fontSize: "0.82rem",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: i % 2 === 0 ? "white" : "#fafafa",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "white" : "#fafafa")}
                >
                  {/* ID */}
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--primary)" }}>
                    <span
                      style={{
                        background: "var(--bg-light)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                      }}
                    >
                      #{tx.id}
                    </span>
                  </td>

                  {/* Nama User */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem" }}>
                      {tx.user_name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      @{tx.username}
                    </div>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: 700, color: "#16a34a", fontSize: "0.92rem" }}>
                      Rp {Number(tx.amount).toLocaleString("id-ID")}
                    </span>
                  </td>

                  {/* Koin */}
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "linear-gradient(135deg, #FDB46222, #FB850022)",
                        color: "#d97706",
                        fontWeight: 800,
                        padding: "5px 12px",
                        borderRadius: "12px",
                        fontSize: "0.88rem",
                      }}
                    >
                      💰 {tx.coins_amount}
                    </span>
                  </td>

                  {/* Tanggal Transaksi */}
                  <td style={{ padding: "14px 16px", fontSize: "0.82rem" }}>
                    <div style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {new Date(tx.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>

                  {/* Gambar Bukti */}
                  <td style={{ padding: "14px 16px" }}>
                    {tx.payment_image_url ? (
                      <button
                        onClick={() => showImage(tx.payment_image_url)}
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                          color: "white",
                          border: "none",
                          padding: "7px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                        }}
                      >
                        <Eye size={13} />
                        Lihat Bukti
                      </button>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                          fontStyle: "italic",
                        }}
                      >
                        Belum upload
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 16px" }}>{getStatusBadge(tx.status)}</td>

                  {/* Validasi */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {tx.status === "pending" ? (
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleApprove(tx)}
                          disabled={processingId === tx.id || !tx.payment_image_url}
                          title={!tx.payment_image_url ? "Tunggu user upload bukti" : "Approve transaksi"}
                          style={{
                            padding: "7px 14px",
                            background:
                              processingId === tx.id || !tx.payment_image_url
                                ? "#d1fae5"
                                : "#22c55e",
                            color:
                              processingId === tx.id || !tx.payment_image_url
                                ? "#6b7280"
                                : "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor:
                              processingId === tx.id || !tx.payment_image_url
                                ? "not-allowed"
                                : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            opacity: processingId === tx.id ? 0.6 : 1,
                            whiteSpace: "nowrap",
                            boxShadow: !tx.payment_image_url ? "none" : "0 2px 6px rgba(34,197,94,0.3)",
                          }}
                        >
                          {processingId === tx.id ? (
                            <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <Check size={12} />
                          )}
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(tx)}
                          disabled={processingId === tx.id}
                          style={{
                            padding: "7px 14px",
                            background: processingId === tx.id ? "#fee2e2" : "#ef4444",
                            color: processingId === tx.id ? "#6b7280" : "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: processingId === tx.id ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            opacity: processingId === tx.id ? 0.6 : 1,
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
                          }}
                        >
                          {processingId === tx.id ? (
                            <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <X size={12} />
                          )}
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        {getStatusBadge(tx.status)}
                        {tx.verified_at && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            {new Date(tx.verified_at).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div
          onClick={() => setShowImageModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "90%",
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              animation: "slideUp 0.3s ease",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              <X size={16} />
            </button>
            <h4 style={{ marginBottom: "16px", fontWeight: 700, color: "var(--primary)" }}>
              📸 Bukti Pembayaran
            </h4>
            <img
              src={selectedImage}
              alt="Payment Proof"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "12px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0); }
          10%, 30% { transform: rotate(-8deg); }
          20%, 40% { transform: rotate(8deg); }
          50% { transform: rotate(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

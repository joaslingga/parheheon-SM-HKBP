"use client";

import { X, Loader2, ShoppingCart, Coins, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const PRICE_PER_TOKEN = 10000;
const MIN_TOKENS = 1;
const MAX_TOKENS = 100;

const QUICK_PACKAGES = [
  { coins: 5, label: "Starter", badge: null, color: "#6366f1" },
  { coins: 10, label: "Popular", badge: "🔥 Populer", color: "#f59e0b" },
  { coins: 20, label: "Value", badge: "⚡ Best Value", color: "#10b981" },
  { coins: 50, label: "Premium", badge: "👑 Premium", color: "#8b5cf6" },
];

export default function TokenPurchaseModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(10);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalPrice = tokenAmount * PRICE_PER_TOKEN;

  const handleAmountChange = (value) => {
    const num = parseInt(value) || 0;
    if (num >= MIN_TOKENS && num <= MAX_TOKENS) {
      setTokenAmount(num);
    }
  };

  const handleSubmit = async () => {
    if (tokenAmount < MIN_TOKENS || tokenAmount > MAX_TOKENS) {
      return;
    }
    await onSubmit(tokenAmount);
  };

  const handleQuickSelect = (amount) => {
    setTokenAmount(amount);
    setCustomMode(false);
  };

  if (!isOpen || !isMounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          maxWidth: "460px",
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #FB8500, #FDB462)",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: "12px",
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>💰</span>
            </div>
            <div>
              <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.15rem", marginBottom: "2px" }}>
                Beli Coin Voting
              </h3>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>
                1 Coin = Rp 10.000 · Bayar via QRIS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              cursor: isLoading ? "not-allowed" : "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Package Quick Select */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--primary)",
                marginBottom: "12px",
              }}
            >
              Pilih Paket Coin
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {QUICK_PACKAGES.map((pkg) => {
                const isSelected = tokenAmount === pkg.coins && !customMode;
                return (
                  <button
                    key={pkg.coins}
                    onClick={() => handleQuickSelect(pkg.coins)}
                    disabled={isLoading}
                    style={{
                      padding: "14px 12px",
                      border: isSelected ? `2px solid ${pkg.color}` : "2px solid var(--border)",
                      background: isSelected ? `${pkg.color}12` : "white",
                      borderRadius: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isLoading) {
                        e.currentTarget.style.borderColor = pkg.color;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: pkg.color,
                          color: "white",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: "8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pkg.badge}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 900,
                        color: isSelected ? pkg.color : "var(--primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {pkg.coins}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: isSelected ? pkg.color : "var(--text-muted)",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      Coin
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: isSelected ? pkg.color : "#374151",
                      }}
                    >
                      Rp {(pkg.coins * PRICE_PER_TOKEN).toLocaleString("id-ID")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Toggle */}
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setCustomMode((v) => !v)}
              disabled={isLoading}
              style={{
                background: "none",
                border: "1px dashed var(--border)",
                color: "var(--primary)",
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <Zap size={14} />
              {customMode ? "Tutup Custom" : "Masukkan Jumlah Custom"}
            </button>

            {customMode && (
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => handleAmountChange(tokenAmount - 1)}
                  disabled={isLoading || tokenAmount <= MIN_TOKENS}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "2px solid var(--border)",
                    background: "white",
                    borderRadius: "10px",
                    cursor: tokenAmount <= MIN_TOKENS ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    opacity: tokenAmount <= MIN_TOKENS ? 0.4 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => {
                    handleAmountChange(e.target.value);
                    setCustomMode(true);
                  }}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "2px solid var(--primary)",
                    borderRadius: "10px",
                    fontSize: "1.1rem",
                    textAlign: "center",
                    fontWeight: 800,
                    color: "var(--primary)",
                    outline: "none",
                  }}
                  min={MIN_TOKENS}
                  max={MAX_TOKENS}
                />
                <button
                  onClick={() => handleAmountChange(tokenAmount + 1)}
                  disabled={isLoading || tokenAmount >= MAX_TOKENS}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "2px solid var(--border)",
                    background: "white",
                    borderRadius: "10px",
                    cursor: tokenAmount >= MAX_TOKENS ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    opacity: tokenAmount >= MAX_TOKENS ? 0.4 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(251,133,0,0.08), rgba(253,180,98,0.08))",
              border: "1px solid rgba(251,133,0,0.25)",
              padding: "16px",
              borderRadius: "14px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                fontSize: "0.88rem",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Jumlah Coin</span>
              <span style={{ fontWeight: 700, color: "#d97706" }}>💰 {tokenAmount} Coin</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                fontSize: "0.88rem",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>Harga per Coin</span>
              <span>Rp 10.000</span>
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(251,133,0,0.2)",
                paddingTop: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>Total Bayar</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FB8500" }}>
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              padding: "12px 14px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "0.82rem",
              color: "#4f46e5",
              lineHeight: 1.6,
            }}
          >
            ℹ️ Setelah klik lanjut, scan QRIS lalu upload bukti pembayaran.
            Coin akan ditambahkan setelah admin memverifikasi.
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: "0 0 auto",
                padding: "13px 20px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "13px 20px",
                background: isLoading
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #FB8500, #FDB462)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.98rem",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: isLoading ? "none" : "0 4px 12px rgba(251,133,0,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  Memproses...
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Lanjut ke Pembayaran
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import TokenPurchaseModal from "./TokenPurchaseModal";
import PaymentQRISDisplay from "./PaymentQRISDisplay";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { 
  createTokenPurchaseAction, 
  getQRISSettingsAction,
  getUserPendingTransactionsAction 
} from "@/app/actions";

export default function TokenShop({ session, userCoins, onCoinsUpdate }) {
  const [isMounted, setIsMounted] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [qrisSettings, setQrisSettings] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const loadData = async () => {
      try {
        const qris = await getQRISSettingsAction();
        if (qris.success) {
          setQrisSettings(qris.qris);
        }

        if (session?.id) {
          const pending = await getUserPendingTransactionsAction(session.id);
          if (pending.success) {
            setPendingTransactions(pending.transactions || []);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [session?.id]);

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
    setErrorMessage("");
  };

  const handlePurchaseSubmit = async (coinAmount) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await createTokenPurchaseAction(session.id, coinAmount);

      if (result.success) {
        setCurrentTransaction(result.data);
        setShowPurchaseModal(false);
        setShowPaymentModal(true);
      } else {
        setErrorMessage(result.error || "Gagal membuat pemesanan");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setErrorMessage("Terjadi kesalahan saat membuat pemesanan");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setCurrentTransaction(null);
  };

  if (!isMounted) {
    return (
      <div style={{ padding: "24px", textAlign: "center", background: "var(--bg-light)", borderRadius: "16px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Memuat Token Shop...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div>
      {/* Main Token Shop Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(253, 180, 98, 0.1), rgba(251, 133, 0, 0.1))",
          borderLeft: "4px solid var(--secondary)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "20px" }}>
          {/* Left side - Info */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>💰</span>
              Beli Coin Voting
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
              Setiap coin memungkinkan Anda untuk memberikan vote kepada satu kandidat dalam
              kategori voting. 1 coin = Rp 10.000
            </p>

            {/* Current Balance */}
            <div
              style={{
                background: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>Coin Anda:</span>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {userCoins || 0}
              </span>
            </div>

            {/* Pending Transactions Info */}
            {pendingTransactions.length > 0 && (
              <div
                style={{
                  background: "rgba(251, 180, 98, 0.2)",
                  border: "1px solid var(--secondary)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertCircle
                    size={16}
                    style={{ color: "var(--secondary)", flexShrink: 0, marginTop: "2px" }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>
                      Anda memiliki {pendingTransactions.length} transaksi menunggu validasi
                    </p>
                    {pendingTransactions.map(tx => (
                      <p key={tx.id} style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                        • {tx.coins_amount} coin (Rp {tx.amount.toLocaleString('id-ID')})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid var(--accent)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-start",
                  fontSize: "0.9rem",
                  color: "var(--accent)",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right side - Buy Button */}
          <button
            onClick={handlePurchaseClick}
            disabled={isLoading}
            style={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "linear-gradient(135deg, var(--secondary), var(--primary))";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "linear-gradient(135deg, var(--primary), var(--secondary))";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <ShoppingCart size={20} />
            {isLoading ? "Memproses..." : "Beli Coin"}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "var(--bg-light)",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎯</div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>Mudah</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Proses pembelian yang cepat dan mudah
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-light)",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💳</div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>QRIS</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Pembayaran via QRIS statis terpercaya
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-light)",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⚡</div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>Instan</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Coin langsung tersedia setelah verifikasi
          </p>
        </div>
      </div>

      {/* Modals */}
      <TokenPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSubmit={handlePurchaseSubmit}
        isLoading={isLoading}
      />

      {currentTransaction && qrisSettings && (
        <PaymentQRISDisplay
          isOpen={showPaymentModal}
          onClose={handlePaymentClose}
          transactionId={currentTransaction.transaction_id}
          coinAmount={currentTransaction.coins_amount}
          totalPrice={currentTransaction.amount}
          qrisImage={qrisSettings.qris_image_url}
          merchantName={qrisSettings.merchant_name}
          accountName={qrisSettings.account_name}
          session={session}
        />
      )}
    </div>
  );
}

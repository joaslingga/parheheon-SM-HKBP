"use client";

import { X, Upload, CheckCircle, AlertCircle, Loader2, Copy, Camera, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { uploadPaymentProofAction } from "@/app/actions";

export default function PaymentQRISDisplay({
  isOpen,
  onClose,
  transactionId,
  coinAmount,
  totalPrice,
  qrisImage,
  merchantName,
  accountName,
  session,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file tidak boleh lebih dari 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMessage("Format file harus JPG, PNG, atau WebP");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setUploadStatus(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !transactionId) {
      setErrorMessage("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setUploadStatus("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("transactionId", transactionId);
      formData.append("paymentProof", selectedFile);

      const result = await uploadPaymentProofAction(formData);

      if (result.success) {
        setUploadStatus("success");
      } else {
        setUploadStatus("error");
        setErrorMessage(result.error || "Gagal mengunggah bukti pembayaran");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrorMessage("Terjadi kesalahan saat mengunggah file");
    }
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  if (!isOpen || !isMounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflowY: "auto",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={uploadStatus !== "loading" ? onClose : undefined}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "0",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          animation: "slideUp 0.3s ease",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.15rem", marginBottom: "2px" }}>
              💳 Pembayaran QRIS
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>
              Transaksi #{transactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploadStatus === "loading"}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: uploadStatus === "loading" ? "not-allowed" : "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: uploadStatus === "loading" ? 0.5 : 1,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* ===== SUCCESS STATE ===== */}
          {uploadStatus === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              {/* Animated Success Icon */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  animation: "popIn 0.5s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.4)",
                }}
              >
                <CheckCircle size={40} color="white" />
              </div>

              <h3
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "#16a34a",
                  marginBottom: "10px",
                }}
              >
                Bukti Pembayaran Dikirim!
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px", fontSize: "0.93rem" }}>
                Terima kasih! Bukti pembayaran Anda telah berhasil diunggah.
              </p>

              {/* Waiting Notification Box */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(251,133,0,0.08), rgba(253,180,98,0.08))",
                  border: "2px solid #FB8500",
                  borderRadius: "16px",
                  padding: "20px",
                  textAlign: "left",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, #FB8500, #FDB462)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      animation: "pulse 2s ease infinite",
                    }}
                  >
                    <Clock size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#FB8500", fontSize: "1rem" }}>
                      Tunggu Konfirmasi Pembayaran
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#d97706" }}>
                      Admin akan memverifikasi pembayaran Anda
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#78350f", lineHeight: 1.6 }}>
                  <div style={{ marginBottom: "6px" }}>✅ Bukti pembayaran berhasil diterima</div>
                  <div style={{ marginBottom: "6px" }}>⏳ Menunggu verifikasi oleh admin</div>
                  <div>💰 Coin akan langsung ditambahkan setelah diverifikasi</div>
                </div>
              </div>

              {/* Transaction Summary */}
              <div
                style={{
                  background: "var(--bg-light)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  Pembelian {coinAmount} Coin
                </span>
                <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                  Rp {Number(totalPrice).toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Kembali ke Beranda
              </button>
            </div>
          ) : (
            <>
              {/* Transaction Info */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
                  border: "1px solid rgba(99,102,241,0.2)",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>
                    Total Pembayaran
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
                    Rp {Number(totalPrice).toLocaleString("id-ID")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>
                    Dapatkan
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#d97706",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    💰 {coinAmount} Coin
                  </div>
                </div>
              </div>

              {/* QRIS Section */}
              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    1
                  </span>
                  Scan QRIS dengan Aplikasi Pembayaran
                </h4>

                <div
                  style={{
                    background: "#f8f9ff",
                    border: "2px solid rgba(99,102,241,0.15)",
                    padding: "20px",
                    borderRadius: "14px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={
                      qrisImage ||
                      "https://images.unsplash.com/photo-1610700596007-11502861dcfa?q=80&w=400&auto=format&fit=crop"
                    }
                    alt="QRIS Code"
                    style={{
                      maxWidth: "220px",
                      maxHeight: "220px",
                      margin: "0 auto",
                      borderRadius: "8px",
                      display: "block",
                    }}
                  />
                </div>

                {merchantName && (
                  <div
                    style={{
                      marginTop: "10px",
                      background: "rgba(251,133,0,0.08)",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>
                      Atas Nama: <strong style={{ color: "var(--primary)" }}>{accountName || merchantName}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyText(accountName || merchantName, "nama")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      <Copy size={13} />
                      {copiedText === "nama" ? "Tersalin!" : "Salin"}
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    2
                  </span>
                  Unggah Bukti Transfer Sukses <span style={{ color: "#ef4444" }}>*</span>
                </h4>

                {/* Drop Zone */}
                <div
                  style={{
                    border: `2px dashed ${previewUrl ? "#22c55e" : "var(--border)"}`,
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    background: previewUrl ? "rgba(34,197,94,0.04)" : "var(--bg-light)",
                    cursor: uploadStatus === "loading" ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: uploadStatus === "loading" ? 0.5 : 1,
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (uploadStatus !== "loading") {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.background = "rgba(99,102,241,0.04)";
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = previewUrl ? "#22c55e" : "var(--border)";
                    e.currentTarget.style.background = previewUrl
                      ? "rgba(34,197,94,0.04)"
                      : "var(--bg-light)";
                  }}
                  onDrop={handleDrop}
                  onClick={() => !uploadStatus && fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "160px",
                          objectFit: "contain",
                          borderRadius: "8px",
                          marginBottom: "10px",
                        }}
                      />
                      <p style={{ fontWeight: 600, color: "#22c55e", marginBottom: "4px", fontSize: "0.88rem" }}>
                        ✓ {selectedFile.name}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        style={{
                          marginTop: "8px",
                          background: "none",
                          border: "1px solid var(--border)",
                          color: "var(--primary)",
                          cursor: "pointer",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                        }}
                      >
                        Ganti File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera size={36} style={{ color: "var(--primary)", margin: "0 auto 10px", display: "block", opacity: 0.7 }} />
                      <p style={{ fontWeight: 600, marginBottom: "4px", fontSize: "0.9rem", color: "var(--primary)" }}>
                        Klik atau drag foto bukti transfer sukses ke sini *
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        JPG, PNG, WebP — Maks 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploadStatus === "loading"}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {(uploadStatus === "error" || errorMessage) && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "0.88rem", color: "#dc2626" }}>{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={onClose}
                  disabled={uploadStatus === "loading"}
                  style={{
                    flex: "0 0 auto",
                    padding: "12px 20px",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: uploadStatus === "loading" ? "not-allowed" : "pointer",
                    opacity: uploadStatus === "loading" ? 0.5 : 1,
                  }}
                >
                  Nanti
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadStatus === "loading"}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background:
                      !selectedFile || uploadStatus === "loading"
                        ? "#d1d5db"
                        : "linear-gradient(135deg, var(--primary), var(--secondary))",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: !selectedFile || uploadStatus === "loading" ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {uploadStatus === "loading" ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Kirim Bukti Pembayaran
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,133,0,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(251,133,0,0); }
        }
      `}</style>
    </div>
  );
}

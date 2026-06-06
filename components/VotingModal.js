"use client";

import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function VotingModal({
  isOpen,
  candidateName,
  categoryName,
  status, // 'success' | 'error' | 'confirm'
  message,
  errorMessage,
  onConfirm,
  onCancel,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={24} />
        </button>

        {/* Content */}
        {status === "success" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <CheckCircle
                size={48}
                style={{ color: "var(--success)", animation: "popIn 0.5s ease" }}
              />
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--primary)",
              }}
            >
              Vote Berhasil! 🎉
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              Terima kasih telah memberikan vote untuk <strong>{candidateName}</strong> di
              kategori <strong>{categoryName}</strong>. Suara Anda telah dicatat.
            </p>
            {message && (
              <p
                style={{
                  color: "var(--success)",
                  fontSize: "0.9rem",
                  marginBottom: "20px",
                  fontWeight: 500,
                }}
              >
                {message}
              </p>
            )}
            <button
              onClick={onCancel}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--primary)";
              }}
            >
              Tutup
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <AlertCircle
                size={48}
                style={{ color: "var(--accent)", animation: "shake 0.5s ease" }}
              />
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--accent)",
              }}
            >
              Vote Gagal
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              {errorMessage || "Terjadi kesalahan saat memproses vote Anda."}
            </p>
            <button
              onClick={onCancel}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {status === "confirm" && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "3rem",
              }}
            >
              👉 
            </div>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--primary)",
              }}
            >
              Konfirmasi Vote
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              Apakah Anda yakin ingin memberikan vote untuk <strong>{candidateName}</strong> di kategori{" "}
              <strong>{categoryName}</strong>?
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--accent)",
                marginBottom: "20px",
                fontWeight: 500,
              }}
            >
              ⚠️ 1 Token akan dikurangi dari akun Anda.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onCancel}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "var(--border)",
                  color: "var(--primary)",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.background = "var(--secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.background = "var(--border)";
                }}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: isLoading ? "#ccc" : "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, var(--secondary), var(--primary))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "linear-gradient(135deg, var(--primary), var(--secondary))";
                  }
                }}
              >
                {isLoading ? "Memproses..." : "Ya, Vote Sekarang"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
}

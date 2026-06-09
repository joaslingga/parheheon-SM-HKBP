"use client";

import { useState } from "react";
import { loginAction, registerAction } from "../actions";
import Link from "next/link";
import { Lock, User, ArrowLeft, ShieldAlert, CheckCircle2, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("Login berhasil! Mengalihkan...");
        // Hard redirect so server-side session cookie is picked up
        setTimeout(() => {
          if (res.role === "superadmin") {
            window.location.href = "/suadminutama";
          } else if (res.role === "admin") {
            window.location.href = "/adminutama";
          } else {
            window.location.href = "/";
          }
        }, 800);
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await registerAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman utama...");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card" style={{ maxWidth: "460px" }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "24px",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft size={16} /> Kembali ke Home
        </Link>

        {/* Logo / Brand */}
        <div className="login-header">
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "1.5rem",
              boxShadow: "0 6px 16px rgba(30,58,138,0.3)",
            }}
          >
            🎉
          </div>
          <div className="login-logo" style={{ fontSize: "1.6rem" }}>
            Parheheon<span className="brand-dot">.</span>
          </div>
          <p className="login-subtitle">
            Festival Sekolah Minggu HKBP Ciputat 2026
          </p>
        </div>

        {/* Alert messages */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "20px" }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-username"
                name="username"
                type="text"
                required
                placeholder="Masukkan username Anda"
                className="form-input"
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan password Anda"
                className="form-input"
                style={{ paddingLeft: "40px", paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "0",
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-pulse-primary"
            style={{ marginTop: "8px", width: "100%", padding: "14px", fontSize: "1rem" }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }}
                />
                Memproses...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <LogIn size={18} /> Masuk Sekarang
              </span>
            )}
          </button>

          {/* Default credentials hint */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              background: "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: "10px",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "6px" }}>💡dimohon daftar di perwakilan Lunggu </p>
            <p>atau kontak kami </p>
            <p>Admin: <strong>admin1</strong> / <strong>admin2</strong></p>
            <p style={{ marginTop: "2px" }}>sabbam: <strong>08170220283</strong> </p>
            <p style={{ marginTop: "2px" }}>Joas: <strong>081370464463</strong> </p>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
}

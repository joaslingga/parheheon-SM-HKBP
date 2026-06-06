"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "../app/actions";
import { 
  LogIn, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Menu, 
  X, 
  Home, 
  Sparkles, 
  Phone, 
  Ticket, 
  Award, 
  Coins, 
  ChevronDown 
} from "lucide-react";
import { useState } from "react";

export default function Navbar({ session }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [fiturOpen, setFiturOpen] = useState(false);

  async function handleLogout() {
    await logoutAction();
    window.location.href = "/";
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="brand" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
            color: "white",
            padding: "8px",
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(30,58,138,0.25)",
            fontSize: "1.2rem"
          }}>
            🎉
          </span>
          <span style={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
            Parheheon<span className="brand-dot">.</span>
          </span>
        </Link>


        {/* Desktop Menu */}
        <ul className={`nav-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Coin Badge — ditampilkan di sebelah kiri Home jika user login */}
          {session && session.role === "user" && (
            <li>
              <div
                id="navbar-coin-badge"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, #FDB462, #FB8500)",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: "0 3px 10px rgba(251,133,0,0.35)",
                  letterSpacing: "0.02em",
                  cursor: "default",
                  userSelect: "none",
                }}
                title="Jumlah Coin yang Anda miliki"
              >
                💰 {session.coins !== undefined ? session.coins : 0} Coin
              </div>
            </li>
          )}

          {/* Dropdown 1: Informasi Acara */}
          <li className="navbar-item-dropdown">
            <div 
              className="nav-link dropdown-trigger" 
              onClick={() => {
                if (window.innerWidth <= 767) {
                  setInfoOpen(!infoOpen);
                  setFiturOpen(false);
                }
              }}
            >
              <span>Informasi Acara</span>
              <ChevronDown size={14} className="dropdown-chevron" />
            </div>
            <div className={`dropdown-menu ${infoOpen ? "mobile-open" : ""}`}>
              <a href="#home" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}>
                  <Home size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Beranda</span>
                  <span className="dropdown-item-desc">Halaman utama & sambutan panitia</span>
                </div>
              </a>
              <a href="#highlight" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(234, 179, 8, 0.08)", color: "#eab308" }}>
                  <Sparkles size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Highlight Acara</span>
                  <span className="dropdown-item-desc">Rangkaian kegiatan festival menarik</span>
                </div>
              </a>
              <a href="#kontak" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(34, 197, 94, 0.08)", color: "#22c55e" }}>
                  <Phone size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Hubungi Kami</span>
                  <span className="dropdown-item-desc">Alamat gereja & kontak sekretariat</span>
                </div>
              </a>
            </div>
          </li>

          {/* Dropdown 2: Fitur Interaktif */}
          <li className="navbar-item-dropdown">
            <div 
              className="nav-link dropdown-trigger"
              onClick={() => {
                if (window.innerWidth <= 767) {
                  setFiturOpen(!fiturOpen);
                  setInfoOpen(false);
                }
              }}
            >
              <span>Fitur Layanan</span>
              <ChevronDown size={14} className="dropdown-chevron" />
            </div>
            <div className={`dropdown-menu ${fiturOpen ? "mobile-open" : ""}`}>
              <a href="#reservasi" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(99, 102, 241, 0.08)", color: "#6366f1" }}>
                  <Ticket size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Pesan Tiket (Reservasi)</span>
                  <span className="dropdown-item-desc">Pesan nomor kursi nonton festival</span>
                </div>
              </a>
              <a href="#token-shop" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(251, 133, 0, 0.08)", color: "#fb8500" }}>
                  <Coins size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Beli Coin Dukungan</span>
                  <span className="dropdown-item-desc">Top up koin voting untuk kelas favorit</span>
                </div>
              </a>
              <a href="#voting" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="dropdown-item-icon" style={{ background: "rgba(244, 63, 94, 0.08)", color: "#f43f5e" }}>
                  <Award size={18} />
                </div>
                <div className="dropdown-item-content">
                  <span className="dropdown-item-title">Voting Online</span>
                  <span className="dropdown-item-desc">Dukung penampilan kelas sekolah minggu</span>
                </div>
              </a>
            </div>
          </li>

          {session ? (
            <li className="user-badge">
              <User size={16} />
              <span>{session.name}</span>
              <span className="role-tag">{session.role}</span>

              {session.role === "admin" && (
                <Link
                  href="/adminutama"
                  className="nav-link"
                  style={{
                    color: "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
              {session.role === "superadmin" && (
                <Link
                  href="/suadminutama"
                  className="nav-link"
                  style={{
                    color: "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <LayoutDashboard size={14} /> Superadmin
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 600,
                  paddingLeft: "10px",
                }}
              >
                <LogOut size={16} /> Keluar
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login" className="nav-link nav-btn btn-pulse-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "none" }}>
                <LogIn size={16} />
                Log In
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--primary)",
          }}
          className="mobile-toggle-btn-style"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        /* Navigation dropdown styling */
        .navbar-item-dropdown {
          position: relative;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
        }

        .dropdown-chevron {
          transition: transform 0.2s ease;
        }

        .navbar-item-dropdown:hover .dropdown-chevron {
          transform: rotate(180deg);
        }

        /* Dropdown Menu Desktop */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: white;
          min-width: 320px;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border);
          padding: 16px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 1000;
        }

        .dropdown-menu::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: white;
          border-left: 1px solid var(--border);
          border-top: 1px solid var(--border);
        }

        .navbar-item-dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        /* Dropdown Item */
        .dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          transition: all 0.2s ease;
          text-align: left;
          text-decoration: none;
          width: 100%;
        }

        .dropdown-item:hover {
          background: rgba(30, 58, 138, 0.04);
        }

        .dropdown-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          flex-shrink: 0;
          font-size: 1rem;
        }

        .dropdown-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dropdown-item-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary);
        }

        .dropdown-item-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        @media (max-width: 767px) {
          .mobile-toggle-btn-style {
            display: block !important;
          }
          .nav-menu {
            display: none !important;
            flex-direction: column;
            width: 100%;
          }
          .nav-menu.mobile-open {
            display: flex !important;
            flex-direction: column;
            width: 100%;
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            padding: 20px;
            box-shadow: var(--shadow-md);
            gap: 16px;
            align-items: flex-start;
            z-index: 999;
          }
          .user-badge {
            flex-direction: column;
            align-items: flex-start;
            border-radius: var(--radius-sm);
            width: 100%;
            padding: 12px;
          }
          
          /* Mobile dropdown */
          .dropdown-menu {
            position: static;
            transform: none !important;
            box-shadow: none;
            border: none;
            padding: 0 0 0 16px;
            width: 100%;
            opacity: 1;
            visibility: visible;
            display: none;
          }
          
          .dropdown-menu.mobile-open {
            display: flex;
          }
          
          .dropdown-menu::before {
            display: none;
          }
          
          .dropdown-trigger {
            width: 100%;
            justify-content: space-between;
            padding: 8px 12px;
          }
        }
      `}</style>
    </nav>
  );
}

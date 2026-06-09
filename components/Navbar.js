"use client";

import { useRouter, usePathname } from "next/navigation";
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
  ChevronDown 
} from "lucide-react";
import { useState } from "react";

export default function Navbar({ session }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build href: on homepage use anchor (#home), on other pages use absolute (/#home)
  const homeHref = isHome ? "#home" : "/#home";
  const highlightHref = isHome ? "#highlight" : "/#highlight";
  const contentHref = isHome ? "#content" : "/#content";
  const reservasiActive = pathname === "/reservasi";

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


          <li>
            <a href={homeHref} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Beranda
            </a>
          </li>
          <li>
            <a href={highlightHref} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Highlight 
            </a>
          </li>
          <li>
            <a href={contentHref} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Content
            </a>
          </li>
          <li>
            <Link
              href="/reservasi"
              className={`nav-link${reservasiActive ? " nav-link-active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Reservasi Tiket
            </Link>
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

      <style dangerouslySetInnerHTML={{ __html: `
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
            padding: 24px;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
            border-bottom: 2px solid #e2e8f0;
            gap: 16px;
            align-items: flex-start;
            z-index: 999;
            animation: slideDownMenu 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes slideDownMenu {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
      ` }} />
    </nav>
  );
}

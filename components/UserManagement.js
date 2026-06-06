"use client";

import { useState, useEffect } from "react";
import { registerAction, getAllUsersAction, updateUserRoleAction, deleteUserAction } from "../app/actions";
import { UserPlus, X, CheckCircle, AlertCircle, Trash2, Shield, User as UserIcon, Settings, RefreshCw } from "lucide-react";

export default function UserManagement() {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setFetching(true);
    try {
      const res = await getAllUsersAction();
      if (res?.success) {
        setUsers(res.users);
      } else {
        setError(res?.error || "Gagal mengambil daftar user.");
      }
    } catch (err) {
      setError("Gagal mengambil daftar user.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("username", formData.username);
    data.append("password", formData.password);
    data.append("role", formData.role);

    try {
      const res = await registerAction(null, data);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(`${formData.role === "admin" ? "Admin" : "User"} baru berhasil ditambahkan!`);
        setFormData({ name: "", username: "", password: "", role: "user" });
        await fetchUsers(); // Refresh list
        setTimeout(() => {
          setShowForm(false);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menambahkan user.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError("");
    setSuccess("");
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("Role berhasil diperbarui!");
        await fetchUsers(); // Refresh list
        setTimeout(() => setSuccess(""), 2500);
      }
    } catch (err) {
      setError("Gagal memperbarui role.");
    }
  }

  async function handleDelete(userId, userName) {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"? Semua data terkait user ini akan terpengaruh.`)) {
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await deleteUserAction(userId);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("User berhasil dihapus.");
        await fetchUsers(); // Refresh list
        setTimeout(() => setSuccess(""), 2500);
      }
    } catch (err) {
      setError("Gagal menghapus user.");
    }
  }

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const superAdminCount = users.filter(u => u.role === "superadmin").length;
  const regularUserCount = users.filter(u => u.role === "user").length;

  return (
    <div className="user-management-section" style={{
      backgroundColor: "#fff",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
      border: "1px solid #e2e8f0",
      marginBottom: "20px"
    }}>
      {/* Alerts */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: "20px" }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
            <Settings size={22} style={{ color: "#3b82f6" }} /> Manajemen User & Hak Akses (Role)
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            Lihat daftar pengguna, ganti role (hak akses), atau hapus akun pengguna.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchUsers}
            disabled={fetching}
            style={{
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <RefreshCw size={16} className={fetching ? "spin-animation" : ""} /> Refresh
          </button>
          
          <button
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            style={{
              backgroundColor: showForm ? "#ef4444" : "#10b981",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: showForm ? "0 4px 10px rgba(239,68,68,0.2)" : "0 4px 10px rgba(16,185,129,0.2)"
            }}
          >
            {showForm ? (
              <>
                <X size={16} /> Tutup Form
              </>
            ) : (
              <>
                <UserPlus size={16} /> Tambah Akun Baru
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>TOTAL PENGGUNA</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>{totalUsers}</div>
        </div>
        <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "16px", border: "1px solid #dbeafe" }}>
          <div style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 600 }}>REGULAR USERS</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>{regularUserCount}</div>
        </div>
        <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "16px", border: "1px solid #d1fae5" }}>
          <div style={{ fontSize: "0.82rem", color: "#059669", fontWeight: 600 }}>ADMIN UTAMA</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#065f46", marginTop: "4px" }}>{adminCount}</div>
        </div>
        <div style={{ background: "#fff7ed", padding: "16px", borderRadius: "16px", border: "1px solid #ffedd5" }}>
          <div style={{ fontSize: "0.82rem", color: "#ea580c", fontWeight: 600 }}>SUPER ADMIN</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#9a3412", marginTop: "4px" }}>{superAdminCount}</div>
        </div>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div style={{
          backgroundColor: "#f8fafc",
          padding: "24px",
          borderRadius: "20px",
          marginBottom: "28px",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
            Form Registrasi Akun Baru
          </h3>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#334155", fontSize: "0.88rem" }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#334155", fontSize: "0.88rem" }}>
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Contoh: budi123"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#334155", fontSize: "0.88rem" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 karakter"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#334155", fontSize: "0.88rem" }}>
                Tingkat Hak Akses (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  backgroundColor: "white",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="user">👤 User Biasa</option>
                <option value="admin">👨‍💼 Admin Utama</option>
                <option value="superadmin">👨‍💻 Super Admin</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#cbd5e1" : "#2563eb",
                  color: "white",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  width: "100%",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
                }}
              >
                {loading ? "Memproses..." : "Daftarkan Pengguna Baru"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List Table */}
      {fetching ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <RefreshCw size={32} className="spin-animation" style={{ color: "#3b82f6", opacity: 0.7, marginBottom: "12px" }} />
          <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>Mengambil data user...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: "40px 20px", background: "#f8fafc", borderRadius: "20px" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada pengguna yang terdaftar.</p>
        </div>
      ) : (
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>ID</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th style={{ width: "120px" }}>Coin Balance</th>
                <th style={{ width: "240px" }}>Hak Akses (Role)</th>
                <th style={{ width: "100px", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 800, color: "#64748b" }}>#{user.id}</td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{user.name}</td>
                  <td>
                    <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "8px", fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>
                      @{user.username}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "50px", fontSize: "0.85rem", fontWeight: 700 }}>
                      💰 {user.coins || 0}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Current Role Icon */}
                      {user.role === "superadmin" ? (
                        <Shield size={16} style={{ color: "#ea580c" }} />
                      ) : user.role === "admin" ? (
                        <Shield size={16} style={{ color: "#16a34a" }} />
                      ) : (
                        <UserIcon size={16} style={{ color: "#2563eb" }} />
                      )}
                      
                      {/* Role Dropdown */}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          backgroundColor: "#f8fafc",
                          cursor: "pointer",
                          color: user.role === "superadmin" ? "#c2410c" : user.role === "admin" ? "#15803d" : "#1d4ed8"
                        }}
                      >
                        <option value="user" style={{ color: "#1d4ed8" }}>👤 User Biasa</option>
                        <option value="admin" style={{ color: "#15803d" }}>👨‍💼 Admin Utama</option>
                        <option value="superadmin" style={{ color: "#c2410c" }}>👨‍💻 Super Admin</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="premium-btn-action delete"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", width: "auto" }}
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CSS Spin Animation */}
      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

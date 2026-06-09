"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Armchair,
  Save,
  RotateCcw,
  LayoutGrid,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import SeatMap from "./SeatMap";
import {
  updateSeatLayoutAction,
  resetSeatLayoutAction,
} from "../app/actions";
import { formatPrice, CATEGORY_ORDER } from "../lib/seatData";

export default function AdminSeatReservation({
  categories,
  bookedSeatIds,
  pendingSeatIds = [],
  seatStats,
  isAdmin,
}) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [layoutDraft, setLayoutDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCategories = editMode && layoutDraft ? layoutDraft : categories;

  function startEditLayout() {
    const draft = {};
    for (const key of CATEGORY_ORDER) {
      const cat = categories[key];
      if (!cat) continue;
      draft[key] = {
        name: cat.name,
        price: cat.price,
        order: cat.order,
        layout: { ...cat.layout },
        total: cat.total,
      };
    }
    setLayoutDraft(draft);
    setEditMode(true);
    setError("");
    setSuccess("");
  }

  function cancelEditLayout() {
    setEditMode(false);
    setLayoutDraft(null);
    setError("");
  }

  function updateLayoutField(key, field, value) {
    setLayoutDraft((prev) => {
      const next = { ...prev };
      const cat = { ...next[key], layout: { ...next[key].layout } };
      if (field === "price") {
        cat.price = parseInt(value, 10) || 0;
      } else {
        cat.layout[field] = Math.max(1, parseInt(value, 10) || 1);
        const { seatsPerRow, rows, sections } = cat.layout;
        cat.total = seatsPerRow * rows * sections;
      }
      next[key] = cat;
      return next;
    });
  }

  async function handleSaveLayout() {
    if (!confirm("Simpan perubahan layout kursi? Perubahan hanya memengaruhi kursi yang belum terbeli.")) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateSeatLayoutAction(layoutDraft);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Layout kursi berhasil disimpan.");
        setEditMode(false);
        setLayoutDraft(null);
        router.refresh();
      }
    } catch {
      setError("Gagal menyimpan layout.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetLayout() {
    if (
      !confirm(
        "Reset layout ke pengaturan default? Harga dan jumlah bangku akan kembali ke nilai awal."
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await resetSeatLayoutAction();
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Layout kursi direset ke default.");
        setEditMode(false);
        setLayoutDraft(null);
        router.refresh();
      }
    } catch {
      setError("Gagal mereset layout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Armchair size={28} />
          </div>
          <div className="stat-info">
            <h4>Total Kursi</h4>
            <p>{seatStats.totalSeats} Bangku</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#2563eb", backgroundColor: "#eff6ff" }}>
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h4>Kursi Terbeli</h4>
            <p>{seatStats.bookedSeats} Bangku</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#16a34a", backgroundColor: "#f0fdf4" }}>
            <CheckCircle2 size={28} />
          </div>
          <div className="stat-info">
            <h4>Kursi Tersedia</h4>
            <p>{seatStats.availableSeats} Bangku</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ maxWidth: "1200px", margin: "0 auto 24px" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ maxWidth: "1200px", margin: "0 auto 24px" }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LayoutGrid size={22} /> Denah & Harga Kategori Kursi
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "6px" }}>
              Kursi tersedia (warna zona) · Menunggu konfirmasi (kuning/orange) · Terkonfirmasi (putih)
            </p>
          </div>
          {isAdmin && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {!editMode ? (
                <button
                  type="button"
                  onClick={startEditLayout}
                  className="btn btn-secondary"
                  style={{ width: "auto", display: "inline-flex", gap: "6px" }}
                >
                  <LayoutGrid size={16} /> Edit Layout
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSaveLayout}
                    disabled={loading}
                    className="btn btn-secondary"
                    style={{ width: "auto", display: "inline-flex", gap: "6px" }}
                  >
                    <Save size={16} /> Simpan Layout
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditLayout}
                    className="btn btn-outline"
                    style={{ width: "auto" }}
                  >
                    Batal
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleResetLayout}
                disabled={loading}
                className="btn btn-outline"
                style={{ width: "auto", display: "inline-flex", gap: "6px" }}
              >
                <RotateCcw size={16} /> Reset Default
              </button>
            </div>
          )}
        </div>

        <div className="table-responsive" style={{ marginBottom: "24px" }}>
          <table className="data-table seat-config-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Kursi per baris</th>
                <th>Jumlah baris</th>
                <th>Jumlah blok</th>
                <th>Total kursi</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map((key) => {
                const cat = activeCategories[key];
                if (!cat) return null;
                const { seatsPerRow, rows, sections } = cat.layout;
                return (
                  <tr key={key}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="form-input seat-config-input"
                          value={seatsPerRow}
                          onChange={(e) =>
                            updateLayoutField(key, "seatsPerRow", e.target.value)
                          }
                        />
                      ) : (
                        seatsPerRow
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          min="1"
                          max="30"
                          className="form-input seat-config-input"
                          value={rows}
                          onChange={(e) => updateLayoutField(key, "rows", e.target.value)}
                        />
                      ) : (
                        rows
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="form-input seat-config-input"
                          value={sections}
                          onChange={(e) =>
                            updateLayoutField(key, "sections", e.target.value)
                          }
                        />
                      ) : (
                        sections
                      )}
                    </td>
                    <td>
                      <strong>{cat.total}</strong>
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          className="form-input seat-config-input seat-config-price"
                          value={cat.price}
                          onChange={(e) => updateLayoutField(key, "price", e.target.value)}
                        />
                      ) : (
                        formatPrice(cat.price)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="highlight-title" style={{ marginBottom: "16px" }}>
          Layout Posisi Duduk Penonton
        </h3>
        <SeatMap
          categories={activeCategories}
          bookedSeatIds={bookedSeatIds}
          pendingSeatIds={pendingSeatIds}
          readOnly
          showLegend={true}
          compact={false}
        />
      </div>
    </div>
  );
}

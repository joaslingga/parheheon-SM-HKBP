"use client";

import { useState } from "react";
import { createReservationAction, uploadReservationProofAction } from "../app/actions";
import { Ticket, CheckCircle2, ShieldAlert, UploadCloud, X, Loader2 } from "lucide-react";
import SeatMap from "./SeatMap";
import { formatPrice, parseSeatId } from "../lib/seatData";

const seatSpecs = [
  { name: "Kategori 1", seat: 24, totalBangku: 144, totalRow: 6, price: 200000 },
  { name: "Kategori 2", seat: 24, totalBangku: 120, totalRow: 5, price: 100000 },
  { name: "Kategori 3", seat: 24, totalBangku: 120, totalRow: 5, price: 50000 },
  { name: "Tribun 1", seat: 10, totalBangku: 10, totalRow: 1, price: 100000 },
  { name: "Tribun 2", seat: 16, totalBangku: 48, totalRow: 3, price: 50000 },
];

export default function BookingForm({ reservations, seatCategories, bookedSeatIds, pendingSeatIds = [], qris }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [pendingReservation, setPendingReservation] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const seatMap = new Map();
  for (const [key, category] of Object.entries(seatCategories)) {
    seatMap.set(key, category);
  }

  function handleSeatClick(seatId) {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, seatId];
    });
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const parsed = parseSeatId(seatId);
    if (!parsed) return sum;
    const cat = seatMap.get(parsed.categoryKey);
    if (!cat) return sum;
    return sum + (cat.price || 0);
  }, 0);

  async function handleBookTicket(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await createReservationAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setPendingReservation({
          id: res.reservationId,
          seats: [...selectedSeats],
          totalPrice: totalPrice,
        });
        setSelectedFile(null);
        setFilePreview(null);
        event.target.reset();
        setSelectedSeats([]);
      }
    } catch (err) {
      setError("Gagal membuat reservasi. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadProof(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setUploadLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("reservationId", pendingReservation.id);

    try {
      const res = await uploadReservationProofAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setPendingReservation(null);
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (err) {
      setError("Gagal mengunggah bukti pembayaran. Periksa koneksi Anda.");
    } finally {
      setUploadLoading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  }

  return (
    <div className="seat-booking-wrapper">
      {error && (
        <div className="alert alert-danger">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleBookTicket} className="booking-container">
        {/* Right column: Seating Chart Section */}
        <div className="seating-section">
          <div className="stage-label">PANGGUNG</div>
          
          <div className="seating-container">
            <SeatMap
              categories={seatCategories}
              bookedSeatIds={bookedSeatIds}
              pendingSeatIds={pendingSeatIds}
              selectedSeatIds={selectedSeats}
              onSeatClick={handleSeatClick}
              showLegend={false}
            />
            <input type="hidden" name="selectedSeats" value={selectedSeats.join(",")} />
          </div>

          {/* Door indicators */}
          <div className="door-indicators">
            <div className="door door-left">Pintu 4</div>
            <div className="door door-right">Pintu 3</div>
          </div>
        </div>

        {/* Bottom span: Summary Section */}
        <div className="summary-section">
          <div className="selected-seats">
            <h3>Tiket Terpilih</h3>
            <div className="seats-summary" id="seatsSummary">
              {selectedSeats.length === 0 ? (
                <p className="empty-message">Belum ada tiket yang dipilih</p>
              ) : (
                selectedSeats.map((seatId) => {
                  const parsed = parseSeatId(seatId);
                  if (!parsed) return null;
                  const cat = seatMap.get(parsed.categoryKey);
                  if (!cat) return null;
                  const seatCode = `${parsed.row}/${parsed.seat}`;
                  const priceDisplay = formatPrice(cat.price);
                  return (
                    <div key={seatId} className="seat-item" data-id={seatId}>
                      <div>
                        <div className="seat-code">{cat.name} - {seatCode}</div>
                        <div style={{ fontSize: "0.85em", color: "#666" }}>Tempat Duduk</div>
                      </div>
                      <div className="seat-price">{priceDisplay}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="checkout-section">
            <div className="total-amount">
              <span className="label">Total Harga:</span>
              <span className="amount">{formatPrice(totalPrice)}</span>
            </div>
            <button 
              type="submit" 
              className="checkout-btn" 
              disabled={loading || selectedSeats.length === 0}
            >
              {loading ? "Memproses Pemesanan..." : "Pesan Tiket Reservasi"}
            </button>
          </div>
        </div>
      </form>

      {/* Transaction Detail & Proof Upload Modal */}
      {pendingReservation && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                <Ticket size={24} style={{ color: "var(--primary-light)" }} />
                Detail Transaksi & Pembayaran
              </h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setPendingReservation(null)}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="transaction-summary">
              <h4 style={{ color: "var(--primary)", marginBottom: "8px", fontWeight: 700 }}>Rincian Pemesanan</h4>
              <div className="transaction-grid">
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ID Reservasi</span>
                  <p style={{ fontWeight: 700, color: "var(--text-main)" }}>#{pendingReservation.id}</p>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Jumlah Tiket</span>
                  <p style={{ fontWeight: 700, color: "var(--text-main)" }}>{pendingReservation.seats.length} Kursi</p>
                </div>
              </div>
              <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Kursi Terpilih</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {pendingReservation.seats.map((seatId) => {
                    const parsed = parseSeatId(seatId);
                    const cat = seatMap.get(parsed?.categoryKey);
                    return (
                      <span 
                        key={seatId} 
                        style={{
                          background: "var(--primary)",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}
                      >
                        {cat?.name || parsed?.categoryKey} - {parsed?.row}/{parsed?.seat}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="payment-instructions">
              <h4 style={{ color: "var(--primary)", fontWeight: 700 }}>Panduan Pembayaran</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "420px" }}>
                Silakan scan QRIS di bawah ini melalui aplikasi e-wallet atau mobile banking Anda sebesar:
              </p>
              
              <div style={{ background: "rgba(234, 179, 8, 0.08)", padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
                <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Total Transfer</span>
                <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {formatPrice(pendingReservation.totalPrice)}
                </span>
              </div>

              <div className="qris-image-wrapper">
                <img 
                  src={qris?.qris_image_url || "https://images.unsplash.com/photo-1610700596007-11502861dcfa?q=80&w=400&auto=format&fit=crop"} 
                  alt="QRIS Code" 
                />
              </div>

              <div style={{ fontSize: "0.88rem" }}>
                <p style={{ fontWeight: 700, color: "var(--text-main)" }}>{qris?.merchant_name || "Parheheon HKBP Ciputat"}</p>
                <p style={{ color: "var(--text-muted)" }}>A/N {qris?.account_name || "Sekolah Minggu HKBP Ciputat"}</p>
              </div>
            </div>

            <form onSubmit={handleUploadProof} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: "0.9rem", marginBottom: "8px", color: "var(--primary)" }}>
                  Unggah Bukti Transfer Sukses *
                </label>
                
                <div className="upload-area">
                  <input 
                    type="file" 
                    name="paymentProof" 
                    accept="image/*" 
                    required 
                    onChange={handleFileChange}
                  />
                  <div className="upload-icon-label">
                    <UploadCloud size={32} style={{ color: "var(--primary-light)", marginBottom: "4px" }} />
                    {selectedFile ? (
                      <div>
                        <span className="upload-filename">{selectedFile.name}</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          ({(selectedFile.size / 1024).toFixed(1)} KB) - Klik untuk mengganti
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>Pilih file gambar bukti transfer</span>
                        <span style={{ display: "block", fontSize: "0.75rem", marginTop: "2px" }}>
                          Format: JPG, JPEG, PNG (Maks 5MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {filePreview && (
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Pratinjau Bukti Transfer:</p>
                    <div style={{ display: "inline-block", border: "1px solid var(--border)", borderRadius: "8px", padding: "4px", background: "white", boxShadow: "var(--shadow-sm)" }}>
                      <img 
                        src={filePreview} 
                        alt="Preview Bukti" 
                        style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "6px", objectFit: "contain" }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="checkout-btn" 
                style={{ width: "100%", padding: "14px", marginTop: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                disabled={uploadLoading || !selectedFile}
              >
                {uploadLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Mengunggah Bukti Pembayaran...
                  </>
                ) : (
                  "Kirim Bukti Transfer"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: rgba(255, 255, 255, 0.98);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          width: 90%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: var(--text-main);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .modal-title {
          font-size: 1.4rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          background: var(--border);
          color: var(--text-main);
        }

        .transaction-summary {
          background: #f8fafc;
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--border);
          text-align: left;
        }

        .transaction-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 12px;
          font-size: 0.92rem;
        }

        .payment-instructions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .qris-image-wrapper {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--shadow-sm);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 240px;
          height: 240px;
        }

        .qris-image-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .upload-area {
          border: 2px dashed var(--primary-light);
          background: rgba(59, 130, 246, 0.02);
          border-radius: var(--radius-md);
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }

        .upload-area:hover {
          background: rgba(59, 130, 246, 0.05);
          border-color: var(--primary);
        }

        .upload-area input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-icon-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .upload-filename {
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }} />
    </div>
  );
}

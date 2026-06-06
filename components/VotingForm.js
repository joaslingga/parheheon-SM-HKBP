"use client";

import { useState } from "react";
import { castVoteAction } from "../app/actions";
import { Award, CheckCircle2, ShieldAlert, Heart } from "lucide-react";

export default function VotingForm({ candidates, hasVoted }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [votedState, setVotedState] = useState(hasVoted);

  async function handleVoteSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await castVoteAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setVotedState(true);
      }
    } catch (err) {
      setError("Gagal mengirimkan pilihan Anda. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  }

  if (votedState) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <CheckCircle2 size={56} style={{ color: "var(--primary-light)", marginBottom: "16px" }} />
        <h3 className="highlight-title" style={{ marginBottom: "10px" }}>Terima Kasih Atas Partisipasi Anda!</h3>
        <p style={{ color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto" }}>
          Suara Anda telah sukses tercatat di sistem kami. Setiap akun hanya dapat memberikan satu suara demi keadilan festival.
        </p>
        <div style={{ marginTop: "24px", display: "inline-flex", padding: "8px 20px", borderRadius: "50px", background: "rgba(30, 58, 138, 0.05)", border: "1px solid rgba(30, 58, 138, 0.1)", gap: "8px", alignItems: "center", color: "var(--primary)", fontWeight: "600" }}>
          <Heart size={16} fill="var(--accent)" stroke="var(--accent)" /> Status: Sudah Memilih (Voted)
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="highlight-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <Award size={24} style={{ color: "var(--primary)" }} /> Polling Kelas Sekolah Minggu Terfavorit
      </h3>
      <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "0.95rem" }}>
        Berikan suara Anda untuk penampilan / kelas terfavorit dalam rangkaian festival Parheheon Sekolah Minggu HKBP Ciputat 2026.
      </p>

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

      <form onSubmit={handleVoteSubmit}>
        <div className="voting-options-container">
          {candidates.map((cand) => (
            <label 
              key={cand.id} 
              className={`vote-option-label ${selectedCandidate === cand.id ? "checked" : ""}`}
              onClick={() => setSelectedCandidate(cand.id)}
            >
              <input
                type="radio"
                name="candidateId"
                value={cand.id}
                checked={selectedCandidate === cand.id}
                onChange={() => setSelectedCandidate(cand.id)}
                className="vote-option-input"
                required
              />
              <span style={{ fontSize: "1rem" }}>{cand.name}</span>
            </label>
          ))}
        </div>

        <button 
          type="submit" 
          className="btn btn-secondary" 
          disabled={loading || !selectedCandidate}
          style={{ width: "100%", padding: "14px" }}
        >
          {loading ? "Mengirimkan Pilihan..." : "Kirim Pilihan Terfavorit"}
        </button>
      </form>
    </div>
  );
}

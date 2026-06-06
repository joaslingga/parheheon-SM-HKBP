"use client";

import { useState } from "react";
import VotingCategoryGrid from "./VotingCategoryGrid";
import { getVotingCandidatesAction } from "@/app/actions";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VotingPreview({ categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoadingCandidates(true);
    setCandidates([]);

    // Scroll to candidates section
    setTimeout(() => {
      const element = document.getElementById("candidates-preview-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    try {
      const result = await getVotingCandidatesAction(category.id);
      if (result.success) {
        // Sort by votes count desc
        const sorted = [...(result.candidates || [])].sort(
          (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
        );
        setCandidates(sorted);
      }
    } catch (err) {
      console.error("Error loading preview candidates:", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  return (
    <div>
      {/* Category Grid - reusable */}
      <VotingCategoryGrid
        categories={categories}
        session={null}
        userCoins={0}
        onCategorySelect={handleCategorySelect}
      />

      {/* Dinamic Candidate Preview */}
      {selectedCategory && (
        <div
          id="candidates-preview-section"
          style={{
            marginTop: "48px",
            borderTop: "2px solid var(--border)",
            paddingTop: "40px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  marginBottom: "4px",
                }}
              >
                🏆 Kandidat Terdaftar — {selectedCategory.name}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Berikut adalah daftar peserta sementara. Silakan login untuk memberikan dukungan suara.
              </p>
            </div>
          </div>

          {loadingCandidates ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "60px 24px",
                color: "var(--text-muted)",
              }}
            >
              <Loader2 size={36} className="animate-spin" style={{ animation: "spin 1s linear infinite", marginBottom: "16px", color: "var(--primary)" }} />
              <p>Memuat daftar kandidat...</p>
            </div>
          ) : candidates.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "24px",
              }}
            >
              {candidates.map((candidate, index) => {
                const rank = index + 1;
                const votes = candidate.votes_count || 0;
                // Calculate representation for progress bar
                const progressWidth = Math.min(100, (votes / Math.max(votes + 10, 20)) * 100);

                return (
                  <div
                    key={candidate.id}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      border: "1px solid var(--border)",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
                    }}
                  >
                    {/* Rank Indicator */}
                    {rank <= 3 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          zIndex: 10,
                          background:
                            rank === 1
                              ? "linear-gradient(135deg, #FFD700, #FFA500)"
                              : rank === 2
                              ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)"
                              : "linear-gradient(135deg, #CD7F32, #A0522D)",
                          color: "white",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                      </div>
                    )}

                    {/* Image */}
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "110%",
                        overflow: "hidden",
                        background: "#f1f5f9",
                      }}
                    >
                      <img
                        src={
                          candidate.image_url ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
                        }
                        alt={candidate.name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      
                      {/* Gradient bottom shadow on image */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "40%",
                          background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                        }}
                      />

                      {/* Vote Count Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(251,133,0,0.85)",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Heart size={12} fill="currentColor" />
                        <span>{votes}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          marginBottom: "4px",
                          color: "var(--primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {candidate.name}
                      </h4>
                      
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          marginBottom: "12px",
                          lineHeight: 1.4,
                          minHeight: "2.8em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {candidate.description || "Peserta Sekolah Minggu"}
                      </p>

                      {/* Progress Bar (Visual indicator of standing) */}
                      <div
                        style={{
                          background: "#f1f5f9",
                          height: "4px",
                          borderRadius: "2px",
                          marginBottom: "16px",
                          overflow: "hidden",
                          marginTop: "auto",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progressWidth}%`,
                            background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                            borderRadius: "2px",
                          }}
                        />
                      </div>

                      {/* CTA Button */}
                      <Link
                        href="/login"
                        className="btn btn-outline"
                        style={{
                          padding: "10px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Heart size={14} />
                        Masuk untuk Vote
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎭</div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Belum ada kandidat terdaftar untuk kategori ini
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

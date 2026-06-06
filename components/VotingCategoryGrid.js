"use client";

import { useState } from "react";
import { ChevronRight, Check, Coins, Mic, Music, Users, Shirt, Flame, Star } from "lucide-react";

const CATEGORY_ICONS = {
  "Penginjil Cilik": "🎤",
  "CCA & CCBE": "🎵",
  "Vocal Solo": "🎙️",
  "Vocal Group": "👥",
  "Fashion Show": "👗",
  "Tor-Tor": "💃",
};

const CATEGORY_COLORS = [
  { bg: "linear-gradient(135deg, #6366f1, #8b5cf6)", badge: "#6366f1" },
  { bg: "linear-gradient(135deg, #f59e0b, #ef4444)", badge: "#f59e0b" },
  { bg: "linear-gradient(135deg, #10b981, #059669)", badge: "#10b981" },
  { bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)", badge: "#3b82f6" },
  { bg: "linear-gradient(135deg, #ec4899, #be185d)", badge: "#ec4899" },
  { bg: "linear-gradient(135deg, #f97316, #ea580c)", badge: "#f97316" },
];

export default function VotingCategoryGrid({
  categories,
  session,
  userCoins,
  onCategorySelect,
  votedCategories = new Set(),
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <p style={{ color: "var(--text-muted)" }}>Belum ada kategori voting tersedia.</p>
      </div>
    );
  }

  const hasEnoughCoins = (userCoins || 0) > 0;

  return (
    <div>
      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "4px", color: "var(--primary)" }}>
            Pilih Kategori Voting
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            1 coin = 1 vote pada 1 kategori
          </p>
        </div>
        {session && (
          <div
            style={{
              background: hasEnoughCoins
                ? "linear-gradient(135deg, #FDB462, #FB8500)"
                : "linear-gradient(135deg, #9ca3af, #6b7280)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "24px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.95rem",
              boxShadow: hasEnoughCoins ? "0 4px 12px rgba(251,133,0,0.35)" : "none",
            }}
          >
            💰 {userCoins || 0} Coin Tersedia
          </div>
        )}
      </div>

      {/* Alert if no coins */}
      {session && !hasEnoughCoins && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
            color: "#dc2626",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <div>
            <strong>Coin Anda habis!</strong> Silakan beli coin terlebih dahulu untuk bisa voting.
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {categories.map((category, index) => {
          const colorSet = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
          const emoji = CATEGORY_ICONS[category.name] || "🏆";
          const isSelected = selectedCategory?.id === category.id;
          const hasVotedThis = votedCategories.has(category.id);

          return (
            <div
              key={category.id}
              onClick={() => handleSelectCategory(category)}
              style={{
                cursor: "pointer",
                borderRadius: "16px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: isSelected
                  ? "0 12px 32px rgba(0,0,0,0.18)"
                  : "0 4px 12px rgba(0,0,0,0.07)",
                border: isSelected ? "3px solid white" : "3px solid transparent",
                outline: isSelected ? `3px solid ${colorSet.badge}` : "none",
                transform: isSelected ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
                  e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.14)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.07)";
                }
              }}
            >
              {/* Color Header */}
              <div
                style={{
                  background: colorSet.bg,
                  padding: "24px 20px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: "2.4rem", lineHeight: 1 }}>{emoji}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  {hasVotedThis && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Check size={11} /> Voted
                    </div>
                  )}
                  {isSelected && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.3)",
                        color: "white",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "12px",
                      }}
                    >
                      ● Dipilih
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                style={{
                  background: "white",
                  padding: "16px 20px 18px",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "var(--primary)",
                    marginBottom: "6px",
                  }}
                >
                  {category.name}
                </h4>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.4,
                    marginBottom: "12px",
                  }}
                >
                  {category.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      background: `${colorSet.badge}18`,
                      color: colorSet.badge,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {hasVotedThis ? "✓ Sudah Vote" : "Lihat Kandidat →"}
                  </span>
                  <ChevronRight size={16} style={{ color: "#9ca3af" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Category Indicator */}
      {selectedCategory && (
        <div
          style={{
            padding: "14px 20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
            border: "2px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            color: "#6366f1",
            fontSize: "0.9rem",
            fontWeight: 700,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Check size={16} />
          Menampilkan kandidat untuk: <span style={{ color: "var(--primary)" }}>{selectedCategory.name}</span>
        </div>
      )}
    </div>
  );
}

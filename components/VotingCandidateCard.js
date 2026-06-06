"use client";

import { Heart, Loader2, Star, Trophy } from "lucide-react";
import { useState } from "react";

export default function VotingCandidateCard({
  candidate,
  hasVoted,
  isLoading,
  onVote,
  rank,
}) {
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localVotes, setLocalVotes] = useState(candidate.votes_count || 0);
  const [justVoted, setJustVoted] = useState(false);

  const handleVoteClick = async () => {
    if (hasVoted || isLocalLoading || isLoading) return;

    setIsLocalLoading(true);
    try {
      const result = await onVote(candidate);
      if (result?.success) {
        setLocalVotes((prev) => prev + 1);
        setJustVoted(true);
      }
    } catch {
      // ignore
    } finally {
      setIsLocalLoading(false);
    }
  };

  const isDisabled = hasVoted || isLoading || isLocalLoading;
  const displayVotes = candidate.votes_count || localVotes;

  return (
    <div
      className="voting-card-wrapper"
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: justVoted
          ? "0 0 0 3px #FB8500, 0 12px 32px rgba(251,133,0,0.25)"
          : "0 4px 16px rgba(0,0,0,0.08)",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
        cursor: isDisabled && !justVoted ? "not-allowed" : "default",
        border: justVoted ? "2px solid #FB8500" : "2px solid transparent",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(-10px)";
          e.currentTarget.style.boxShadow =
            "0 20px 40px rgba(0,0,0,0.14)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            justVoted
              ? "0 0 0 3px #FB8500, 0 12px 32px rgba(251,133,0,0.25)"
              : "0 4px 16px rgba(0,0,0,0.08)";
        }
      }}
    >
      {/* Rank Badge */}
      {rank && rank <= 3 && (
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
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.9rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
        </div>
      )}

      {/* Image Container */}
      <div
        style={{
          position: "relative",
          paddingBottom: "110%",
          overflow: "hidden",
          background: "linear-gradient(135deg, #e8e8e8, #f5f5f5)",
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
            transition: "transform 0.4s ease",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) e.target.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) e.target.style.transform = "scale(1)";
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Vote Count Badge - auto update */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: justVoted
              ? "linear-gradient(135deg, #FB8500, #FFD700)"
              : "rgba(251,133,0,0.92)",
            color: "white",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(251,133,0,0.4)",
            transition: "all 0.3s ease",
            animation: justVoted ? "votePulse 0.5s ease" : "none",
          }}
        >
          <Heart size={13} fill="currentColor" />
          <span style={{ minWidth: "20px", textAlign: "center" }}>
            {displayVotes}
          </span>
          {justVoted && (
            <span style={{ fontSize: "0.75rem", marginLeft: "2px" }}>+1</span>
          )}
        </div>

        {/* Voted overlay */}
        {hasVoted && !justVoted && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "12px",
                padding: "12px 20px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <Heart
                size={28}
                fill="#FB8500"
                color="#FB8500"
                style={{ margin: "0 auto 4px" }}
              />
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#FB8500",
                }}
              >
                Sudah Vote
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
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
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            marginBottom: "14px",
            lineHeight: 1.4,
            minHeight: "2.4em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {candidate.description || "Peserta Voting"}
        </p>

        {/* Vote Progress Bar */}
        <div
          style={{
            background: "#f0f0f0",
            height: "4px",
            borderRadius: "2px",
            marginBottom: "14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (displayVotes / Math.max(displayVotes + 10, 20)) * 100)}%`,
              background: "linear-gradient(90deg, var(--primary), #FB8500)",
              borderRadius: "2px",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Vote Button */}
        <button
          onClick={handleVoteClick}
          disabled={isDisabled}
          id={`vote-btn-${candidate.id}`}
          style={{
            width: "100%",
            padding: "11px 12px",
            background: isDisabled
              ? hasVoted
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "#d1d5db"
              : "linear-gradient(135deg, var(--primary), #FB8500)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.92rem",
            fontWeight: 700,
            cursor: isDisabled ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #FB8500, var(--primary))";
              e.currentTarget.style.transform = "scale(1.02)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.background =
                "linear-gradient(135deg, var(--primary), #FB8500)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {isLocalLoading || isLoading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Memproses...
            </>
          ) : hasVoted ? (
            <>
              <Heart size={16} fill="currentColor" />
              Vote Diberikan ✓
            </>
          ) : (
            <>
              <Heart size={16} />
              Vote Sekarang
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes votePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

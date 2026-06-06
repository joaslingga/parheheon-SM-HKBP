"use client";

import { useState, useEffect } from "react";
import VotingCategoryGrid from "./VotingCategoryGrid";
import VotingCandidateCard from "./VotingCandidateCard";
import VotingModal from "./VotingModal";
import {
  submitVoteAction,
  getVotingCandidatesAction,
  getUserVotedCategoriesAction,
} from "@/app/actions";

export default function VotingFormNew({ categories, session, userCoins: initialUserCoins }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [userCoins, setUserCoins] = useState(initialUserCoins || 0);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [votedCategories, setVotedCategories] = useState(new Set());
  const [lastVoteResult, setLastVoteResult] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: null,
    candidateName: "",
    categoryName: "",
    message: "",
    errorMessage: "",
    isLoading: false,
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (!session) return;
    const loadVotedCategories = async () => {
      try {
        const result = await getUserVotedCategoriesAction(session.id);
        if (result.success) {
          setVotedCategories(new Set(result.votedCategories));
        }
      } catch (err) {
        console.error("Error loading voted categories:", err);
      }
    };
    loadVotedCategories();
  }, [session]);

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoadingCandidates(true);
    setCandidates([]);

    // Scroll to candidates section
    setTimeout(() => {
      const element = document.getElementById("candidates-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    try {
      const result = await getVotingCandidatesAction(category.id);
      if (result.success) {
        // Sort by votes desc for rank display
        const sorted = [...(result.candidates || [])].sort(
          (a, b) => (b.votes_count || 0) - (a.votes_count || 0)
        );
        setCandidates(sorted);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleVoteClick = (candidate) => {
    setSelectedCandidate(candidate);
    setModalState({
      ...modalState,
      isOpen: true,
      status: "confirm",
      candidateName: candidate.name,
      categoryName: selectedCategory?.name || "",
    });
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !selectedCategory || !session) return;

    setModalState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await submitVoteAction(
        session.id,
        selectedCandidate.id,
        selectedCategory.id
      );

      if (result.success) {
        setModalState({
          isOpen: true,
          status: "success",
          candidateName: selectedCandidate.name,
          categoryName: selectedCategory.name,
          message: result.message,
          errorMessage: "",
          isLoading: false,
        });

        setUserCoins(result.data.remaining_coins);
        setVotedCategories(new Set([...votedCategories, selectedCategory.id]));

        // Update votes_count in list
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id
              ? { ...c, votes_count: result.data.votes_count }
              : c
          )
        );

        setLastVoteResult(result);
      } else {
        setModalState({
          isOpen: true,
          status: "error",
          candidateName: "",
          categoryName: "",
          message: "",
          errorMessage: result.message || result.error || "Terjadi kesalahan",
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Vote error:", err);
      setModalState({
        isOpen: true,
        status: "error",
        candidateName: "",
        categoryName: "",
        message: "",
        errorMessage: "Terjadi kesalahan saat memproses vote",
        isLoading: false,
      });
    }
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setSelectedCandidate(null);
    if (modalState.status === "success") {
      // Keep category open to see updated votes
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div>
      <VotingCategoryGrid
        categories={categories}
        session={session}
        userCoins={userCoins}
        onCategorySelect={handleCategorySelect}
        votedCategories={votedCategories}
      />

      {selectedCategory && (
        <div
          id="candidates-section"
          style={{
            marginTop: "48px",
            borderTop: "2px solid var(--border)",
            paddingTop: "40px",
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "28px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                🏆 Kandidat — {selectedCategory.name}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                {userCoins <= 0 ? (
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>
                    ⚠️ Coin habis — beli coin untuk voting
                  </span>
                ) : votedCategories.has(selectedCategory.id) ? (
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>
                    ✓ Anda sudah memberikan vote untuk kategori ini (Anda masih dapat melakukan vote lagi)
                  </span>
                ) : (
                  `Pilih kandidat favorit Anda — 1 vote menggunakan 1 coin`
                )}
              </p>
            </div>

            {/* Coin indicator */}
            <div
              style={{
                background:
                  userCoins > 0
                    ? "linear-gradient(135deg, #FDB462, #FB8500)"
                    : "linear-gradient(135deg, #9ca3af, #6b7280)",
                color: "white",
                padding: "10px 18px",
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              💰 {userCoins} Coin
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
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid var(--border)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  marginBottom: "16px",
                }}
              />
              <p>Memuat kandidat...</p>
            </div>
          ) : candidates.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                gap: "20px",
              }}
            >
              {candidates.map((candidate, index) => (
                <VotingCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  hasVoted={false}
                  isLoading={modalState.isLoading}
                  onVote={() => {
                    handleVoteClick(candidate);
                    return Promise.resolve();
                  }}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                background: "var(--bg-light)",
                borderRadius: "16px",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎭</div>
              <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
                Belum ada kandidat untuk kategori ini
              </p>
            </div>
          )}
        </div>
      )}

      <VotingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        candidateName={modalState.candidateName}
        categoryName={modalState.categoryName}
        message={modalState.message}
        errorMessage={modalState.errorMessage}
        isLoading={modalState.isLoading}
        onConfirm={handleConfirmVote}
        onCancel={handleCloseModal}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

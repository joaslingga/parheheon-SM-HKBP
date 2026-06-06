import db from "@/lib/db";

export async function handleVoteSubmit(user_id, candidate_id, category_id) {
  try {
    // Validasi
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    if (!user) throw new Error("User not found");

    const userCoins = user.coins || 0;
    if (userCoins <= 0) {
      throw {
        status: 403,
        message: "Anda tidak memiliki coin untuk melakukan vote",
      };
    }

    const candidate = await db.prepare(
      "SELECT * FROM voting_candidates WHERE id = ?"
    ).get(candidate_id);

    if (!candidate) throw new Error("Candidate not found");

    const category = await db.prepare(
      "SELECT * FROM voting_categories WHERE id = ?"
    ).get(category_id);

    if (!category) throw new Error("Category not found");

    // Execute vote
    await db.prepare(
      "INSERT INTO voting_records (user_id, candidate_id, category_id, created_at) VALUES (?, ?, ?, ?)"
    ).run(user_id, candidate_id, category_id, new Date().toISOString());

    await db.prepare("UPDATE users SET coins = coins - 1 WHERE id = ?").run(user_id);
    await db.prepare(
      "UPDATE voting_candidates SET votes_count = votes_count + 1 WHERE id = ?"
    ).run(candidate_id);

    const updatedCandidate = await db.prepare(
      "SELECT * FROM voting_candidates WHERE id = ?"
    ).get(candidate_id);

    const updatedUser = await db.prepare("SELECT coins FROM users WHERE id = ?").get(
      user_id
    );

    return {
      success: true,
      message: `Vote untuk ${candidate.name} berhasil dicatat!`,
      data: {
        candidate_id,
        category_id,
        votes_count: updatedCandidate.votes_count,
        remaining_coins: updatedUser.coins,
      },
    };
  } catch (err) {
    console.error("Vote handler error:", err);
    if (err.status) {
      return {
        success: false,
        error: err.message,
        message: err.message,
        status: err.status,
      };
    }
    return {
      success: false,
      error: err.message || "Gagal memproses vote",
      message: err.message || "Gagal memproses vote",
    };
  }
}

export async function getCandidatesByCategory(category_id) {
  try {
    const candidates = await db.prepare(
      "SELECT * FROM voting_candidates WHERE category_id = ? ORDER BY id ASC"
    ).all(category_id);

    return {
      success: true,
      candidates,
    };
  } catch (err) {
    console.error("Get candidates error:", err);
    return {
      success: false,
      error: err.message,
      candidates: [],
    };
  }
}

export async function getUserVotedCategories(user_id) {
  try {
    const votes = await db.prepare(
      "SELECT DISTINCT category_id FROM voting_records WHERE user_id = ?"
    ).all(user_id);

    return {
      success: true,
      votedCategories: votes.map(v => v.category_id),
    };
  } catch (err) {
    console.error("Get voted categories error:", err);
    return {
      success: false,
      error: err.message,
      votedCategories: [],
    };
  }
}

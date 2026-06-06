"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "../lib/db";
import fs from "fs";
import path from "path";
import {
  CATEGORY_ORDER,
  defaultSeatCategories,
  generateAllSeats,
  mergeCategoriesWithOverrides,
} from "../lib/seatData";

// Helper to get current session
export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (parsed && parsed.id) {
      const user = await db.prepare("SELECT id, username, role, name FROM users WHERE id = ?").get(parsed.id);
      if (user) {
        return {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        };
      } else {
        return null;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Helper to save uploaded file locally and return relative URL
async function saveUploadedFile(file, prefix) {
  if (!file || typeof file === "string" || file.size === 0) {
    return null;
  }
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename using timestamp
    const originalExt = path.extname(file.name) || ".jpg";
    const fileName = `${prefix}-${Date.now()}${originalExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    return null;
  }
}

// Login action
export async function loginAction(prevState, formData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString().trim();

  if (!username || !password) {
    return { error: "Username dan password harus diisi." };
  }

  try {
    const user = await db.prepare("SELECT * FROM users WHERE username = ?").get(username);

    if (!user || user.password !== password) {
      return { error: "Username atau password salah." };
    }

    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };

    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/adminutama");
    revalidatePath("/suadminutama");

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan sistem saat login." };
  }
}

// Registration action
export async function registerAction(prevState, formData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString().trim() || "user"; // Defaults to 'user'

  if (!username || !password || !name) {
    return { error: "Semua field pendaftaran harus diisi." };
  }

  try {
    // Check if username already exists
    const existing = await db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) {
      return { error: "Username sudah terdaftar. Gunakan username lain." };
    }

    // Insert new user
    const insert = await db.prepare(
      "INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)"
    );
    const result = await insert.run(username, password, role, name);

    const sessionData = {
      id: result.lastInsertRowid,
      username,
      role,
      name,
    };

    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/adminutama");
    revalidatePath("/suadminutama");

    return { success: true, role };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Gagal melakukan pendaftaran." };
  }
}

// Logout action
export async function logoutAction() {
  cookies().delete("session");
  revalidatePath("/");
  revalidatePath("/adminutama");
  revalidatePath("/suadminutama");
  return { success: true };
}

// Create reservation action (Reservasi)
export async function createReservationAction(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login untuk memesan tiket." };
  }

  const eventName =
    formData.get("eventName")?.toString().trim() ||
    "Acara Parheheon Sekolah Minggu";
  const selectedSeatsRaw = formData.get("selectedSeats")?.toString().trim();

  if (!selectedSeatsRaw) {
    return { error: "Silakan pilih kursi yang valid untuk reservasi." };
  }

  const selectedSeats = selectedSeatsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (selectedSeats.length === 0) {
    return { error: "Silakan pilih minimal 1 kursi." };
  }
  if (selectedSeats.length > 10) {
    return { error: "Maksimal 10 kursi per pemesanan." };
  }

  const categories = getSeatCategoriesFromSettings();
  const allSeats = generateAllSeats(categories);
  const seatById = new Map(allSeats.map((seat) => [seat.seatId, seat]));
  const invalidSeat = selectedSeats.find((seatId) => !seatById.has(seatId));
  if (invalidSeat) {
    return { error: `Kursi tidak valid: ${invalidSeat}` };
  }

  const duplicated = selectedSeats.filter(
    (seatId, idx) => selectedSeats.indexOf(seatId) !== idx
  );
  if (duplicated.length > 0) {
    return { error: "Terdapat kursi ganda pada pilihan Anda." };
  }

  try {
    const checkSeat = db.prepare(
      "SELECT TOP 1 seat_id FROM seat_bookings WHERE seat_id = ?"
    );
    const insertReservation = db.prepare(
      "INSERT INTO reservations (user_id, event_name, ticket_qty, status, payment_image_url, created_at) VALUES (?, ?, ?, 'pending', ?, ?)"
    );
    const insertSeatBooking = db.prepare(
      "INSERT INTO seat_bookings (reservation_id, seat_id, category, price) VALUES (?, ?, ?, ?)"
    );

    let reservationId;
    const runTransaction = db.transaction(async () => {
      for (const seatId of selectedSeats) {
        const exists = await checkSeat.get(seatId);
        if (exists) {
          throw new Error(`Kursi ${seatId} sudah terbeli.`);
        }
      }

      const reservationResult = await insertReservation.run(
        session.id,
        eventName,
        selectedSeats.length,
        null,
        new Date().toLocaleString("id-ID")
      );
      reservationId = reservationResult.lastInsertRowid;

      for (const seatId of selectedSeats) {
        const seat = seatById.get(seatId);
        await insertSeatBooking.run(
          reservationId,
          seatId,
          seat.categoryKey,
          seat.price
        );
      }
    });

    await runTransaction();

    revalidatePath("/");
    revalidatePath("/adminutama");
    return { 
      success: "Reservasi berhasil dibuat! Silakan selesaikan pembayaran dan unggah bukti transfer.",
      reservationId: reservationId
    };
  } catch (error) {
    console.error("Reservation error:", error);
    return { error: "Gagal membuat reservasi." };
  }
}

// Upload reservation payment proof action
export async function uploadReservationProofAction(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login untuk mengunggah bukti pembayaran." };
  }

  const reservationId = formData.get("reservationId");
  const paymentProofFile = formData.get("paymentProof");

  if (!reservationId) {
    return { error: "ID reservasi tidak valid." };
  }

  if (!paymentProofFile || typeof paymentProofFile === "string" || paymentProofFile.size === 0) {
    return { error: "Bukti transaksi sukses wajib dilampirkan/diunggah." };
  }

  try {
    // Check if reservation exists and belongs to user or is admin
    const reservation = await db.prepare("SELECT * FROM reservations WHERE id = ?").get(reservationId);
    if (!reservation) {
      return { error: "Reservasi tidak ditemukan." };
    }
    if (reservation.user_id !== session.id && session.role !== "admin" && session.role !== "superadmin") {
      return { error: "Anda tidak memiliki akses ke reservasi ini." };
    }

    // Attempt to save uploaded file
    const uploadedPath = await saveUploadedFile(paymentProofFile, "reservation_payment");
    if (!uploadedPath) {
      return { error: "Gagal menyimpan file bukti transaksi." };
    }

    await db.prepare("UPDATE reservations SET payment_image_url = ? WHERE id = ?").run(uploadedPath, reservationId);

    revalidatePath("/");
    revalidatePath("/adminutama");
    return { success: "Bukti pembayaran berhasil diunggah! Menunggu persetujuan admin." };
  } catch (error) {
    console.error("Upload proof error:", error);
    return { error: "Gagal mengunggah bukti pembayaran." };
  }
}

// Approve reservation (for Admin)
export async function approveReservationAction(id) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { error: "Unauthorized access." };
  }

  try {
    await db.prepare("UPDATE reservations SET status = 'approved' WHERE id = ?").run(id);
    revalidatePath("/adminutama");
    return { success: true };
  } catch (error) {
    console.error("Approve reservation error:", error);
    return { error: "Gagal menyetujui reservasi." };
  }
}

// Reject/Delete reservation (for Admin)
export async function deleteReservationAction(id) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { error: "Unauthorized access." };
  }

  try {
    await db.prepare("DELETE FROM reservations WHERE id = ?").run(id);
    await db.prepare("DELETE FROM seat_bookings WHERE reservation_id = ?").run(id);
    revalidatePath("/adminutama");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete reservation error:", error);
    return { error: "Gagal menghapus reservasi." };
  }
}

function getSeatCategoriesFromSettings() {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'seat_layout_config'")
    .get();
  if (!row?.value) {
    return { ...defaultSeatCategories };
  }
  try {
    const saved = JSON.parse(row.value);
    return mergeCategoriesWithOverrides(saved);
  } catch {
    return { ...defaultSeatCategories };
  }
}

export async function updateSeatLayoutAction(layoutDraft) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { error: "Akses ditolak. Hanya admin yang dapat mengubah layout." };
  }

  if (!layoutDraft || typeof layoutDraft !== "object") {
    return { error: "Data layout tidak valid." };
  }

  const bookedRows = await db
    .prepare(
      `SELECT sb.seat_id FROM seat_bookings sb
       JOIN reservations r ON sb.reservation_id = r.id
       WHERE r.status IN ('pending', 'approved')`
    )
    .all();
  const bookedSet = new Set(bookedRows.map((row) => row.seat_id));

  try {
    const overrides = {};
    for (const key of CATEGORY_ORDER) {
      const base = defaultSeatCategories[key];
      const item = layoutDraft[key];
      if (!base || !item) continue;

      const seatsPerRow = Math.max(1, parseInt(item.layout?.seatsPerRow, 10) || 1);
      const rows = Math.max(1, parseInt(item.layout?.rows, 10) || 1);
      const sections = Math.max(1, parseInt(item.layout?.sections, 10) || 1);
      const price = Math.max(0, parseInt(item.price, 10) || 0);

      const candidate = mergeCategoriesWithOverrides({
        [key]: {
          price,
          layout: { seatsPerRow, rows, sections },
        },
      });
      const candidateSeats = generateAllSeats(candidate)
        .filter((seat) => seat.categoryKey === key)
        .map((seat) => seat.seatId);
      const candidateSet = new Set(candidateSeats);

      const isBreakingBookedSeat = [...bookedSet].some(
        (seatId) => seatId.startsWith(`${key}-`) && !candidateSet.has(seatId)
      );
      if (isBreakingBookedSeat) {
        return {
          error: `Layout ${base.name} tidak dapat diperkecil karena ada kursi yang sudah terbeli.`,
        };
      }

      overrides[key] = {
        price,
        layout: { seatsPerRow, rows, sections },
      };
    }

    await db.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('seat_layout_config', ?)"
    ).run(JSON.stringify(overrides));

    revalidatePath("/");
    revalidatePath("/adminutama");
    return { success: true };
  } catch (error) {
    console.error("Update seat layout error:", error);
    return { error: "Gagal menyimpan layout kursi." };
  }
}

export async function resetSeatLayoutAction() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { error: "Akses ditolak. Hanya admin yang dapat reset layout." };
  }
  try {
    await db.prepare("DELETE FROM settings WHERE key = 'seat_layout_config'").run();
    revalidatePath("/");
    revalidatePath("/adminutama");
    return { success: true };
  } catch (error) {
    console.error("Reset seat layout error:", error);
    return { error: "Gagal mereset layout kursi." };
  }
}

// Cast Vote action (Voting Online)
export async function castVoteAction(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { error: "Anda harus login untuk melakukan voting." };
  }

  const candidateId = parseInt(formData.get("candidateId")?.toString(), 10);

  if (!candidateId) {
    return { error: "Silakan pilih salah satu kandidat." };
  }

  try {
    // Check if user has already voted
    const existing = await db.prepare("SELECT id FROM votes WHERE user_id = ?").get(session.id);
    if (existing) {
      return { error: "Anda sudah menggunakan hak suara Anda. Setiap user hanya dapat melakukan voting satu kali." };
    }

    // Insert vote and increment candidate count in transaction
    const insertVote = db.prepare("INSERT INTO votes (user_id, candidate_id, created_at) VALUES (?, ?, ?)");
    const incrementCount = db.prepare("UPDATE candidates SET votes_count = votes_count + 1 WHERE id = ?");

    const runTransaction = db.transaction(async (uId, cId, date) => {
      await insertVote.run(uId, cId, date);
      await incrementCount.run(cId);
    });

    await runTransaction(session.id, candidateId, new Date().toLocaleString("id-ID"));

    revalidatePath("/");
    revalidatePath("/adminutama");
    return { success: "Suara Anda berhasil dikirim! Terima kasih." };
  } catch (error) {
    console.error("Voting error:", error);
    return { error: "Gagal mengirimkan suara Anda." };
  }
}

// Reset votes (for Admin)
export async function resetVotesAction() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { error: "Unauthorized access." };
  }

  try {
    const runTransaction = db.transaction(async () => {
      await db.prepare("DELETE FROM votes").run();
      await db.prepare("UPDATE candidates SET votes_count = 0").run();
    });
    await runTransaction();
    revalidatePath("/adminutama");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Reset votes error:", error);
    return { error: "Gagal mereset voting." };
  }
}

// Update Header Image URL (Superadmin)
export async function updateHeaderImageAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat mengubah gambar." };
  }

  let imageUrl = formData.get("imageUrl")?.toString().trim();
  const imageFile = formData.get("imageFile");

  // Attempt to save uploaded file
  const uploadedPath = await saveUploadedFile(imageFile, "header");
  if (uploadedPath) {
    imageUrl = uploadedPath;
  }

  if (!imageUrl) {
    return { error: "URL Gambar tidak boleh kosong atau silakan pilih file gambar untuk diunggah." };
  }

  try {
    await db.prepare(`MERGE settings AS target
    USING (SELECT 'header_image_url' AS [key], ? AS [value]) AS source
    ON (target.[key] = source.[key])
    WHEN MATCHED THEN
        UPDATE SET [value] = source.[value]
    WHEN NOT MATCHED THEN
        INSERT ([key], [value]) VALUES (source.[key], source.[value]);`).run(imageUrl);
    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: "Gambar header berhasil diperbarui!" };
  } catch (error) {
    console.error("Update header error:", error);
    return { error: "Gagal memperbarui gambar header." };
  }
}

// Add Highlight (Superadmin)
export async function addHighlightAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat menambah highlight." };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  let imageUrl = formData.get("imageUrl")?.toString().trim();
  const imageFile = formData.get("imageFile");

  // Attempt to save uploaded file
  const uploadedPath = await saveUploadedFile(imageFile, "highlight");
  if (uploadedPath) {
    imageUrl = uploadedPath;
  }

  if (!title || !description || !imageUrl) {
    return { error: "Semua field highlight harus diisi (silakan masukkan URL gambar atau unggah file)." };
  }

  try {
    const insert = await db.prepare(
      "INSERT INTO highlights (title, description, image_url, created_at) VALUES (?, ?, ?, ?)"
    );
    await insert.run(title, description, imageUrl, new Date().toLocaleString("id-ID"));

    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: "Highlight acara berhasil ditambahkan!" };
  } catch (error) {
    console.error("Add highlight error:", error);
    return { error: "Gagal menambahkan highlight." };
  }
}

// Delete Highlight (Superadmin)
export async function deleteHighlightAction(id) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak." };
  }

  try {
    await db.prepare("DELETE FROM highlights WHERE id = ?").run(id);
    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: true };
  } catch (error) {
    console.error("Delete highlight error:", error);
    return { error: "Gagal menghapus highlight." };
  }
}

// ========== NEW VOTING SYSTEM WITH TOKENS ==========

// Voting actions
export async function submitVoteAction(user_id, candidate_id, category_id) {
  try {
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userCoins = user.coins || 0;
    if (userCoins <= 0) {
      return {
        success: false,
        error: "Tidak cukup coin",
        message: "Beli coin terlebih dahulu untuk voting",
      };
    }

    const candidate = await db.prepare(
      "SELECT * FROM voting_candidates WHERE id = ?"
    ).get(candidate_id);

    if (!candidate) {
      return { success: false, error: "Candidate not found" };
    }

    const category = await db.prepare(
      "SELECT * FROM voting_categories WHERE id = ?"
    ).get(category_id);

    if (!category) {
      return { success: false, error: "Category not found" };
    }

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

    revalidatePath("/");
    return {
      success: true,
      message: `Vote untuk ${candidate.name} berhasil!`,
      data: {
        candidate_id,
        category_id,
        votes_count: updatedCandidate.votes_count,
        remaining_coins: updatedUser.coins,
      },
    };
  } catch (err) {
    console.error("Vote error:", err);
    return { success: false, error: "Gagal memproses vote" };
  }
}

// Get voting candidates by category
export async function getVotingCandidatesAction(category_id) {
  try {
    const candidates = await db.prepare(
      "SELECT * FROM voting_candidates WHERE category_id = ? ORDER BY id ASC"
    ).all(category_id);

    return { success: true, candidates };
  } catch (err) {
    console.error("Get candidates error:", err);
    return { success: false, error: "Gagal mengambil data kandidat", candidates: [] };
  }
}

// Get voted categories for user
export async function getUserVotedCategoriesAction(user_id) {
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
    return { success: false, error: "Gagal mengambil data", votedCategories: [] };
  }
}

// Get user coin balance
export async function getUserCoinBalanceAction(user_id) {
  try {
    const user = await db.prepare("SELECT coins FROM users WHERE id = ?").get(user_id);
    return { success: true, coins: user?.coins || 0 };
  } catch (err) {
    console.error("Get coin balance error:", err);
    return { success: false, coins: 0 };
  }
}

// Get all voting categories
export async function getVotingCategoriesAction() {
  try {
    const categories = await db.prepare(
      "SELECT * FROM voting_categories ORDER BY order_index ASC"
    ).all();

    return { success: true, categories };
  } catch (err) {
    console.error("Get categories error:", err);
    return { success: false, error: "Gagal mengambil kategori", categories: [] };
  }
}

// ========== TOKEN/COIN SYSTEM ==========

// Create token purchase transaction
export async function createTokenPurchaseAction(user_id, coin_amount) {
  try {
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const amount = coin_amount * 10000; // 1 coin = 10000
    
    const result = await db.prepare(
      "INSERT INTO token_transactions (user_id, amount, coins_amount, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
    ).run(user_id, amount, coin_amount, new Date().toISOString());

    return {
      success: true,
      transaction_id: result.lastInsertRowid,
      message: `Pemesanan ${coin_amount} coin senilai Rp ${amount.toLocaleString('id-ID')} berhasil dibuat`,
      data: {
        transaction_id: result.lastInsertRowid,
        amount,
        coins_amount: coin_amount,
        user_name: user.name,
      },
    };
  } catch (err) {
    console.error("Create token purchase error:", err);
    return { success: false, error: "Gagal membuat pemesanan" };
  }
}

// Upload payment proof and verify
export async function uploadPaymentProofAction(formData) {
  try {
    const transaction_id = formData.get("transactionId");
    const file = formData.get("paymentProof");

    if (!transaction_id) {
      return { success: false, error: "ID transaksi tidak valid" };
    }

    if (!file || typeof file === "string" || file.size === 0) {
      return { success: false, error: "File bukti pembayaran tidak valid" };
    }

    const uploadedPath = await saveUploadedFile(file, "payment");
    if (!uploadedPath) {
      return { success: false, error: "Gagal menyimpan file bukti pembayaran" };
    }

    // Update transaction with payment image
    const transaction = await db.prepare(
      "SELECT * FROM token_transactions WHERE id = ?"
    ).get(transaction_id);

    if (!transaction) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    if (transaction.status !== "pending") {
      return { success: false, error: "Transaksi sudah diproses" };
    }

    await db.prepare(
      "UPDATE token_transactions SET payment_image_url = ? WHERE id = ?"
    ).run(uploadedPath, transaction_id);

    revalidatePath("/");
    revalidatePath("/adminutama");

    return {
      success: true,
      message: "Bukti pembayaran berhasil diunggah. Tunggu konfirmasi dari admin.",
      data: {
        transaction_id,
        payment_image: uploadedPath,
        status: "pending",
      },
    };
  } catch (err) {
    console.error("Upload payment proof error:", err);
    return { success: false, error: "Gagal mengunggah bukti pembayaran" };
  }
}

// Get user pending transactions
export async function getUserPendingTransactionsAction(user_id) {
  try {
    const transactions = await db.prepare(
      "SELECT * FROM token_transactions WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC"
    ).all(user_id);

    return { success: true, transactions };
  } catch (err) {
    console.error("Get pending transactions error:", err);
    return { success: false, transactions: [] };
  }
}

// Admin: Get all pending transactions
export async function getAdminPendingTransactionsAction() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const transactions = await db.prepare(
      `SELECT tt.*, u.name as user_name, u.username
       FROM token_transactions tt
       JOIN users u ON tt.user_id = u.id
       WHERE tt.status = 'pending'
       ORDER BY tt.created_at DESC`
    ).all();

    return { success: true, transactions };
  } catch (err) {
    console.error("Get admin transactions error:", err);
    return { success: false, transactions: [] };
  }
}

// Admin: Get all transactions (with filtering)
export async function getAdminAllTransactionsAction(status = null) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    let query = `SELECT tt.*, u.name as user_name, u.username
                 FROM token_transactions tt
                 JOIN users u ON tt.user_id = u.id`;
    const params = [];

    if (status) {
      query += ` WHERE tt.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY tt.created_at DESC`;

    const transactions = params.length > 0 
      ? await db.prepare(query).all(...params)
      : await db.prepare(query).all();

    return { success: true, transactions };
  } catch (err) {
    console.error("Get all transactions error:", err);
    return { success: false, transactions: [] };
  }
}

// Admin: Approve token transaction
export async function approveTokenTransactionAction(transaction_id) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const transaction = await db.prepare(
      "SELECT * FROM token_transactions WHERE id = ?"
    ).get(transaction_id);

    if (!transaction) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    if (transaction.status !== "pending") {
      return { success: false, error: "Transaksi sudah diproses" };
    }

    // Update transaction status and verified info
    await db.prepare(
      "UPDATE token_transactions SET status = 'verified', verified_at = ?, verified_by_admin_id = ? WHERE id = ?"
    ).run(new Date().toISOString(), session.id, transaction_id);

    // Add coins to user
    await db.prepare(
      "UPDATE users SET coins = coins + ? WHERE id = ?"
    ).run(transaction.coins_amount, transaction.user_id);

    revalidatePath("/");
    revalidatePath("/adminutama");

    return {
      success: true,
      message: `Transaksi approved! ${transaction.coins_amount} coin ditambahkan ke akun user.`,
      data: {
        transaction_id,
        coins_added: transaction.coins_amount,
      },
    };
  } catch (err) {
    console.error("Approve transaction error:", err);
    return { success: false, error: "Gagal menyetujui transaksi" };
  }
}

// Admin: Reject token transaction
export async function rejectTokenTransactionAction(transaction_id, reason = "") {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const transaction = await db.prepare(
      "SELECT * FROM token_transactions WHERE id = ?"
    ).get(transaction_id);

    if (!transaction) {
      return { success: false, error: "Transaksi tidak ditemukan" };
    }

    if (transaction.status !== "pending") {
      return { success: false, error: "Transaksi sudah diproses" };
    }

    // Update transaction status
    await db.prepare(
      "UPDATE token_transactions SET status = 'rejected', verified_at = ?, verified_by_admin_id = ? WHERE id = ?"
    ).run(new Date().toISOString(), session.id, transaction_id);

    revalidatePath("/");
    revalidatePath("/adminutama");

    return {
      success: true,
      message: "Transaksi ditolak",
      data: { transaction_id },
    };
  } catch (err) {
    console.error("Reject transaction error:", err);
    return { success: false, error: "Gagal menolak transaksi" };
  }
}

// Get QRIS settings
export async function getQRISSettingsAction() {
  try {
    const qris = await db.prepare(
      "SELECT TOP 1 * FROM qris_settings ORDER BY id DESC"
    ).get();

    if (!qris) {
      return {
        success: true,
        qris: {
          qris_image_url: "https://images.unsplash.com/photo-1610700596007-11502861dcfa?q=80&w=400&auto=format&fit=crop",
          merchant_name: "Parheheon HKBP Ciputat",
          account_name: "Sekolah Minggu HKBP Ciputat",
        },
      };
    }

    return { success: true, qris };
  } catch (err) {
    console.error("Get QRIS error:", err);
    return { success: false, error: "Gagal mengambil konfigurasi QRIS" };
  }
}

// Add Voting Candidate (Superadmin)
export async function addVotingCandidateAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat menambah kandidat." };
  }

  const categoryId = parseInt(formData.get("categoryId")?.toString(), 10);
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  let imageUrl = formData.get("imageUrl")?.toString().trim();
  const imageFile = formData.get("imageFile");

  if (!categoryId || !name) {
    return { error: "Kategori dan nama kandidat harus diisi." };
  }

  // Attempt to save uploaded file
  const uploadedPath = await saveUploadedFile(imageFile, "candidate");
  if (uploadedPath) {
    imageUrl = uploadedPath;
  }

  if (!imageUrl) {
    // default placeholder if none provided
    imageUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";
  }

  try {
    const insert = await db.prepare(
      "INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (?, ?, ?, ?, 0, ?)"
    );
    await insert.run(categoryId, name, imageUrl, description || "", new Date().toISOString());

    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: "Kandidat peserta berhasil ditambahkan!" };
  } catch (error) {
    console.error("Add voting candidate error:", error);
    return { error: "Gagal menambahkan kandidat peserta." };
  }
}

// Update Voting Candidate (Superadmin)
export async function updateVotingCandidateAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat memperbarui kandidat." };
  }

  const candidateId = parseInt(formData.get("candidateId")?.toString(), 10);
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  let imageUrl = formData.get("imageUrl")?.toString().trim();
  const imageFile = formData.get("imageFile");

  if (!candidateId || !name) {
    return { error: "ID kandidat dan nama kandidat harus diisi." };
  }

  try {
    // Fetch current candidate data to preserve current image_url if not updated
    const current = await db.prepare("SELECT image_url FROM voting_candidates WHERE id = ?").get(candidateId);
    if (!current) {
      return { error: "Kandidat tidak ditemukan." };
    }

    // Attempt to save uploaded file
    const uploadedPath = await saveUploadedFile(imageFile, "candidate");
    if (uploadedPath) {
      imageUrl = uploadedPath;
    }

    // If imageUrl is not provided and no file uploaded, keep the current one
    if (!imageUrl && !uploadedPath) {
      imageUrl = current.image_url;
    }

    await db.prepare(
      "UPDATE voting_candidates SET name = ?, description = ?, image_url = ? WHERE id = ?"
    ).run(name, description || "", imageUrl, candidateId);

    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: "Data kandidat peserta berhasil diperbarui!" };
  } catch (error) {
    console.error("Update voting candidate error:", error);
    return { error: "Gagal memperbarui data kandidat peserta." };
  }
}

// Delete Voting Candidate (Superadmin)
export async function deleteVotingCandidateAction(candidateId) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat menghapus kandidat." };
  }

  try {
    await db.prepare("DELETE FROM voting_candidates WHERE id = ?").run(candidateId);
    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: true };
  } catch (error) {
    console.error("Delete voting candidate error:", error);
    return { error: "Gagal menghapus kandidat peserta." };
  }
}

// Update Quick Stats Settings (Superadmin)
export async function updateQuickStatsAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat mengubah pengaturan ini." };
  }

  let imageUrl = formData.get("stats_imageUrl")?.toString().trim();
  const imageFile = formData.get("stats_imageFile");

  try {
    // Attempt to save uploaded file locally
    const uploadedPath = await saveUploadedFile(imageFile, "stats_banner");
    if (uploadedPath) {
      imageUrl = uploadedPath;
    }

    if (imageUrl) {
      await db.prepare(`MERGE settings AS target
      USING (SELECT 'stats_image_url' AS [key], ? AS [value]) AS source
      ON (target.[key] = source.[key])
      WHEN MATCHED THEN
          UPDATE SET [value] = source.[value]
      WHEN NOT MATCHED THEN
          INSERT ([key], [value]) VALUES (source.[key], source.[value]);`).run(imageUrl);
    }

    revalidatePath("/");
    revalidatePath("/suadminutama");
    return { success: "Gambar banner statistik beranda berhasil diperbarui!" };
  } catch (error) {
    console.error("Update quick stats error:", error);
    return { error: "Gagal memperbarui gambar banner statistik beranda." };
  }
}

// Get all users (Admin/Superadmin only)
export async function getAllUsersAction() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  try {
    const users = await db.prepare("SELECT id, name, username, role, coins FROM users ORDER BY id ASC").all();
    return { success: true, users };
  } catch (err) {
    console.error("Get all users error:", err);
    return { success: false, error: "Gagal mengambil daftar pengguna." };
  }
}

// Update user role (Admin/Superadmin only)
export async function updateUserRoleAction(userId, newRole) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  // Prevent modifying own role
  if (session.id === parseInt(userId, 10)) {
    return { success: false, error: "Anda tidak dapat mengubah role Anda sendiri." };
  }

  // Basic validation of role
  const allowedRoles = ["user", "admin", "superadmin"];
  if (!allowedRoles.includes(newRole)) {
    return { success: false, error: "Role tidak valid." };
  }

  try {
    await db.prepare("UPDATE users SET role = ? WHERE id = ?").run(newRole, userId);
    revalidatePath("/");
    revalidatePath("/adminutama");
    revalidatePath("/suadminutama");
    return { success: true };
  } catch (err) {
    console.error("Update role error:", err);
    return { success: false, error: "Gagal memperbarui role pengguna." };
  }
}

// Delete user (Admin/Superadmin only)
export async function deleteUserAction(userId) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    return { success: false, error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  // Prevent deleting self
  if (session.id === parseInt(userId, 10)) {
    return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
  }

  try {
    // Delete user's votes and reservations first to maintain foreign key integrity
    await db.prepare("DELETE FROM votes WHERE user_id = ?").run(userId);
    await db.prepare("DELETE FROM voting_records WHERE user_id = ?").run(userId);
    
    // Find all reservations for this user and delete their seat bookings
    const userReservations = await db.prepare("SELECT id FROM reservations WHERE user_id = ?").all(userId);
    for (const res of userReservations) {
      await db.prepare("DELETE FROM seat_bookings WHERE reservation_id = ?").run(res.id);
    }
    await db.prepare("DELETE FROM reservations WHERE user_id = ?").run(userId);
    
    // Delete token transactions
    await db.prepare("DELETE FROM token_transactions WHERE user_id = ?").run(userId);

    // Finally delete the user
    await db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    revalidatePath("/");
    revalidatePath("/adminutama");
    revalidatePath("/suadminutama");
    return { success: true };
  } catch (err) {
    console.error("Delete user error:", err);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}


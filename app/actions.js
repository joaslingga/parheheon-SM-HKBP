"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "../lib/db";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
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
    revalidatePath("/reservasi");
    revalidatePath("/");
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
    revalidatePath("/reservasi");
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

// Update Header Image URL (Superadmin)
export async function updateHeaderImageAction(prevState, formData) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Akses ditolak. Hanya Superadmin yang dapat mengubah gambar." };
  }

  let imageUrl = formData.get("imageUrl")?.toString().trim();
  const imageFile = formData.get("imageFile");

  // Deteksi apakah ada file yang dipilih untuk diunggah
  const hasFile = imageFile && typeof imageFile !== "string" && imageFile.size > 0;

  if (hasFile) {
    const uploadedPath = await saveUploadedFile(imageFile, "header");
    if (uploadedPath) {
      imageUrl = uploadedPath;
    } else {
      return { error: "Gagal menyimpan file gambar banner yang diunggah. Silakan periksa folder public/uploads di server." };
    }
  }

  if (!imageUrl) {
    return { error: "Silakan pilih berkas gambar untuk diunggah." };
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

  // 1. Validasi teks wajib (judul & deskripsi)
  if (!title || !description) {
    return { error: "Judul dan deskripsi highlight harus diisi." };
  }

  // 2. Deteksi apakah ada file yang dipilih untuk diunggah
  const hasFile = imageFile && typeof imageFile !== "string" && imageFile.size > 0;

  if (hasFile) {
    const uploadedPath = await saveUploadedFile(imageFile, "highlight");
    if (uploadedPath) {
      imageUrl = uploadedPath;
    } else {
      return { error: "Gagal menyimpan file yang diunggah. Silakan periksa folder public/uploads di server atau coba file lain." };
    }
  }

  // 3. Validasi media wajib (Unggah berkas)
  if (!imageUrl) {
    return { error: "Semua field highlight harus diisi (silakan unggah berkas foto/video)." };
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

  // Deteksi apakah ada file yang dipilih untuk diunggah
  const hasFile = imageFile && typeof imageFile !== "string" && imageFile.size > 0;

  if (hasFile) {
    const uploadedPath = await saveUploadedFile(imageFile, "candidate");
    if (uploadedPath) {
      imageUrl = uploadedPath;
    } else {
      return { error: "Gagal menyimpan file gambar kandidat yang diunggah. Silakan periksa folder public/uploads di server." };
    }
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

    // Deteksi apakah ada file yang dipilih untuk diunggah
    const hasFile = imageFile && typeof imageFile !== "string" && imageFile.size > 0;
    let uploadedPath = null;

    if (hasFile) {
      uploadedPath = await saveUploadedFile(imageFile, "candidate");
      if (uploadedPath) {
        imageUrl = uploadedPath;
      } else {
        return { error: "Gagal menyimpan file gambar kandidat yang diunggah. Silakan periksa folder public/uploads di server." };
      }
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

  const imageFile = formData.get("stats_imageFile");

  // Deteksi apakah ada file yang dipilih untuk diunggah
  const hasFile = imageFile && typeof imageFile !== "string" && imageFile.size > 0;

  if (!hasFile) {
    return { error: "Silakan pilih berkas gambar statistik untuk diunggah." };
  }

  const uploadedPath = await saveUploadedFile(imageFile, "stats_banner");
  if (!uploadedPath) {
    return { error: "Gagal menyimpan file gambar statistik yang diunggah. Silakan periksa folder public/uploads di server." };
  }

  try {
    await db.prepare(`MERGE settings AS target
    USING (SELECT 'stats_image_url' AS [key], ? AS [value]) AS source
    ON (target.[key] = source.[key])
    WHEN MATCHED THEN
        UPDATE SET [value] = source.[value]
    WHEN NOT MATCHED THEN
        INSERT ([key], [value]) VALUES (source.[key], source.[value]);`).run(uploadedPath);

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
    const users = await db.prepare("SELECT id, name, username, role FROM users ORDER BY id ASC").all();
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
    // Find all reservations for this user and delete their seat bookings
    const userReservations = await db.prepare("SELECT id FROM reservations WHERE user_id = ?").all(userId);
    for (const res of userReservations) {
      await db.prepare("DELETE FROM seat_bookings WHERE reservation_id = ?").run(res.id);
    }
    await db.prepare("DELETE FROM reservations WHERE user_id = ?").run(userId);

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

// Restart Server Action (Superadmin only)
export async function restartServerAction() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { success: false, error: "Akses ditolak. Hanya Superadmin yang memiliki izin." };
  }

  try {
    console.log(`[SYSTEM] Restart initiated by ${session.username}`);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    return { 
      success: true, 
      message: "Perintah restart berhasil dikirim. Server akan restart dalam beberapa detik." 
    };
  } catch (err) {
    console.error("Restart server error:", err);
    return { success: false, error: "Gagal memproses restart server." };
  }
}

// Shutdown Server Action (Superadmin only)
export async function shutdownServerAction() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    return { success: false, error: "Akses ditolak. Hanya Superadmin yang memiliki izin." };
  }

  try {
    console.log(`[SYSTEM] Shutdown initiated by ${session.username}`);
    
    const pmName = process.env.name || "parheheon-app";
    const isPM2 = process.env.pm_id !== undefined || process.env.PM2_HOME !== undefined;
    
    setTimeout(() => {
      if (isPM2) {
        exec(`pm2 stop ${pmName}`, (err) => {
          if (err) {
            console.error("Failed to stop PM2 process, forcing exit:", err);
            process.exit(0);
          }
        });
      } else {
        process.exit(0);
      }
    }, 1000);
    
    return { 
      success: true, 
      message: "Perintah shutdown berhasil dikirim. Server akan dimatikan." 
    };
  } catch (err) {
    console.error("Shutdown server error:", err);
    return { success: false, error: "Gagal memproses shutdown server." };
  }
}


import db from "./db";
import {
  defaultSeatCategories,
  mergeCategoriesWithOverrides,
  generateAllSeats,
} from "./seatData";

export async function getSeatCategories() {
  const row = await db
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

export async function getAllSeatsFromDb() {
  const categories = await getSeatCategories();
  return generateAllSeats(categories);
}

export async function getBookedSeatIds() {
  const rows = await db
    .prepare(
      `SELECT sb.seat_id FROM seat_bookings sb
       JOIN reservations r ON sb.reservation_id = r.id
       WHERE r.status IN ('pending', 'approved')`
    )
    .all();
  return rows.map((r) => r.seat_id);
}

export async function getBookedSeatsMap() {
  const rows = await db
    .prepare(
      `SELECT sb.seat_id, sb.category, sb.price, r.status, r.id as reservation_id,
              u.name as user_name, u.username
       FROM seat_bookings sb
       JOIN reservations r ON sb.reservation_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE r.status IN ('pending', 'approved')`
    )
    .all();
  const map = {};
  for (const row of rows) {
    map[row.seat_id] = row;
  }
  return map;
}

export async function getSeatStats() {
  const categories = await getSeatCategories();
  const allSeats = generateAllSeats(categories);
  const bookedMap = await getBookedSeatsMap();
  const bookedCount = Object.keys(bookedMap).length;
  return {
    totalSeats: allSeats.length,
    bookedSeats: bookedCount,
    availableSeats: allSeats.length - bookedCount,
  };
}

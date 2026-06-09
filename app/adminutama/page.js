import db from "../../lib/db";
import { getSession } from "../actions";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/AdminDashboard";
import {
  getSeatCategories,
  getBookedSeatIdsByStatus,
  getSeatStats,
} from "../../lib/seatConfig";

// Force dynamic rendering since this page uses cookies for session management and database queries
export const dynamic = "force-dynamic";

export default async function AdminUtamaPage() {
  // 1. Authenticate & Authorize
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
    redirect("/login");
  }

  // 2. Fetch Reservations Log (with user details)
  const reservations = await db.prepare(`
    SELECT reservations.id, reservations.user_id, reservations.event_name, reservations.ticket_qty,
           reservations.status, reservations.payment_image_url, reservations.created_at,
           users.name as user_name, users.username,
           COALESCE(SUM(seat_bookings.price), 0) as total_price
    FROM reservations
    JOIN users ON reservations.user_id = users.id
    LEFT JOIN seat_bookings ON seat_bookings.reservation_id = reservations.id
    GROUP BY reservations.id, reservations.user_id, reservations.event_name, reservations.ticket_qty,
             reservations.status, reservations.payment_image_url, reservations.created_at,
             users.name, users.username
    ORDER BY reservations.id DESC
  `).all();

  // 4. Fetch Statistics
  const reservationCount = (await db.prepare("SELECT COUNT(*) as count FROM reservations").get())?.count || 0;
  const pendingReservations = (await db.prepare("SELECT COUNT(*) as count FROM reservations WHERE status = 'pending'").get())?.count || 0;
  const approvedTickets = (await db.prepare("SELECT SUM(ticket_qty) as sum FROM reservations WHERE status = 'approved'").get())?.sum || 0;
  const seatCategories = await getSeatCategories();
  const { pending: pendingSeatIds, approved: bookedSeatIds } = await getBookedSeatIdsByStatus();
  const seatStats = await getSeatStats();

  const stats = {
    reservationCount,
    pendingReservations,
    approvedTickets,
  };

  return (
    <AdminDashboard 
      initialReservations={reservations} 
      stats={stats} 
      seatCategories={seatCategories}
      bookedSeatIds={bookedSeatIds}
      pendingSeatIds={pendingSeatIds}
      seatStats={seatStats}
      session={session}
    />
  );
}

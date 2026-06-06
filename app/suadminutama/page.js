import db from "../../lib/db";
import { getSession } from "../actions";
import { redirect } from "next/navigation";
import SuperadminDashboard from "../../components/SuperadminDashboard";

export default async function SuAdminUtamaPage() {
  // 1. Authenticate & Authorize
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/login");
  }

  // 2. Fetch Header Image URL Setting
  const currentHeaderImage = (await db.prepare("SELECT value FROM settings WHERE key = 'header_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop";

  // 2b. Fetch Quick Stats Setting (Single Image)
  const statsImageUrl = (await db.prepare("SELECT value FROM settings WHERE key = 'stats_image_url'").get())?.value || 
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop";

  // 3. Fetch Highlights
  const highlights = await db.prepare("SELECT * FROM highlights ORDER BY id DESC").all();

  // 4. Fetch Voting Categories and Candidates
  const votingCategories = await db.prepare("SELECT * FROM voting_categories ORDER BY order_index ASC").all();
  const votingCandidates = await db.prepare("SELECT * FROM voting_candidates ORDER BY id ASC").all();

  return (
    <SuperadminDashboard 
      currentHeaderImage={currentHeaderImage} 
      statsImageUrl={statsImageUrl}
      highlights={highlights} 
      votingCategories={votingCategories}
      votingCandidates={votingCandidates}
    />
  );
}

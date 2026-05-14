import { cookies } from "next/headers";

import { buildAdminStatsDTO } from "@/lib/analytics/adminStats";
import { AdminPanel } from "./AdminPanel";

export const metadata = {
  title: "Saheli — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const jar = await cookies();
  const initialStats = buildAdminStatsDTO(jar.get("saheli_admin")?.value);
  return <AdminPanel initialStats={initialStats} />;
}

import { notFound } from "next/navigation";
import { DesignShowcase } from "./DesignShowcase";

export const dynamic = "force-dynamic";

export default function DesignPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <DesignShowcase />;
}

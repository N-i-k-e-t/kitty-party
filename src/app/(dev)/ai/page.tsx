import { notFound } from "next/navigation";
import AiDevShowcase from "./AiDevShowcase";

export const dynamic = "force-dynamic";

export default function AiDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <AiDevShowcase />;
}

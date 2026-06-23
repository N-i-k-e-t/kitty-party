import { AppFrame } from "@/components/layout/AppFrame";

export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}

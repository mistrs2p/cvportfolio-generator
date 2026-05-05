import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="h-screen overflow-hidden bg-slate-950">{children}</div>
  );
}

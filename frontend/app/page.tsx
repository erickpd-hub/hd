"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neutral-400 font-mono text-xs gap-3">
      <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      <span>Redirigiendo a Panel de Administración L2 / L3...</span>
    </div>
  );
}

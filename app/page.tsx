"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl text-center w-80">

        <h1 className="text-white mb-5 text-xl">CCTV System</h1>

        <button onClick={() => router.push("/user")}
          className="w-full bg-green-500 p-2 mb-2 rounded">
          👤 User
        </button>

        <button onClick={() => router.push("/engineer")}
          className="w-full bg-yellow-500 p-2 mb-2 rounded">
          🛠 Engineer
        </button>

        <button onClick={() => router.push("/admin")}
          className="w-full bg-red-500 p-2 rounded">
          👑 Admin
        </button>

      </div>
    </div>
  );
}
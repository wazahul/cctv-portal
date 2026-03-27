"use client";

import { useState } from "react";

export default function UserPage() {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (mobile.length < 10) {
      alert("Enter valid mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Request Sent ✅");
        setMobile("");
      } else {
        alert("Error ❌");
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">

      <div className="bg-white/10 p-8 rounded-xl text-center w-80 text-white">

        <h2 className="mb-4 text-xl">Request Service</h2>

        <input
          type="number"
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full p-2 mb-3 text-black rounded"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 p-2 rounded"
        >
          {loading ? "Sending..." : "Request Now"}
        </button>

      </div>
    </div>
  );
}
/* Ye API server par chalegi aur encrypted 
data lekar saaf password wapas degi */
import { NextResponse } from "next/server";
import { decryptData } from "@/lib/crypto";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { device_sn } = await req.json();

    if (!device_sn || !supabaseAdmin) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // 1. Database se encrypted passwords fetch karein (Server-side)
    const { data, error } = await supabaseAdmin
      .from("devices")
      .select("user_pass, admin_pass, v_code")
      .eq("device_sn", device_sn)
      .single();

    if (error || !data) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    // 2. Server par decrypt karein (Key browser se gayab ho chuki hogi)
    return NextResponse.json({
      user_pass: decryptData(data.user_pass),
      admin_pass: decryptData(data.admin_pass),
      v_code: decryptData(data.v_code),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
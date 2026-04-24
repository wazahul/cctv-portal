// aap/api/approve/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reqId = searchParams.get("reqId");
    const phone = searchParams.get("phone");
    const msg = searchParams.get("msg");

    if (!reqId || !supabaseAdmin) {
      return new NextResponse("Invalid Request", { status: 400 });
    }

    // ✅ 1. Status Update
    await supabaseAdmin.from("requests").update({ status: "done" }).eq("id", reqId);

    // ✅ 2. 🚀 The Line-Break Magic Fix
    if (msg) {
      // Decode Gmail logic then Re-encode for WhatsApp
      const decodedMsg = decodeURIComponent(msg);
      const finalWaUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(decodedMsg)}`;
      
      return NextResponse.redirect(finalWaUrl);
    }

    return NextResponse.redirect(`https://api.whatsapp.com/send?phone=${phone}&text=Approved`);
  } catch (err: any) {
    return new NextResponse("Error: " + err.message, { status: 500 });
  }
}
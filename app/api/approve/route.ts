// aap/api/approve/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reqId = searchParams.get("reqId");
    const phone = searchParams.get("phone");
    const msg = searchParams.get("msg");

    if (!reqId || !supabaseAdmin) return new NextResponse("Invalid Request", { status: 400 });

    // ✅ DB Update: Pending to Done
    await supabaseAdmin.from("requests").update({ status: "done" }).eq("id", reqId);

    // 🚀 WhatsApp Redirection
    return NextResponse.redirect(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`);
  } catch (err: any) {
    return new NextResponse("Error: " + err.message, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient"; 
import { COMPANY } from "@/lib/config";
import { Resend } from "resend";
import { decryptData } from "@/lib/crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, device_id, message, date_time, is_authorized } = body;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // --- 🛡️ STEP 1: RATE LIMITS (Matching with Mobile AND Device SN) ---
    if (!is_authorized) {
      const now = new Date();
      const startOfDay = new Date(); 
      startOfDay.setUTCHours(0, 0, 0, 0);

      // 1. Daily Limit (Check by Mobile Only - Overall 3 requests per day)
      const { count } = await supabaseAdmin
        .from("requests")
        .select("*", { count: 'exact', head: true })
        .eq("mobile", mobile)
        .gte("created_at", startOfDay.toISOString());

      if (count !== null && count >= 3) {
        return NextResponse.json({ success: false, error: "Daily limit (3 requests) reached. Please try again tomorrow." }, { status: 429 });
      }

      // 2. 10-Minute Cooldown (🚩 FIX: Match Mobile AND Device SN)
      const { data: lastReq } = await supabaseAdmin
        .from("requests")
        .select("created_at")
        .eq("mobile", mobile)
        .eq("device_sn", device_id) // ✅ Ab ye specific device match karega
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastReq) {
        const lastTime = new Date(lastReq.created_at).getTime();
        const diffInSec = Math.floor((now.getTime() - lastTime) / 1000);

        if (diffInSec < 600) { 
          return NextResponse.json({ 
            success: false, 
            error: "A request for this device is already pending.", 
            wait: 600 - diffInSec 
          }, { status: 429 });
        }
      }
    }

    // --- 🔍 STEP 2: FETCH DEVICE ---
    const { data: device, error: devErr } = await supabaseAdmin
      .from("devices")
      .select("*")
      .eq("device_sn", device_id)
      .single();

    if (devErr || !device) return NextResponse.json({ success: false, error: "Device not found in system." }, { status: 404 });

    // --- 📝 STEP 3: DATABASE INSERT ---
    const { data: newRequest, error: reqErr } = await supabaseAdmin
      .from("requests")
      .insert([{ 
        device_sn: device_id, 
        site_name: device.site_name, 
        mobile, 
        message: message || "Password Request", 
        status: 'pending',
        date_time: date_time 
      }])
      .select('id').single();

    if (reqErr) throw new Error("DB Save Failed: " + reqErr.message);

    // --- 📧 STEP 4: EMAIL NOTIFICATION ---
    const finalPass = decryptData(device.user_pass);
    const waMsg = `*🔐 CCTV ACCESS*%0A📍Site: ${device.site_name}%0A🆔ID: user%0A🛡️Pass: ${finalPass}`;
    const approvalLink = `${baseUrl}/api/approve?reqId=${newRequest.id}&phone=91${mobile.replace(/\D/g, "")}&msg=${waMsg}`;

    await resend.emails.send({
      from: "CCTV Portal <onboarding@resend.dev>",
      to: COMPANY?.senderEmail || "wazahul@gmail.com",
      subject: `🚨 REQUEST: ${device.site_name}`,
      html: `<div style="font-family:sans-serif; border:1px solid #eee; padding:30px; border-radius:20px;">
               <h3>🔐 Access Request</h3>
               <p><b>Site:</b> ${device.site_name}</p>
               <p><b>Mobile:</b> ${mobile}</p>
               <a href="${approvalLink}" style="background:#2563eb; color:#fff; padding:15px; border-radius:10px; text-decoration:none;">APPROVE</a>
             </div>`
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
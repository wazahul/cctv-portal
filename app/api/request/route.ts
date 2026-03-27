import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Get mobile AND device_id (deviceId frontend se aana chahiye)
    const body = await req.json();
    const { mobile, device_id } = body; 

    if (!mobile || !device_id) {
       return NextResponse.json({ success: false, error: "Missing mobile or device_id" });
    }

    // 2. Fetch Device Details from Supabase
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("sn", device_id)
      .single();

    if (fetchError || !device) {
      console.log("Device not found for SN:", device_id);
      return NextResponse.json({ success: false, error: "Device not found" });
    }

    // 3. WhatsApp Link Logic
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
    const waMessage = `🚨 *CCTV Request Received* 🚨\n📍 Site: ${device.site_name}\n🔑 User Pass: ${device.user_pass}\n🛡️ Admin Pass: ${device.admin_pass}`;
    const encoded = encodeURIComponent(waMessage);
    const waLink = `https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encoded}`;

    // 4. Send Email via Resend
    try {
      const emailResult = await resend.emails.send({
        from: "CCTV Portal <onboarding@resend.dev>", // 👈 standard for free tier
        to: "wazahul@gmail.com", // 👈 Wahi email jis se resend register kiya hai
        subject: `🚨 Request: ${device.site_name} (${new Date().toLocaleTimeString()})`,
        html: `
          <div style="font-family: sans-serif; border: 2px solid #1a9e52; padding: 20px; border-radius: 15px;">
            <h2 style="color: #1a9e52;">New Password Request</h2>
            <p><b>Site:</b> ${device.site_name}</p>
            <p><b>Technician:</b> ${mobile}</p>
            <hr/>
            <p><b>User Pass:</b> ${device.user_pass}</p>
            <p><b>Admin Pass:</b> ${device.admin_pass}</p>
            <br/>
            <a href="${waLink}" style="background:#25D366; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
              💬 Reply to Technician on WhatsApp
            </a>
          </div>
        `,
      });
      console.log("Resend Success:", emailResult);
    } catch (emailError) {
      console.error("Resend API failed:", emailError);
    }

    return NextResponse.json({ success: true, waLink });

  } catch (err) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ success: false });
  }
}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { mobile, device_id } = await req.json();

    // 1. Fetch Device details from Supabase
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("sn", device_id)
      .single();

    if (fetchError || !device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    // 2. Format WhatsApp Reply Link for Admin (Email Button)
    const cleanMobile = mobile.replace(/\D/g, "");
    const techMobile = cleanMobile.startsWith("91") ? cleanMobile : `91${cleanMobile}`;
    const waMessage = encodeURIComponent(`Hello! Here are the requested credentials for ${device.site_name}:\n\n🔑 User: ${device.user_pass}\n🛡️ Admin: ${device.admin_pass}\n🌐 IP: ${device.ip_address}`);
    const techWaLink = `https://api.whatsapp.com/send?phone=${techMobile}&text=${waMessage}`;

    // 3. Send Professional Email Alert to Admin
    await resend.emails.send({
      from: "CCTV Portal <onboarding@resend.dev>",
      to: "wazahul@gmail.com",
      subject: `🚨 NEW REQUEST: ${device.site_name}`,
      html: `
        <div style="font-family: sans-serif; border: 2px solid #1a9e52; padding: 25px; border-radius: 20px; max-width: 500px; color: #333;">
          <h2 style="color: #1a9e52; margin: 0 0 20px 0;">🔐 Password Request Alert</h2>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 2px 0;"><b>📍 Site Name:</b> ${device.site_name}</p>
            <p style="margin: 2px 0;"><b>🔢 Serial Number:</b> ${device.sn}</p>
            <p style="margin: 2px 0;"><b>📱 Technician:</b> ${mobile}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Stored Credentials:</p>
            <p style="margin: 8px 0 4px 0;"><b>User Pass:</b> ${device.user_pass}</p>
            <p style="margin: 4px 0 4px 0;"><b>Admin Pass:</b> ${device.admin_pass}</p>
            <p style="margin: 4px 0 0 0;"><b>IP Address:</b> ${device.ip_address || 'N/A'}</p>
          </div>

          <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Click below to send these details to the technician via WhatsApp:</p>

          <a href="${techWaLink}" 
             style="display: block; text-align: center; background: #25D366; color: white; padding: 16px; border-radius: 14px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);">
             💬 Reply to Technician on WhatsApp
          </a>

          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 20px;">
            Request Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
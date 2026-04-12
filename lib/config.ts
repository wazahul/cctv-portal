// lib/config.ts-
export const COMPANY = {
  name: "Modern Enterprises",
  contact: "+91 7021330886",
  portalUrl: "https://cctv-portal.vercel.app/request",
  supportEmail: "me.cctv247@gmail.com",
  senderEmail: "wazahul@gmail.com",

  branding: {
    tagline: "Advanced Surveillance Systems",
    tagline2: "SECURITY SOLUTIONS & INTERIOR DECORATOR",
    footerText: "High-Integrity Security Monitoring",
    copyRightYear: "2026",
    copyRight: "2026 | MODERN ENTERPRISES"
  },

  links: {
  linktree: "https://linktr.ee/wazahul",
  whatsapp: "https://wa.me/917021330886",
  website: "https://modernenterprises.com",
},
  app: {
    name: "CCTV Portal",
    version: "v2.0"
  }

};

/*
📌 Usage Example (Footer Component)

import { COMPANY } from "@/lib/config";

export default function Footer() {
  return (
    <div className="text-center">
      <h3 className="font-black italic">{COMPANY.name}</h3>
      <p className="text-[9px] tracking-[4px]">
        © {COMPANY.branding.copyRightYear} {COMPANY.name}
      </p>
      <p className="text-blue-500">{COMPANY.contact}</p>
    </div>
  );
}
*/

/*
📌 Usage Example (Alternative Style)

import { COMPANY } from "@/lib/config";

const company = COMPANY;

<h3 className="text-[#1a4a8d] font-[1000]">
  {company.name}
</h3>
*/


/* 
     <span 
       onClick={() => window.open(COMPANY.links.linktree, '_blank')}
       className="text-blue-500/40 hover:text-blue-400 transition-all cursor-pointer active:scale-90 whitespace-nowrap" >
       &copy; {COMPANY.branding.copyRightYear}
        </span>

*/
  
/*
📌 Usage Example (Alternative Style)

⚠️ Common Problems
❌ 1. Undefined error

Agar branding ya tagline2 nahi hai:

COMPANY.branding.tagline2 // ❌ undefined

👉 Safe version use karo:

doc.text(COMPANY?.branding?.tagline2 || "", 35, 22);
*/


/*
  <p className="text-[22px] text-center mt-8 sm:text-[14px] font-[1000] text-emerald-200 tracking-tighter uppercase italic leading-none">
             <span>
              {(COMPANY?.app?.name || "Cctv Portal").split(' ')[0]}
             </span>
             <span className="text-blue-200 italic ml-1.5">
              {(COMPANY?.app?.name || "Cctv Portal").split(' ')[1] || ""}
             </span>
             <span className="text-blue-300/50 italic text-[14px] sm:text-[10px] ml-3 tracking-[2px] font-black">
              {COMPANY?.app?.version || "v2.0"}
             </span>
            </p>
*/
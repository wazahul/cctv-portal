// lib/config.ts

export const COMPANY = {
  name: "MODERN ENTERPRISES",
  contact: "+91 7021330886",
  portalUrl: "https://cctv-portal.vercel.app/request",
  supportEmail: "admin@modern.pro",
  branding: {
    tagline: "Advanced Surveillance Systems",
    footerText: "High-Integrity Security Monitoring",
    copyRightYear: "2026",
  },

  links: {
  linktree: "https://linktr.ee/wazahul",
  whatsapp: "https://wa.me/917021330886",
  website: "https://modernenterprises.com",
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

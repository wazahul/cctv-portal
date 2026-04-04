"use client";
import { AlertTriangle, CheckCircle2, Info, HelpCircle, Loader2 } from "lucide-react";

interface MasterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "success" | "info" | "warning";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function MasterDialog({
  isOpen, onClose, onConfirm, title, message, 
  type = "info", confirmText = "Confirm", cancelText = "Cancel", isLoading = false
}: MasterDialogProps) {
  
  if (!isOpen) return null;

  // 🎨 Themes with Floating Icons & 3D Button Colors
  const themes = {
    danger: { 
      icon: <AlertTriangle size={58} strokeWidth={2.5} />, 
      color: "text-red-500", 
      btn: "bg-red-600 border-red-800 shadow-red-900/20" 
    },
    success: { 
      icon: <CheckCircle2 size={58} strokeWidth={2.5} />, 
      color: "text-emerald-500", 
      btn: "bg-emerald-600 border-emerald-800 shadow-emerald-900/20" 
    },
    info: { 
      icon: <Info size={58} strokeWidth={2.5} />, 
      color: "text-blue-600", 
      btn: "bg-blue-600 border-blue-800 shadow-blue-900/20" 
    },
    warning: { 
      icon: <HelpCircle size={58} strokeWidth={2.5} />, 
      color: "text-amber-500", 
      btn: "bg-amber-600 border-amber-800 shadow-amber-900/20" 
    },
  };

  const theme = themes[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-500">
      
      {/* 📟 Premium Floating Container */}
      <div className="bg-white w-full max-w-[400px] rounded-[65px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 relative animate-in zoom-in duration-300">
        
        <div className="p-16 text-center">
          
          {/* ✨ CLEAN FLOATING ICON (No Box) */}
          <div className={`mx-auto flex items-center justify-center mb-10 ${theme.color} drop-shadow-md transition-transform hover:scale-110 duration-500 active:scale-90`}>
            {isLoading ? (
              <Loader2 size={58} className="animate-spin text-blue-600" />
            ) : (
              theme.icon
            )}
          </div>

          {/* Text Content */}
          <h3 className="text-[28px] font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none mb-5">
            {title}
          </h3>
          <p className="text-slate-500 text-[15px] font-bold leading-relaxed italic opacity-70 px-4">
            {message}
          </p>
        </div>
        
        {/* 🚀 3D TACTILE BUTTONS SECTION */}
        <div className="flex border-t border-slate-50 bg-slate-50/50 p-5 gap-4">
          
          {/* Secondary Button (Cancel) */}
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-6 text-[11px] font-black uppercase tracking-[3px] text-slate-400 bg-white rounded-[32px] border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
          >
            {cancelText}
          </button>
          
          {/* Primary Button (Confirm) - The 3D Click Feel */}
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[3px] text-white ${theme.btn} rounded-[32px] hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all shadow-xl border-b-[6px] flex items-center justify-center gap-2 italic`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
          
        </div>

      </div>
    </div>
  );
}
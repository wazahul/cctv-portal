"use client";
// app/components/MasterDialog.tsx - 
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

  const themes = {
    danger: { icon: <AlertTriangle size={58} />, color: "text-red-500", btn: "bg-red-600 border-red-800 shadow-red-900/20" },
    success: { icon: <CheckCircle2 size={58} />, color: "text-emerald-500", btn: "bg-emerald-600 border-emerald-800 shadow-emerald-900/20" },
    info: { icon: <Info size={58} />, color: "text-blue-600", btn: "bg-blue-600 border-blue-800 shadow-blue-900/20" },
    warning: { icon: <HelpCircle size={58} />, color: "text-amber-500", btn: "bg-amber-600 border-amber-800 shadow-amber-900/20" },
  };

  const theme = themes[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* 📟 Background click handling */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* 📟 Premium Floating Box */}
      <div className="relative z-[10001] bg-white w-full max-w-[380px] rounded-[55px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 animate-in zoom-in duration-300">
        
        <div className="p-12 text-center">
          <div className={`mx-auto flex items-center justify-center mb-8 ${theme.color} drop-shadow-md`}>
            {isLoading ? <Loader2 size={58} className="animate-spin" /> : theme.icon}
          </div>

          <h3 className="text-[26px] font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none mb-4">
            {title}
          </h3>
          <p className="text-slate-500 text-[14.5px] font-bold leading-relaxed italic opacity-70 px-2">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-slate-50 bg-slate-50/50 p-5 gap-3">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="flex-1 py-5 text-[10px] font-black uppercase tracking-[2px] text-slate-400 bg-white rounded-[28px] border-2 border-slate-100 active:scale-95 transition-all">
            {cancelText}
          </button>
          
          <button type="button" onClick={onConfirm} disabled={isLoading}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[2px] text-white ${theme.btn} rounded-[28px] active:translate-y-1 transition-all border-b-[5px] flex items-center justify-center gap-2 italic`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
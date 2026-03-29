"use client";
import { X, AlertTriangle, CheckCircle2, Info, HelpCircle, Loader2 } from "lucide-react";

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

  // Type ke hisaab se colors aur icons set karna
  const themes = {
    danger: { icon: <AlertTriangle size={32} />, color: "text-red-600", bg: "bg-red-50", btn: "bg-red-600" },
    success: { icon: <CheckCircle2 size={32} />, color: "text-emerald-600", bg: "bg-emerald-50", btn: "bg-emerald-600" },
    info: { icon: <Info size={32} />, color: "text-blue-600", bg: "bg-blue-50", btn: "bg-blue-600" },
    warning: { icon: <HelpCircle size={32} />, color: "text-amber-600", bg: "bg-amber-50", btn: "bg-amber-600" },
  };

  const theme = themes[type];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[35px] shadow-2xl overflow-hidden border border-white animate-in zoom-in duration-300">
        
        <div className="p-8 text-center">
          {/* Dynamic Icon Section */}
          <div className={`mx-auto w-16 h-16 ${theme.bg} ${theme.color} rounded-full flex items-center justify-center mb-5`}>
            {isLoading ? <Loader2 size={32} className="animate-spin" /> : theme.icon}
          </div>

          <h3 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter leading-none">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-bold mt-3 leading-relaxed px-2">
            {message}
          </p>
        </div>
        
        {/* Buttons Section */}
        <div className="flex border-t border-slate-50 bg-slate-50/30">
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-5 text-[10px] font-black uppercase tracking-[2px] text-slate-400 hover:bg-white active:bg-slate-100 transition-all border-r border-slate-50 disabled:opacity-30"
          >
            {cancelText}
          </button>
          <button 
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[2px] text-white ${theme.btn} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-inner`}
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
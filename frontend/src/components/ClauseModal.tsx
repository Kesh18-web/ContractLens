"use client";

import React from "react";
import { X, Sparkles, AlertTriangle, ShieldCheck, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClauseSummary } from "@/lib/api";

export interface ClauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clause: ClauseSummary | null;
  onGenerateAlternatives?: (clauseId: string, category: string, riskLevel: string) => void;
}

export const ClauseModal: React.FC<ClauseModalProps> = ({
  isOpen,
  onClose,
  clause,
  onGenerateAlternatives,
}) => {
  if (!isOpen || !clause) return null;

  const originalText =
    clause.original_text ||
    (clause as any).clause_text ||
    (clause.text && clause.text !== clause.summary ? clause.text : null) ||
    clause.summary;

  const clauseNum = clause.clause_number || clause.order || 1;
  const flesch = clause.flesch_score ?? clause.readability_metrics?.flesch_score;
  const grade = clause.grade_level ?? clause.readability_metrics?.original_grade;

  let displayCategory = clause.category;
  if (!displayCategory || displayCategory === "Other" || displayCategory === "other") {
    const textUpper = (originalText || clause.summary || "").toUpperCase();
    if (textUpper.includes("PROJECTS")) displayCategory = "Projects";
    else if (textUpper.includes("TECHNICAL SKILLS") || textUpper.includes("SKILLS")) displayCategory = "Technical Skills";
    else if (textUpper.includes("EXPERIENCE")) displayCategory = "Experience";
    else if (textUpper.includes("EDUCATION")) displayCategory = "Education";
    else if (textUpper.includes("ACHIEVEMENTS")) displayCategory = "Achievements";
    else if (textUpper.includes("CONFIDENTIAL")) displayCategory = "Confidentiality";
    else if (textUpper.includes("TERMINAT")) displayCategory = "Termination";
    else if (textUpper.includes("PAYMENT") || textUpper.includes("FEE")) displayCategory = "Payment";
    else if (textUpper.includes("LIABILITY")) displayCategory = "Liability";
    else if (textUpper.includes("PERSON_NAME") || textUpper.includes("EMAIL")) displayCategory = "Contact Details";
    else displayCategory = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#121212] p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-semibold text-white">
              Clause {clauseNum}{displayCategory ? ` (${displayCategory})` : ""}
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span
            className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
              clause.risk_level === "attention"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : clause.risk_level === "moderate"
                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {clause.risk_level === "attention" ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            {clause.risk_level === "attention"
              ? "High Risk"
              : clause.risk_level === "moderate"
              ? "Moderate Risk"
              : "Low Risk"}
          </span>

          {flesch !== undefined && (
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Flesch Score: {Math.round(flesch)} (Grade {grade?.toFixed(1) || "N/A"})
            </span>
          )}
        </div>

        {/* Clause Summary */}
        <div className="space-y-1.5">
          <div className="text-xs uppercase tracking-wider text-white/50 font-semibold">Plain-English Summary</div>
          <div className="p-3 rounded-lg bg-[#18181B] border border-white/5 text-sm text-white/90 leading-relaxed">
            {clause.summary}
          </div>
        </div>

        {/* Original Text */}
        <div className="space-y-1.5">
          <div className="text-xs uppercase tracking-wider text-white/50 font-semibold">Original Legal Text</div>
          <div className="p-3 rounded-lg bg-[#09090B] border border-white/5 text-xs font-mono text-white/80 max-h-36 overflow-y-auto leading-normal whitespace-pre-wrap">
            &quot;{originalText}&quot;
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70">
            Close
          </Button>
          {onGenerateAlternatives && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onGenerateAlternatives(clause.clause_id, clause.category, clause.risk_level);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate AI Alternatives & Negotiate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

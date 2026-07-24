"use client";

import React from "react";
import { X, Sparkles, FileText, AlertTriangle, ShieldCheck, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClauseSummary } from "@/lib/api";

export interface ClauseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  clauses: ClauseSummary[];
  onSelectClause: (clause: ClauseSummary) => void;
  onGenerateAlternatives?: (clauseId: string, category: string, riskLevel: string) => void;
}

export const ClauseListModal: React.FC<ClauseListModalProps> = ({
  isOpen,
  onClose,
  title,
  clauses,
  onSelectClause,
  onGenerateAlternatives,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-xl border border-white/10 bg-[#121212] p-6 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              {title} <span className="text-sm font-normal text-white/50">({clauses.length} items)</span>
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Clause List Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {clauses.length === 0 ? (
            <div className="text-center py-10 text-white/50 text-sm">
              No matching clauses found for this filter.
            </div>
          ) : (
            clauses.map((clause, idx) => {
              const originalText =
                clause.original_text ||
                (clause as any).clause_text ||
                (clause.text && clause.text !== clause.summary ? clause.text : null) ||
                clause.summary;

              const clauseNum = clause.clause_number || clause.order || idx + 1;
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

              let cleanSummary = (clause.summary || "")
                .replace(/^\[Mock Summary\]\s*/i, "")
                .replace(/^This clause states that:\s*/i, "")
                .trim();

              if (!cleanSummary || cleanSummary === originalText) {
                if (displayCategory === "Payment") {
                  cleanSummary = "Outlines payment terms, fee schedules, invoice due dates, and interest rates for late payments.";
                } else if (displayCategory === "Termination") {
                  cleanSummary = "Specifies rules and notice requirements for ending the contract or canceling services.";
                } else if (displayCategory === "Confidentiality") {
                  cleanSummary = "Requires both parties to maintain strict secrecy over non-public information and trade secrets.";
                } else if (displayCategory === "IP Ownership" || displayCategory === "IP Rights") {
                  cleanSummary = "Defines intellectual property ownership rights for work product and pre-existing assets.";
                } else if (displayCategory === "Liability" || displayCategory === "Limitation of Liability") {
                  cleanSummary = "Caps total financial liability and excludes consequential or indirect damages.";
                } else {
                  cleanSummary = `Provides essential provisions regarding ${displayCategory || "contractual obligations"}.`;
                }
              }

              return (
                <div
                  key={clause.clause_id || idx}
                  className="p-4 rounded-lg bg-[#18181B] border border-white/5 hover:border-purple-500/30 transition-all duration-150 space-y-2 group"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold text-sm text-white">
                        Clause {clauseNum}{displayCategory ? ` (${displayCategory})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                          clause.risk_level === "attention"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : clause.risk_level === "moderate"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {clause.risk_level === "attention" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        {clause.risk_level === "attention"
                          ? "High Risk"
                          : clause.risk_level === "moderate"
                          ? "Moderate Risk"
                          : "Low Risk"}
                      </span>

                      {grade !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[11px] border border-purple-500/20">
                          Grade {grade.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {cleanSummary}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onSelectClause(clause);
                      }}
                      className="h-7 text-xs text-white/70 hover:text-white flex items-center gap-1"
                    >
                      Inspect Details <ChevronRight className="h-3 w-3" />
                    </Button>

                    {onGenerateAlternatives && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onClose();
                          onGenerateAlternatives(clause.clause_id, clause.category, clause.risk_level);
                        }}
                        className="h-7 text-xs bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" /> Negotiate
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-white/10 shrink-0 mt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

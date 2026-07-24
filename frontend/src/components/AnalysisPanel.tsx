import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Flame, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { ReadabilityPanel } from "@/components/ReadabilityPanel";
import { NegotiationPanel } from "@/components/NegotiationPanel";
import { ClauseSummary } from "@/lib/api";
import { ClauseInfo } from "@/hooks/useNegotiationState";
import { UseNegotiationStateReturn } from "@/hooks/useNegotiationState";

export interface AnalysisPanelProps {
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
  clauses: ClauseSummary[];
  clausesLoading: boolean;
  clausesError: Error | null;
  negotiationState: UseNegotiationStateReturn;
  selectedClauseForNegotiation: ClauseInfo | null;
  onCopyAlternative: (altId: string) => void;
  onSelectClause?: (clause: ClauseSummary) => void;
  onSelectClauseList?: (title: string, filteredClauses: ClauseSummary[]) => void;
  analysisTitle: string;
  riskAnalysisTitle: string;
  negotiationTitle: string;
  closeLabel: string;
  showNegotiationLabel: string;
}

/**
 * Right panel with risk analysis, negotiation, and readability features
 */
export const AnalysisPanel = ({
  rightPanelOpen,
  setRightPanelOpen,
  clauses,
  clausesLoading,
  clausesError,
  negotiationState,
  selectedClauseForNegotiation,
  onCopyAlternative,
  onSelectClause,
  onSelectClauseList,
  analysisTitle,
  riskAnalysisTitle,
  negotiationTitle,
  closeLabel,
  showNegotiationLabel,
}: AnalysisPanelProps) => {
  const [isExpandedWidth, setIsExpandedWidth] = useState(false);

  return (
    <>
      {/* Mobile Overlay Background */}
      {rightPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 xl:hidden"
          onClick={() => setRightPanelOpen(false)}
        />
      )}

      {/* Right Analysis Panel */}
      <aside
        className={`
        ${rightPanelOpen ? "flex" : "hidden"}
        xl:flex ${isExpandedWidth ? "w-[36rem] 2xl:w-[42rem]" : "w-[28rem]"} shrink-0 flex-col border-l border-white/10 bg-[#111111] h-full overflow-hidden transition-all duration-300
        fixed xl:relative top-0 right-0 z-30 xl:z-auto
      `}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="h-4 w-4 text-purple-400" /> {analysisTitle}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpandedWidth(!isExpandedWidth)}
                title={isExpandedWidth ? "Restore Standard Width" : "Expand Panel Width"}
                className="h-7 w-7 text-white/60 hover:text-white hidden xl:flex"
              >
                {isExpandedWidth ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(false)}
                className="h-7 w-7 text-white/60 hover:text-white xl:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-2">
            {/* Risk Analysis Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                <Flame className="h-4 w-4 text-red-500" /> {riskAnalysisTitle}
              </h3>

              <div className="space-y-4">
                {/* Risk Heatmap */}
                <RiskHeatmap
                  clauses={clauses || []}
                  isLoading={clausesLoading}
                  error={clausesError}
                  onGenerateAlternatives={
                    negotiationState.handleGenerateAlternatives
                  }
                  onSelectClause={onSelectClause}
                  onSelectClauseList={onSelectClauseList}
                />

                {/* Reopen Negotiation Button (when panel closed but data exists) */}
                {!negotiationState.negotiationPanelOpen &&
                  selectedClauseForNegotiation && (
                    <Button
                      onClick={() =>
                        negotiationState.setNegotiationPanelOpen(true)
                      }
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {showNegotiationLabel}
                    </Button>
                  )}
              </div>
            </div>

            {/* AI Negotiation Assistant Section */}
            {negotiationState.negotiationPanelOpen &&
              selectedClauseForNegotiation && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      {negotiationTitle}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        negotiationState.setNegotiationPanelOpen(false)
                      }
                      className="h-6 text-xs"
                    >
                      {closeLabel}
                    </Button>
                  </div>

                  <div className="bg-[#0F0F0F] border border-white/10 rounded-lg p-4">
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <div className="text-xs text-white/50 mb-1">
                        Original Clause (
                        {selectedClauseForNegotiation.clause_category})
                      </div>
                      <div className="text-sm text-white/90">
                        {selectedClauseForNegotiation.clause_text}
                      </div>
                      <div className="mt-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded ${
                            selectedClauseForNegotiation.risk_level ===
                            "attention"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {selectedClauseForNegotiation.risk_level ===
                          "attention"
                            ? "High Risk"
                            : "Moderate Risk"}
                        </span>
                      </div>
                    </div>

                    <NegotiationPanel
                      negotiationResponse={
                        negotiationState.negotiationQuery.generateAlternatives
                          .data ?? null
                      }
                      isLoading={
                        negotiationState.negotiationQuery.generateAlternatives
                          .isPending
                      }
                      error={
                        negotiationState.negotiationQuery.generateAlternatives
                          .error
                      }
                      onSelectAlternative={
                        negotiationState.handleSelectAlternative
                      }
                      onCopyAlternative={onCopyAlternative}
                    />
                  </div>
                </div>
              )}

            {/* Readability Analysis Section */}
            <div>
              <ReadabilityPanel
                clauses={clauses || []}
                isLoading={clausesLoading}
                error={clausesError}
                onSelectClause={onSelectClause}
                onSelectClauseList={onSelectClauseList}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

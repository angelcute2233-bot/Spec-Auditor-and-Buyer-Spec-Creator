import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { AuditResult, UploadedSpec } from "../types";

interface AuditResultsProps {
  auditResults: AuditResult[];
  originalSpecs: UploadedSpec[];
  onProceedToStage2: () => void;
  showNextStepButton?: boolean;
}

export default function AuditResults({
  auditResults,
  originalSpecs,
  onProceedToStage2,
  showNextStepButton = true,
}: AuditResultsProps) {
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  const toggleExpanded = (specName: string) => {
    const newExpanded = new Set(expandedSpecs);
    if (newExpanded.has(specName)) {
      newExpanded.delete(specName);
    } else {
      newExpanded.add(specName);
    }
    setExpandedSpecs(newExpanded);
  };

  // Categorize specs by tier
  const configSpecs = originalSpecs.filter(spec => spec.tier === "Config");
  const keySpecs = originalSpecs.filter(spec => spec.tier === "Key");
  const regularSpecs = originalSpecs.filter(spec => spec.tier === "Regular");

  // Merge audit results with original specs
  const getMergedSpecs = (specs: UploadedSpec[]) => {
    return specs.map(spec => {
      const matchingResult = auditResults.find(r => 
        r.specification.toLowerCase() === spec.spec_name.toLowerCase() ||
        isSemanticallySimilar(r.specification, spec.spec_name)
      );
      
      return {
        ...spec,
        auditResult: matchingResult || {
          specification: spec.spec_name,
          status: "correct",
          explanation: "",
          problematic_options: []
        }
      };
    });
  };

  const mergedConfigSpecs = getMergedSpecs(configSpecs);
  const mergedKeySpecs = getMergedSpecs(keySpecs);
  const mergedRegularSpecs = getMergedSpecs(regularSpecs);

  const allSpecs = [...mergedConfigSpecs, ...mergedKeySpecs, ...mergedRegularSpecs];
  const correctCount = allSpecs.filter(s => s.auditResult.status === "correct").length;
  const incorrectCount = allSpecs.filter(s => s.auditResult.status === "incorrect").length;
  const allCorrect = incorrectCount === 0;

  // Component to render specification card
  const SpecCard = ({ spec, index }: { spec: any; index: number }) => {
    const isCorrect = spec.auditResult.status === "correct";
    const isExpanded = expandedSpecs.has(spec.spec_name);
    const hasIssues = !isCorrect && spec.auditResult.explanation;

    // Get color based on tier
    const getTierColor = (tier: string) => {
      switch(tier) {
        case "Config": return "purple";
        case "Key": return "blue";
        case "Regular": return "gray";
        default: return "gray";
      }
    };

    const tierColor = getTierColor(spec.tier || "Regular");
    const bgColors = {
      purple: isCorrect ? "bg-purple-50" : "bg-red-50",
      blue: isCorrect ? "bg-blue-50" : "bg-red-50",
      gray: isCorrect ? "bg-gray-50" : "bg-red-50"
    };
    
    const borderColors = {
      purple: isCorrect ? "border-purple-200" : "border-red-300",
      blue: isCorrect ? "border-blue-200" : "border-red-300",
      gray: isCorrect ? "border-gray-200" : "border-red-300"
    };

    return (
      <div
        className={`border rounded mb-3 overflow-hidden ${bgColors[tierColor]} ${borderColors[tierColor]}`}
      >
        {/* Specification Header */}
        <div className={`p-3 ${isCorrect ? "bg-white" : "bg-red-50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-2 h-8 rounded ${isCorrect ? 
                tierColor === "purple" ? "bg-purple-500" : 
                tierColor === "blue" ? "bg-blue-500" : "bg-gray-500"
                : "bg-red-500"}`}
              ></div>
              <div>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <XCircle className="text-red-600" size={16} />
                  )}
                  <h3 className={`text-sm font-semibold ${isCorrect ? "text-gray-900" : "text-red-900"}`}>
                    {spec.spec_name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tierColor === "purple" ? "bg-purple-100 text-purple-800" :
                    tierColor === "blue" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {spec.tier || "Regular"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {spec.options.length} options
                  </span>
                </div>
              </div>
            </div>

            {hasIssues && (
              <button
                onClick={() => toggleExpanded(spec.spec_name)}
                className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded text-xs font-medium flex-shrink-0"
              >
                {isExpanded ? "Hide" : "Details"}
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>

          {/* Expandable Explanation */}
          {hasIssues && isExpanded && spec.auditResult.explanation && (
            <div className="mt-3 p-3 bg-white border border-red-200 rounded text-xs">
              <h4 className="font-semibold text-red-900 mb-2">Issues Found:</h4>
              <p className="text-red-800 mb-3">{spec.auditResult.explanation}</p>
              
              {spec.auditResult.problematic_options && 
               spec.auditResult.problematic_options.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-800 mb-2">Problematic Options:</h5>
                  <div className="flex flex-wrap gap-1">
                    {spec.auditResult.problematic_options.map((option: string, optIdx: number) => (
                      <span
                        key={optIdx}
                        className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs border border-red-300"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {spec.options.map((option: string, oIdx: number) => {
              const isProblematic = spec.auditResult.problematic_options?.includes(option);

              return (
                <span
                  key={oIdx}
                  className={`px-2 py-1 rounded text-xs ${
                    isProblematic
                      ? "bg-red-200 text-red-900 border border-red-400"
                      : isCorrect
                        ? (tierColor === "purple" ? "bg-purple-100 text-purple-900" :
                           tierColor === "blue" ? "bg-blue-100 text-blue-900" :
                           "bg-gray-100 text-gray-900")
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {option}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Audit Results</h2>
        <p className="text-gray-600 text-sm">Review specifications audit</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={18} />
            <div>
              <p className="text-lg font-bold text-green-900">{correctCount}</p>
              <p className="text-xs text-green-700">Correct</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-600" size={18} />
            <div>
              <p className="text-lg font-bold text-red-900">{incorrectCount}</p>
              <p className="text-xs text-red-700">Need Fix</p>
            </div>
          </div>
        </div>
      </div>

      {/* Config Specifications */}
      {mergedConfigSpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Config Specifications</h3>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
              {mergedConfigSpecs.length}
            </span>
          </div>
          {mergedConfigSpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
          ))}
        </div>
      )}

      {/* Key Specifications */}
      {mergedKeySpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Key Specifications</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
              {mergedKeySpecs.length}
            </span>
          </div>
          {mergedKeySpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
          ))}
        </div>
      )}

      {/* Regular Specifications */}
      {mergedRegularSpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Regular Specifications</h3>
            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
              {mergedRegularSpecs.length}
            </span>
          </div>
          {mergedRegularSpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
          ))}
        </div>
      )}

      {/* Status Message */}
      {allCorrect ? (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={16} />
            <div>
              <p className="font-medium text-green-900 text-sm">All specifications are correct!</p>
              <p className="text-xs text-green-700 mt-0.5">
                Ready for next stage.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded">
          <div className="flex items-center gap-2">
            <XCircle className="text-red-600" size={16} />
            <div>
              <p className="font-medium text-red-900 text-sm">Issues found in {incorrectCount} specification(s)</p>
              <p className="text-xs text-red-700 mt-0.5">
                Review highlighted specifications above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next Step Button */}
      {showNextStepButton && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onProceedToStage2}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded hover:from-blue-700 hover:to-blue-800 transition text-sm"
          >
            <RefreshCw size={14} />
            Extract Buyer ISQs using Website Benchmarking
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function
function isSemanticallySimilar(spec1: string, spec2: string): boolean {
  const normalize = (name: string) => name.toLowerCase().trim().replace(/[^a-z0-9]/g, ' ');
  const norm1 = normalize(spec1);
  const norm2 = normalize(spec2);
  
  if (norm1 === norm2) return true;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  return false;
}
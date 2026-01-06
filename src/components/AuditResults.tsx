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

  // Merge audit results with original specs
  const allDisplaySpecs = originalSpecs.map(spec => {
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

  const correctCount = allDisplaySpecs.filter(s => s.auditResult.status === "correct").length;
  const incorrectCount = allDisplaySpecs.filter(s => s.auditResult.status === "incorrect").length;
  const allCorrect = incorrectCount === 0;

  // Simple clean component
  const SpecCard = ({ spec, index }: { spec: any; index: number }) => {
    const isCorrect = spec.auditResult.status === "correct";
    const isExpanded = expandedSpecs.has(spec.spec_name);
    const hasIssues = !isCorrect && spec.auditResult.explanation;

    return (
      <div
        className={`border rounded-lg mb-4 overflow-hidden ${
          isCorrect
            ? "border-gray-200 bg-white hover:bg-gray-50"
            : "border-red-200 bg-red-50 hover:bg-red-100"
        } transition-colors`}
      >
        {/* Header - Clean and simple */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="text-red-600" size={18} />
                </div>
              )}
              <div>
                <h3 className={`font-semibold ${isCorrect ? "text-gray-900" : "text-red-900"}`}>
                  {spec.spec_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${isCorrect ? 
                    spec.tier === "Primary" ? "bg-blue-100 text-blue-800" :
                    spec.tier === "Secondary" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"}`}
                  >
                    {spec.tier === "Primary" ? "Config" : 
                     spec.tier === "Secondary" ? "Key" : "Regular"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {spec.options.length} options
                  </span>
                  {spec.input_type && (
                    <span className="text-xs text-gray-500">
                      • {spec.input_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {hasIssues && (
              <button
                onClick={() => toggleExpanded(spec.spec_name)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all hover:bg-gray-50"
              >
                {isExpanded ? "Hide Details" : "View Issues"}
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Issues Section */}
          {hasIssues && isExpanded && spec.auditResult.explanation && (
            <div className="mt-4 p-4 bg-white border border-red-100 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Issues Found</h4>
                  <p className="text-red-700 text-sm">{spec.auditResult.explanation}</p>
                </div>
              </div>
              
              {spec.auditResult.problematic_options && 
               spec.auditResult.problematic_options.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-800 mb-2 text-sm">Problematic Options:</h5>
                  <div className="flex flex-wrap gap-2">
                    {spec.auditResult.problematic_options.map((option: string, optIdx: number) => (
                      <span
                        key={optIdx}
                        className="px-3 py-1.5 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm"
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

        {/* Options Section - Clean grid */}
        <div className="px-4 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">All Options</span>
            <span className={`text-xs px-2 py-1 rounded ${isCorrect ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"}`}>
              {spec.options.length} total
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {spec.options.map((option: string, oIdx: number) => {
              const isProblematic = spec.auditResult.problematic_options?.includes(option);

              return (
                <div
                  key={oIdx}
                  className={`p-2.5 rounded-lg border text-sm ${isProblematic
                    ? "bg-red-50 border-red-300 text-red-900"
                    : isCorrect
                      ? "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100"
                      : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isProblematic && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <span className="truncate">{option}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Results</h1>
            <p className="text-gray-600 mt-1">Review and verify your product specifications</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg ${allCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <div className="flex items-center gap-2">
                {allCorrect ? (
                  <CheckCircle size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                <span className="font-medium">
                  {allCorrect ? "All Good" : `${incorrectCount} Issues`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Specifications</p>
                <p className="text-3xl font-bold text-gray-900">{allDisplaySpecs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-700 font-medium">{allDisplaySpecs.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-900">{correctCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Need Fix</p>
                <p className="text-3xl font-bold text-red-900">{incorrectCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="text-red-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Categories */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-bold text-gray-900">Config Specifications (Primary)</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {allDisplaySpecs.filter(s => s.tier === "Primary").length}
          </span>
        </div>
        {allDisplaySpecs.filter(s => s.tier === "Primary").map((spec, idx) => (
          <SpecCard key={idx} spec={spec} index={idx} />
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-green-500 rounded"></div>
          <h2 className="text-xl font-bold text-gray-900">Key Specifications (Secondary)</h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            {allDisplaySpecs.filter(s => s.tier === "Secondary").length}
          </span>
        </div>
        {allDisplaySpecs.filter(s => s.tier === "Secondary").map((spec, idx) => (
          <SpecCard key={idx} spec={spec} index={idx} />
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-gray-400 rounded"></div>
          <h2 className="text-xl font-bold text-gray-900">Regular Specifications (Tertiary)</h2>
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
            {allDisplaySpecs.filter(s => s.tier === "Tertiary").length}
          </span>
        </div>
        {allDisplaySpecs.filter(s => s.tier === "Tertiary").map((spec, idx) => (
          <SpecCard key={idx} spec={spec} index={idx} />
        ))}
      </div>

      {/* Final Status and Next Step */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="max-w-2xl mx-auto text-center">
          {allCorrect ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">All Specifications Verified!</h3>
              <p className="text-gray-600 mb-6">
                Your {correctCount} specifications have passed the audit. You can proceed to extract buyer specifications from websites.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="text-red-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Review Needed</h3>
              <p className="text-gray-600 mb-4">
                {incorrectCount} out of {allDisplaySpecs.length} specifications need your attention. 
                You can either fix them now or proceed to the next stage.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 inline-block">
                <p className="text-yellow-800 text-sm">
                  <span className="font-medium">Tip:</span> Review the highlighted specifications above before proceeding.
                </p>
              </div>
            </>
          )}

          {showNextStepButton && (
            <button
              onClick={onProceedToStage2}
              className="mt-8 w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={20} />
              <span className="text-lg">Extract Buyer ISQs using Website Benchmarking</span>
            </button>
          )}
        </div>
      </div>
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
import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import type { AuditResult, UploadedSpec } from "../types";

interface AuditResultsProps {
  auditResults: AuditResult[];
  originalSpecs: UploadedSpec[];
  onProceedToStage2: () => void;
  onReplaceSpec?: (specName: string, correctedOptions: string[]) => void;
}

export default function AuditResults({
  auditResults,
  originalSpecs,
  onProceedToStage2,
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

  const correctCount = auditResults.filter((r) => r.status === "correct").length;
  const incorrectCount = auditResults.filter((r) => r.status === "incorrect").length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stage 1: Specification Audit Results</h2>
        <p className="text-gray-600">Review the audit results for your specifications</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <p className="text-3xl font-bold text-green-900">{correctCount}</p>
              <p className="text-sm text-green-700">Correct Specifications</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={32} />
            <div>
              <p className="text-3xl font-bold text-red-900">{incorrectCount}</p>
              <p className="text-sm text-red-700">Incorrect Specifications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {auditResults.map((result, idx) => {
          const originalSpec = originalSpecs.find(
            (s) => s.spec_name === result.specification
          );
          const isExpanded = expandedSpecs.has(result.specification);
          const isCorrect = result.status === "correct";

          return (
            <div
              key={idx}
              className={`border-2 rounded-lg overflow-hidden ${
                isCorrect
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div
                className={`p-5 ${
                  isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {isCorrect ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        isCorrect ? "text-green-900" : "text-red-900"
                      }`}>
                        {result.specification}
                      </h3>
                      {originalSpec?.tier && (
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                          isCorrect
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}>
                          {originalSpec.tier}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isCorrect && result.explanation && (
                    <button
                      onClick={() => toggleExpanded(result.specification)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-200 hover:bg-red-300 text-red-800 rounded-lg transition text-sm font-medium"
                    >
                      {isExpanded ? "Hide Details" : "Show Details"}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>

                {!isCorrect && isExpanded && result.explanation && (
                  <div className="mt-4 p-4 bg-white border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Issues Found:</h4>
                    <p className="text-red-800 text-sm">{result.explanation}</p>
                  </div>
                )}
              </div>

              {originalSpec && (
                <div className="p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Options:</h4>
                  <div className="flex flex-wrap gap-2">
                    {originalSpec.options.map((option, oIdx) => {
                      const isProblematic =
                        !isCorrect &&
                        result.problematic_options?.includes(option);

                      return (
                        <span
                          key={oIdx}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            isProblematic
                              ? "bg-red-200 text-red-900 border-2 border-red-400"
                              : isCorrect
                                ? "bg-green-200 text-green-900 border border-green-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {option}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Step</h3>
        <p className="text-blue-800 mb-4">
          Proceed to Stage 2 to extract buyer ISQs from competitor websites
        </p>
        <button
          onClick={onProceedToStage2}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
        >
          <RefreshCw size={20} />
          Extract Buyer ISQs using Website Benchmarking
        </button>
      </div>
    </div>
  );
}

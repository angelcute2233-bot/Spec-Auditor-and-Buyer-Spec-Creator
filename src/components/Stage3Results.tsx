import React from "react";
import type { Stage1Output, ISQ } from "../types";

interface Stage3ResultsProps {
  stage1Data: Stage1Output;
  stage2Data: {
    config: ISQ;
    keys: ISQ[];
    buyers?: ISQ[];
  };
  buyerISQs: ISQ[];
}

export default function Stage3Results({ 
  stage1Data, 
  stage2Data, 
  buyerISQs 
}: Stage3ResultsProps) {
  
  // Function to find common specifications
  const findCommonSpecs = () => {
    const commonSpecs: Array<{
      name: string;
      stage1Options: string[];
      stage2Options: string[];
      tier: string;
    }> = [];

    // Flatten Stage1 specs
    const stage1AllSpecs: Array<{name: string; options: string[]; tier: string}> = [];
    
    if (stage1Data?.seller_specs) {
      stage1Data.seller_specs.forEach(ss => {
        ss.mcats.forEach(mcat => {
          // Primary specs
          if (mcat.finalized_specs?.finalized_primary_specs?.specs) {
            mcat.finalized_specs.finalized_primary_specs.specs.forEach(s => {
              stage1AllSpecs.push({
                name: s.spec_name,
                options: s.options || [],
                tier: "Primary"
              });
            });
          }
          
          // Secondary specs
          if (mcat.finalized_specs?.finalized_secondary_specs?.specs) {
            mcat.finalized_specs.finalized_secondary_specs.specs.forEach(s => {
              stage1AllSpecs.push({
                name: s.spec_name,
                options: s.options || [],
                tier: "Secondary"
              });
            });
          }
        });
      });
    }

    // Flatten Stage2 specs
    const stage2AllSpecs: Array<{name: string; options: string[]}> = [];
    
    // Add Config
    if (stage2Data?.config?.name) {
      stage2AllSpecs.push({
        name: stage2Data.config.name,
        options: stage2Data.config.options || []
      });
    }
    
    // Add Keys
    if (stage2Data?.keys) {
      stage2Data.keys.forEach(k => {
        if (k.name) {
          stage2AllSpecs.push({
            name: k.name,
            options: k.options || []
          });
        }
      });
    }

    // Helper function to check if specs are similar
    const areSpecsSimilar = (spec1: string, spec2: string): boolean => {
      const normalize = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '_');
      const norm1 = normalize(spec1);
      const norm2 = normalize(spec2);
      
      if (norm1 === norm2) return true;
      if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
      
      // Common synonym groups
      const synonymGroups = [
        ['material', 'composition', 'make'],
        ['grade', 'quality', 'class'],
        ['thickness', 'thk', 'gauge'],
        ['size', 'dimension', 'measurement'],
        ['color', 'colour', 'finish'],
        ['type', 'kind', 'variety'],
        ['shape', 'form', 'profile'],
      ];
      
      for (const group of synonymGroups) {
        const hasSpec1 = group.some(word => norm1.includes(word));
        const hasSpec2 = group.some(word => norm2.includes(word));
        if (hasSpec1 && hasSpec2) return true;
      }
      
      return false;
    };

    // Find common specs
    stage1AllSpecs.forEach(stage1Spec => {
      stage2AllSpecs.forEach(stage2Spec => {
        if (areSpecsSimilar(stage1Spec.name, stage2Spec.name)) {
          commonSpecs.push({
            name: stage1Spec.name,
            stage1Options: stage1Spec.options,
            stage2Options: stage2Spec.options,
            tier: stage1Spec.tier
          });
        }
      });
    });

    // Remove duplicates
    const uniqueCommonSpecs = commonSpecs.filter((spec, index, self) =>
      index === self.findIndex(s => 
        s.name.toLowerCase() === spec.name.toLowerCase()
      )
    );

    return uniqueCommonSpecs;
  };

  const commonSpecs = findCommonSpecs();

  // Check if we have data
  const hasStage1Data = stage1Data?.seller_specs && stage1Data.seller_specs.length > 0;
  const hasStage2Data = stage2Data?.config || stage2Data?.keys?.length > 0;

  if (!hasStage1Data || !hasStage2Data) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Insufficient data for Stage 3 analysis.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Stage 3: Results</h2>
        <p className="text-gray-600 text-sm">
          Analysis of uploaded specifications against website data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs text-blue-700 mb-0.5">Common Specifications</p>
          <p className="text-lg font-bold text-blue-900">{commonSpecs.length}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded p-3">
          <p className="text-xs text-purple-700 mb-0.5">Buyer ISQs Selected</p>
          <p className="text-lg font-bold text-purple-900">{buyerISQs.length}</p>
        </div>
      </div>

      {/* Section 1: Common Specifications */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <h3 className="text-md font-bold text-gray-900">Common Specifications</h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
            {commonSpecs.length} found
          </span>
        </div>
        
        {commonSpecs.length > 0 ? (
          <div className="space-y-3">
            {commonSpecs.map((spec, idx) => (
              <div key={idx} className={`border rounded p-3 ${
                spec.tier === "Primary" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-full rounded ${
                    spec.tier === "Primary" ? "bg-blue-500" : "bg-green-500"
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{spec.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        spec.tier === "Primary" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {spec.tier}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {/* Stage 1 Options */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Your Options ({spec.stage1Options.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {spec.stage1Options.slice(0, 4).map((option, optIdx) => (
                            <span key={optIdx} className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                              {option}
                            </span>
                          ))}
                          {spec.stage1Options.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{spec.stage1Options.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Stage 2 Options */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Website Options ({spec.stage2Options.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {spec.stage2Options.slice(0, 4).map((option, optIdx) => (
                            <span key={optIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-xs">
                              {option}
                            </span>
                          ))}
                          {spec.stage2Options.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{spec.stage2Options.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
            <p className="text-yellow-800 text-sm">No common specifications found between your uploaded specs and website data</p>
          </div>
        )}
      </div>

      {/* Section 2: Buyer ISQs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <h3 className="text-md font-bold text-gray-900">Recommended Buyer ISQs</h3>
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
            Top {buyerISQs.length} selected
          </span>
        </div>
        
        {buyerISQs.length > 0 ? (
          <div className="space-y-3">
            {buyerISQs.map((isq, idx) => (
              <div key={idx} className="border border-purple-200 rounded p-3 bg-purple-50">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-full bg-purple-500 rounded"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{isq.name}</h4>
                      <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                        Buyer ISQ {idx + 1}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Optimized Options ({isq.options.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {isq.options.map((option, optIdx) => (
                          <span key={optIdx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {option}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Combined from your specs and website data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
            <p className="text-red-800 text-sm">No Buyer ISQs could be selected</p>
            <p className="text-red-600 text-xs mt-1">No common specifications were found for buyer recommendations</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Analysis Complete:</span> Found {commonSpecs.length} common specifications 
          between your uploaded data and website benchmarks. 
          {buyerISQs.length > 0 ? ` Selected top ${buyerISQs.length} as Buyer ISQs.` : ' No Buyer ISQs selected.'}
        </p>
      </div>
    </div>
  );
}
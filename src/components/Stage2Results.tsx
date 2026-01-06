import React from "react";
import type { Stage1Output } from "../types";

interface Stage1ResultsProps {
  data: Stage1Output;
}

export default function Stage1Results({ data }: Stage1ResultsProps) {
  // If no data, show empty state
  if (!data.seller_specs || data.seller_specs.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No specifications generated yet.</p>
      </div>
    );
  }

  // Component to render spec card
  const SpecCard = ({ 
    spec, 
    tier,
    mcatName 
  }: { 
    spec: any; 
    tier: string;
    mcatName: string;
  }) => {
    // Convert tier for display
    let displayTier = tier;
    if (tier === "Primary") displayTier = "Config";
    if (tier === "Secondary") displayTier = "Key";
    if (tier === "Tertiary") displayTier = "Regular";
    
    const tierColor = displayTier === "Config" ? "purple" : 
                     displayTier === "Key" ? "blue" : "gray";
    
    return (
      <div className={`mb-3 p-3 border rounded ${tierColor === "purple" ? "bg-purple-50 border-purple-200" :
                     tierColor === "blue" ? "bg-blue-50 border-blue-200" :
                     "bg-gray-50 border-gray-200"}`}>
        <div className="flex items-start gap-2">
          <div className={`w-2 h-full rounded ${tierColor === "purple" ? "bg-purple-500" :
                         tierColor === "blue" ? "bg-blue-500" : "bg-gray-500"}`}>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">{spec.spec_name}</h4>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColor === "purple" ? "bg-purple-100 text-purple-800" :
                              tierColor === "blue" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"}`}>
                {displayTier}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              MCAT: {mcatName}
              {spec.input_type && (
                <span className="ml-2">• Type: {spec.input_type}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {spec.options && spec.options.map((option: string, oIdx: number) => (
                <span 
                  key={oIdx} 
                  className={`px-2 py-0.5 rounded text-xs ${tierColor === "purple" ? "bg-purple-100 text-purple-800" :
                           tierColor === "blue" ? "bg-blue-100 text-blue-800" :
                           "bg-gray-100 text-gray-800"}`}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Collect all specs
  const allSpecs: Array<{
    spec: any;
    tier: string;
    mcatName: string;
  }> = [];

  data.seller_specs.forEach(ss => {
    ss.mcats.forEach(mcat => {
      // Primary specs (Config)
      mcat.finalized_specs.finalized_primary_specs.specs.forEach((spec: any) => {
        allSpecs.push({
          spec,
          tier: "Primary",
          mcatName: mcat.category_name
        });
      });
      
      // Secondary specs (Key)
      mcat.finalized_specs.finalized_secondary_specs.specs.forEach((spec: any) => {
        allSpecs.push({
          spec,
          tier: "Secondary", 
          mcatName: mcat.category_name
        });
      });
      
      // Tertiary specs (Regular)
      mcat.finalized_specs.finalized_tertiary_specs.specs.forEach((spec: any) => {
        allSpecs.push({
          spec,
          tier: "Tertiary",
          mcatName: mcat.category_name
        });
      });
    });
  });

  // Filter by converted tiers
  const configSpecs = allSpecs.filter(s => s.tier === "Primary");
  const keySpecs = allSpecs.filter(s => s.tier === "Secondary");
  const regularSpecs = allSpecs.filter(s => s.tier === "Tertiary");

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Generated Specifications</h2>
        <p className="text-gray-600 text-sm">All specifications categorized by type</p>
      </div>

      {/* Config Specifications */}
      {configSpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Config Specifications</h3>
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
              {configSpecs.length}
            </span>
          </div>
          {configSpecs.map((item, idx) => (
            <SpecCard 
              key={idx} 
              spec={item.spec} 
              tier={item.tier}
              mcatName={item.mcatName} 
            />
          ))}
        </div>
      )}

      {/* Key Specifications */}
      {keySpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Key Specifications</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
              {keySpecs.length}
            </span>
          </div>
          {keySpecs.map((item, idx) => (
            <SpecCard 
              key={idx} 
              spec={item.spec} 
              tier={item.tier}
              mcatName={item.mcatName} 
            />
          ))}
        </div>
      )}

      {/* Regular Specifications */}
      {regularSpecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <h3 className="text-md font-bold text-gray-900">Regular Specifications</h3>
            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
              {regularSpecs.length}
            </span>
          </div>
          {regularSpecs.map((item, idx) => (
            <SpecCard 
              key={idx} 
              spec={item.spec} 
              tier={item.tier}
              mcatName={item.mcatName} 
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-700">{configSpecs.length}</div>
            <div className="text-xs text-gray-600">Config</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-700">{keySpecs.length}</div>
            <div className="text-xs text-gray-600">Key</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-700">{regularSpecs.length}</div>
            <div className="text-xs text-gray-600">Regular</div>
          </div>
        </div>
      </div>
    </div>
  );
}
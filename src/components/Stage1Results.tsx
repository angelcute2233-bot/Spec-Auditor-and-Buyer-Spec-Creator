import React from "react";
import type { Stage1Output } from "../types";

interface Stage1ResultsProps {
  data: Stage1Output;
}

export default function Stage1Results({ data }: Stage1ResultsProps) {
  // Helper to categorize specs from the data
  const categorizeSpecs = () => {
    const allSpecs: Array<{
      spec_name: string;
      options: string[];
      tier: string;
      mcatName: string;
    }> = [];

    data.seller_specs.forEach(ss => {
      ss.mcats.forEach(mcat => {
        // Primary = Config
        mcat.finalized_specs.finalized_primary_specs.specs.forEach(s => {
          allSpecs.push({
            spec_name: s.spec_name,
            options: s.options || [],
            tier: "Config",
            mcatName: mcat.category_name
          });
        });
        
        // Secondary = Key
        mcat.finalized_specs.finalized_secondary_specs.specs.forEach(s => {
          allSpecs.push({
            spec_name: s.spec_name,
            options: s.options || [],
            tier: "Key",
            mcatName: mcat.category_name
          });
        });
        
        // Tertiary = Regular
        mcat.finalized_specs.finalized_tertiary_specs.specs.forEach(s => {
          allSpecs.push({
            spec_name: s.spec_name,
            options: s.options || [],
            tier: "Regular",
            mcatName: mcat.category_name
          });
        });
      });
    });

    return {
      configSpecs: allSpecs.filter(s => s.tier === "Config"),
      keySpecs: allSpecs.filter(s => s.tier === "Key"),
      regularSpecs: allSpecs.filter(s => s.tier === "Regular")
    };
  };

  const { configSpecs, keySpecs, regularSpecs } = categorizeSpecs();

  // Component to render spec card
  const SpecCard = ({ spec, index }: { spec: any; index: number }) => {
    const tierColor = spec.tier === "Config" ? "purple" : 
                      spec.tier === "Key" ? "blue" : "gray";
    
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
                {spec.tier}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              MCAT: {spec.mcatName}
            </div>
            <div className="flex flex-wrap gap-1">
              {spec.options.map((option: string, oIdx: number) => (
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
          {configSpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
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
          {keySpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
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
          {regularSpecs.map((spec, idx) => (
            <SpecCard key={idx} spec={spec} index={idx} />
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
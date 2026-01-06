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
  
  // Function to find common specifications between Stage1 and Stage2
  const findCommonSpecs = () => {
    const commonSpecs: Array<{
      name: string;
      stage1Options: string[];
      stage2Options: string[];
      tier: string;
    }> = [];

    // Flatten Stage1 specs
    const stage1AllSpecs: Array<{name: string; options: string[]; tier: string}> = [];
    
    stage1Data.seller_specs.forEach(ss => {
      ss.mcats.forEach(mcat => {
        // Primary specs
        mcat.finalized_specs.finalized_primary_specs.specs.forEach(s => {
          stage1AllSpecs.push({
            name: s.spec_name,
            options: s.options || [],
            tier: "Primary"
          });
        });
        
        // Secondary specs
        mcat.finalized_specs.finalized_secondary_specs.specs.forEach(s => {
          stage1AllSpecs.push({
            name: s.spec_name,
            options: s.options || [],
            tier: "Secondary"
          });
        });
        
        // Tertiary specs
        mcat.finalized_specs.finalized_tertiary_specs.specs.forEach(s => {
          stage1AllSpecs.push({
            name: s.spec_name,
            options: s.options || [],
            tier: "Tertiary"
          });
        });
      });
    });

    // Flatten Stage2 specs
    const stage2AllSpecs = [
      stage2Data.config,
      ...stage2Data.keys,
      ...(stage2Data.buyers || [])
    ];

    // Helper function to normalize spec names
    const normalizeName = (name: string) => name.toLowerCase().trim().replace(/\s+/g, '_');

    // Find common specs
    stage1AllSpecs.forEach(stage1Spec => {
      stage2AllSpecs.forEach(stage2Spec => {
        const norm1 = normalizeName(stage1Spec.name);
        const norm2 = normalizeName(stage2Spec.name);
        
        // Check if names are similar
        if (norm1 === norm2 || 
            norm1.includes(norm2) || 
            norm2.includes(norm1) ||
            areSpecNamesSimilar(stage1Spec.name, stage2Spec.name)) {
          
          commonSpecs.push({
            name: stage1Spec.name,
            stage1Options: stage1Spec.options,
            stage2Options: stage2Spec.options || [],
            tier: stage1Spec.tier
          });
        }
      });
    });

    // Remove duplicates
    const uniqueCommonSpecs = commonSpecs.filter((spec, index, self) =>
      index === self.findIndex(s => 
        normalizeName(s.name) === normalizeName(spec.name)
      )
    );

    return uniqueCommonSpecs;
  };

  const commonSpecs = findCommonSpecs();

  // Helper function to check if spec names are similar
  const areSpecNamesSimilar = (name1: string, name2: string): boolean => {
    const synonyms: Record<string, string[]> = {
      'material': ['composition', 'fabric', 'make'],
      'grade': ['quality', 'class', 'standard'],
      'thickness': ['thk', 'gauge', 'size'],
      'size': ['dimension', 'measurement', 'length'],
      'color': ['colour', 'shade', 'finish'],
      'type': ['kind', 'variety', 'style'],
      'shape': ['form', 'profile', 'design'],
    };

    const norm1 = name1.toLowerCase().trim();
    const norm2 = name2.toLowerCase().trim();

    if (norm1 === norm2) return true;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

    // Check synonyms
    for (const [key, values] of Object.entries(synonyms)) {
      const allTerms = [key, ...values];
      const hasTerm1 = allTerms.some(term => norm1.includes(term));
      const hasTerm2 = allTerms.some(term => norm2.includes(term));
      
      if (hasTerm1 && hasTerm2) return true;
    }

    return false;
  };

  // Component to render spec comparison card
  const SpecComparisonCard = ({ spec, index }: { spec: any; index: number }) => {
    const tierColor = spec.tier === "Primary" ? "blue" : 
                     spec.tier === "Secondary" ? "green" : "amber";
    
    return (
      <div className={`mb-4 border rounded-lg overflow-hidden ${
        tierColor === "blue" ? "border-blue-200" :
        tierColor === "green" ? "border-green-200" : "border-amber-200"
      }`}>
        {/* Header */}
        <div className={`p-4 ${
          tierColor === "blue" ? "bg-blue-50" :
          tierColor === "green" ? "bg-green-50" : "bg-amber-50"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{spec.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tierColor === "blue" ? "bg-blue-100 text-blue-800" :
                  tierColor === "green" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {spec.tier === "Primary" ? "Config" : 
                   spec.tier === "Secondary" ? "Key" : "Regular"}
                </span>
                <span className="text-xs text-gray-500">
                  Common Specification
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stage 1 Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Stage 1 Options</h5>
              <div className="flex flex-wrap gap-1">
                {spec.stage1Options.slice(0, 6).map((option: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                  >
                    {option}
                  </span>
                ))}
                {spec.stage1Options.length > 6 && (
                  <span className="text-xs text-gray-500">
                    +{spec.stage1Options.length - 6} more
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {spec.stage1Options.length} options
              </p>
            </div>

            {/* Stage 2 Options */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Stage 2 Options</h5>
              <div className="flex flex-wrap gap-1">
                {spec.stage2Options.slice(0, 6).map((option: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs"
                  >
                    {option}
                  </span>
                ))}
                {spec.stage2Options.length > 6 && (
                  <span className="text-xs text-gray-500">
                    +{spec.stage2Options.length - 6} more
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {spec.stage2Options.length} options
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component to render Buyer ISQ card
  const BuyerISQCard = ({ isq, index }: { isq: ISQ; index: number }) => {
    return (
      <div className="mb-4 border border-purple-200 rounded-lg overflow-hidden bg-purple-50">
        {/* Header */}
        <div className="p-4 bg-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{isq.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-medium">
                  Buyer ISQ {index + 1}
                </span>
                <span className="text-xs text-gray-500">
                  Final Selection
                </span>
              </div>
            </div>
            <div className="text-sm font-medium text-purple-700">
              ✓ Selected for Buyers
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 bg-white">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Options for Buyers</h5>
          <div className="flex flex-wrap gap-2">
            {isq.options.map((option: string, idx: number) => (
              <span 
                key={idx} 
                className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
              >
                {option}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isq.options.length} optimized options selected from Stage 1 & 2
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Stage 3: Final Buyer ISQs</h1>
        <p className="text-gray-600">
          Common specifications identified and optimized Buyer ISQs selected
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Common Specifications</p>
              <p className="text-3xl font-bold text-gray-900">{commonSpecs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">C</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Stage 2 Specifications</p>
              <p className="text-3xl font-bold text-gray-900">
                {1 + stage2Data.keys.length + (stage2Data.buyers?.length || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold">S2</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Buyer ISQs Selected</p>
              <p className="text-3xl font-bold text-gray-900">{buyerISQs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold">B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Common Specifications */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-blue-500 rounded"></div>
          <h2 className="text-xl font-bold text-gray-900">Common Specifications</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {commonSpecs.length} found
          </span>
        </div>
        
        {commonSpecs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {commonSpecs.slice(0, 8).map((spec, idx) => (
              <SpecComparisonCard key={idx} spec={spec} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-yellow-800 font-medium">No common specifications found</p>
            <p className="text-yellow-600 text-sm mt-1">
              Stage 1 and Stage 2 specifications didn't have any matching names.
            </p>
          </div>
        )}
        
        {commonSpecs.length > 8 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 8 of {commonSpecs.length} common specifications
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Buyer ISQs */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-8 bg-purple-500 rounded"></div>
          <h2 className="text-xl font-bold text-gray-900">Selected Buyer ISQs</h2>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
            Top {buyerISQs.length} selected
          </span>
        </div>
        
        {buyerISQs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {buyerISQs.map((isq, idx) => (
              <BuyerISQCard key={idx} isq={isq} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">No Buyer ISQs selected</p>
            <p className="text-red-600 text-sm mt-1">
              Could not find suitable specifications for buyer recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Stage 3 Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Process Completed</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Stage 1: Specifications generated</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Stage 2: Website benchmarking done</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Stage 3: Common specs identified</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Buyer ISQs selected and optimized</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Review selected Buyer ISQs above</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Download results as Excel file</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Implement in your marketplace</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Monitor buyer engagement</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The system has completed analyzing specifications and selected the most relevant Buyer ISQs for your marketplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
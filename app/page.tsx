import React from "react";
import { ApplicationShell } from "../components/layout/ApplicationShell";
import { ProductionHeader } from "../components/layout/ProductionHeader";
import { ProductionHealth } from "../components/dashboard/ProductionHealth";
import { IntelligenceFeed } from "../components/dashboard/IntelligenceFeed";
import { RiskPanel } from "../components/dashboard/RiskPanel";
import { DecisionQueue } from "../components/dashboard/DecisionQueue";
import { ImpactSummary } from "../components/dashboard/ImpactSummary";

import { 
  echoPointProduction, 
  echoPointInsights, 
  echoPointAgentActivity, 
  echoPointRisks, 
  echoPointRecommendations,
  echoPointImpactProjection
} from "../lib/fixtures/echo-point";

export default function CommandCenter() {
  return (
    <ApplicationShell>
      <ProductionHeader metadata={echoPointProduction.metadata} />
      
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
        <ProductionHealth 
          production={echoPointProduction} 
          risks={echoPointRisks} 
        />
        
        <ImpactSummary 
          production={echoPointProduction}
          projection={echoPointImpactProjection}
        />
        
        <IntelligenceFeed 
          insights={echoPointInsights} 
          activities={echoPointAgentActivity} 
        />
        
        <DecisionQueue 
          recommendations={echoPointRecommendations} 
        />

        <RiskPanel 
          risks={echoPointRisks} 
        />
      </div>
    </ApplicationShell>
  );
}

// Utility functions for safe data extraction
const safeString = (value: unknown, fallback = ""): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "value" in value) {
      return typeof (value as any).value === "string" ? (value as any).value : fallback;
    }
    return fallback;
  };
  
  const safeArray = <T>(value: unknown, fallback: T[] = []): T[] => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && "value" in value) {
      return Array.isArray((value as any).value) ? (value as any).value : fallback;
    }
    return fallback;
  };
  
  const safeNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return !isNaN(parsed) ? parsed : undefined;
    }
    return undefined;
  };
  
  const safeMoneyAmount = (value: unknown): { amount?: number; currency?: string } => {
    if (typeof value === "number") {
      return { amount: value, currency: "USD" };
    }
    if (value && typeof value === "object") {
      const obj = value as any;
      return {
        amount: safeNumber(obj.amount),
        currency: typeof obj.currency === "string" ? obj.currency : "USD"
      };
    }
    return { amount: undefined, currency: undefined };
  };
  
  // Enhanced startup adapter
  const adaptStartup = (rawData: any) => {
    try {
      if (!rawData || typeof rawData !== "object") {
        console.warn("Invalid startup data provided:", rawData);
        return null;
      }
  
      // Basic fields with safe extraction
      const id = safeString(rawData.id);
      if (!id) {
        console.warn("Startup missing required ID field");
        return null;
      }
  
      const name = safeString(rawData.company_name, "Unnamed Company");
      const website = safeString(rawData.website) || undefined;
      const hq_location = safeString(rawData.hq_location) || undefined;
      const one_liner = safeString(rawData.one_liner, "No description available");
      const sectors = safeArray<string>(rawData.sectors);
      const geos = safeArray<string>(rawData.geos);
  
      // Stage handling
      const stage = safeString(rawData.stage) || undefined;
  
      // Revenue and financial data
      const revenueData = safeMoneyAmount(rawData.traction?.revenue);
      const arr_usd = revenueData.amount;
      const revenue_currency = revenueData.currency;
      const growth_pct = safeNumber(rawData.traction?.growth_rate_percent);
  
      // Valuation data
      const valuationData = safeMoneyAmount(rawData.fundraising?.pre_money);
      const valuation_usd = valuationData.amount;
  
      // Fundraising data
      const fundraisingAmount = safeMoneyAmount(rawData.fundraising?.raise_amount);
      const raise_amount = fundraisingAmount.amount;
      const raise_currency = fundraisingAmount.currency;
  
      // Founders with safe mapping
      const founders = safeArray(rawData.founders).map((founder: any) => ({
        name: safeString(founder?.name, "Unknown Founder"),
        linkedin: safeString(founder?.linkedin_url) || undefined,
        role: safeString(founder?.role) || undefined,
        past_experience: safeString(founder?.past_experience) || undefined,
      }));
  
      // Company details
      const founded_year = safeNumber(rawData.founded_year);
      const product_overview = safeString(rawData.product_overview) || undefined;
      const problem = safeString(rawData.problem) || undefined;
      const solution = safeString(rawData.solution) || undefined;
      const icp = safeString(rawData.icp) || undefined;
      const gtm = safeString(rawData.gtm_strategy) || undefined;
  
      // Technology data
      const tech_stack = safeString(rawData.technology?.tech_stack) || undefined;
      const ai_models = safeArray<string>(rawData.technology?.ai_models);
      const data_assets = safeArray<string>(rawData.technology?.data_assets);
      const defensibility = safeString(rawData.technology?.defensibility) || undefined;
  
      // Business model
      const pricing_model = safeString(rawData.unit_economics?.pricing_model) || undefined;
  
      // Use of funds
      const use_of_funds = safeArray(rawData.fundraising?.use_of_funds).map((item: any) => ({
        category: safeString(item?.category, "Unknown Category"),
        amount: {
          amount: safeNumber(item?.amount?.amount) || 0,
          currency: safeString(item?.amount?.currency, "USD")
        },
        notes: safeString(item?.notes) || undefined,
      }));
  
      // Traction data
      const notable_customers = safeArray(rawData.traction?.notable_customers).map((customer: any) => ({
        name: safeString(customer?.name, "Unknown Customer"),
        url: safeString(customer?.url) || undefined,
      }));
  
      const key_partnerships = safeArray<string>(rawData.traction?.key_partnerships);
      const kpis = safeArray(rawData.traction?.kpis);
  
      return {
        id,
        name,
        logo: undefined, // Not in JSON
        website,
        hq_location,
        sectors,
        geos,
        one_liner,
        arr_usd,
        revenue_currency,
        growth_pct,
        valuation_usd,
        founders,
        icp,
        gtm,
        stage,
        founded_year,
        product_overview,
        problem,
        solution,
        tech_stack,
        ai_models,
        data_assets,
        raise_amount,
        raise_currency,
        use_of_funds,
        notable_customers,
        key_partnerships,
        kpis,
        pricing_model,
        defensibility,
      };
    } catch (error) {
      console.error("Error adapting startup data:", error, rawData);
      return null;
    }
  };
  
  // Enhanced deck analysis adapter
  const adaptDeckAnalysis = (rawAnalysis: any) => {
    try {
      if (!rawAnalysis || typeof rawAnalysis !== "object") {
        console.warn("Invalid deck analysis data:", rawAnalysis);
        return null;
      }
  
      const id = safeString(rawAnalysis.id);
      const startup_id = safeString(rawAnalysis.startup_id);
      
      if (!id || !startup_id) {
        console.warn("Deck analysis missing required fields:", { id, startup_id });
        return null;
      }
  
      return {
        id,
        startup_id,
        summary: safeString(rawAnalysis.summary, "No summary available"),
        strengths: safeArray<string>(rawAnalysis.strengths),
        improvements: safeArray(rawAnalysis.improvements).map((imp: any) => ({
          slide: safeNumber(imp?.slide) || 0,
          category: imp?.category || 'Clarity',
          severity: imp?.severity || 'Medium',
          issue: safeString(imp?.issue, "No issue description"),
          recommendation: safeString(imp?.recommendation, "No recommendation"),
          priority_score: safeNumber(imp?.priority_score),
        })),
        missing_sections: safeArray<string>(rawAnalysis.missing_sections),
        overall_score: safeNumber(rawAnalysis.overall_score),
        created_at: safeString(rawAnalysis.created_at, new Date().toISOString()),
        schema_version: safeString(rawAnalysis.schema_version),
        document_id: safeString(rawAnalysis.document_id),
        generator: rawAnalysis.generator ? {
          model: safeString(rawAnalysis.generator.model, "unknown"),
          run_id: safeString(rawAnalysis.generator.run_id, "unknown"),
        } : undefined,
      };
    } catch (error) {
      console.error("Error adapting deck analysis:", error, rawAnalysis);
      return null;
    }
  };
  
  // Enhanced market analysis adapter
  const adaptMarketAnalyses = (rawAnalyses: any[]) => {
    try {
      return safeArray(rawAnalyses)
        .map((analysis: any) => {
          try {
            return {
              query: safeString(analysis?.query, "Unknown query"),
              summary_bullets: safeArray<string>(analysis?.summary_bullets),
              citations: safeArray(analysis?.citations).map((citation: any) => ({
                title: safeString(citation?.title, "Untitled"),
                url: safeString(citation?.url, ""),
                snippet: safeString(citation?.snippet),
                relevance_score: safeNumber(citation?.relevance_score),
              })),
              confidence_score: safeNumber(analysis?.confidence_score),
              last_updated: safeString(analysis?.last_updated),
            };
          } catch (error) {
            console.warn("Error adapting single market analysis:", error, analysis);
            return null;
          }
        })
        .filter((item) => item !== null);
    } catch (error) {
      console.error("Error adapting market analyses:", error, rawAnalyses);
      return [];
    }
  };
  
  // Enhanced tough questions adapter
  const adaptToughQuestions = (rawQuestions: any[]) => {
    try {
      return safeArray(rawQuestions)
        .map((q: any) => {
          try {
            return {
              question: safeString(q?.question, "No question provided"),
              why_it_matters: safeString(q?.why_it_matters, "No explanation provided"),
              suggested_answer_outline: safeString(q?.suggested_answer_outline, "No answer outline provided"),
            };
          } catch (error) {
            console.warn("Error adapting single tough question:", error, q);
            return null;
          }
        })
        .filter((item) => item !== null);
    } catch (error) {
      console.error("Error adapting tough questions:", error, rawQuestions);
      return [];
    }
  };
  
  // Enhanced matches adapter
  const adaptMatches = (rawMatches: any[]) => {
    try {
      return safeArray(rawMatches)
        .map((match: any) => {
          try {
            const id = safeString(match?.id);
            const startup_id = safeString(match?.startup_id);
            const investor_id = safeString(match?.investor_id);
            
            if (!id || !startup_id || !investor_id) {
              console.warn("Match missing required fields:", { id, startup_id, investor_id });
              return null;
            }
  
            // Validate direction
            const direction = match?.direction;
            if (direction !== 'startup_to_investor' && direction !== 'investor_to_startup') {
              console.warn("Invalid match direction:", direction);
              return null;
            }
  
            // Safe breakdown extraction with defaults
            const breakdown = match?.breakdown || {};
            const validatedBreakdown = {
              sector: safeNumber(breakdown.sector) ?? 0,
              stage: safeNumber(breakdown.stage) ?? 0,
              geo: safeNumber(breakdown.geo) ?? 0,
              check: safeNumber(breakdown.check) ?? 0,
              thesis_semantic: safeNumber(breakdown.thesis_semantic) ?? 0,
              penalties: safeNumber(breakdown.penalties) ?? 0,
            };
  
            return {
              id,
              direction,
              startup_id,
              investor_id,
              score: safeNumber(match?.score) ?? 0,
              breakdown: validatedBreakdown,
              rationale: safeString(match?.rationale, "No rationale provided"),
              intro: safeString(match?.intro, ""), // This might be empty initially
              created_at: safeString(match?.created_at, new Date().toISOString()),
              investor_name: safeString(match?.investor_name), // Optional field
              investor_focus: safeArray<string>(match?.investor_focus), // Optional field
            };
          } catch (error) {
            console.warn("Error adapting single match:", error, match);
            return null;
          }
        })
        .filter((item) => item !== null);
    } catch (error) {
      console.error("Error adapting matches:", error, rawMatches);
      return [];
    }
  };
  
  // Export adapters and utilities
  export { 
    adaptStartup, 
    adaptDeckAnalysis, 
    adaptMarketAnalyses, 
    adaptToughQuestions,
    adaptMatches,
    safeString,
    safeArray,
    safeNumber,
    safeMoneyAmount
  };
import type { ToolDefinition } from "./types";

export const getStockFundamentalsTool: ToolDefinition = {
  spec: {
    name: "get_stock_fundamentals",
    description:
      "Get company fundamentals: business description, key financial ratios (P/E, P/B, ROE, EPS), and latest quarterly or annual financial statements. Use this for valuation questions or business analysis.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker code, e.g. VIC, VHM, FPT",
        },
      },
      required: ["ticker"],
    },
  },

  async execute({ ticker }, { serviceClient }) {
    const code = String(ticker).toUpperCase().trim();

    const [profileRes, financialsRes, ratioRankRes] = await Promise.all([
      serviceClient
        .from("company_profiles")
        .select("profile, business_info, updated_at")
        .eq("symbol_code", code)
        .single(),

      // Fetch the two most recent periods (TTM + latest quarter)
      serviceClient
        .from("company_financials")
        .select("period, period_type, ratios, statements")
        .eq("symbol_code", code)
        .order("fetched_at", { ascending: false })
        .limit(2),

      // Key ratio rankings vs. sector peers
      serviceClient
        .from("financial_ratio_ranking")
        .select("metric, value, rank, sector, period")
        .eq("symbol_code", code)
        .in("metric", ["PE", "PB", "ROE", "EPS", "DEBT_TO_EQUITY"])
        .order("refreshed_at", { ascending: false })
        .limit(10),
    ]);

    const profile = profileRes.data;
    const financials = financialsRes.data ?? [];
    const ratioRanks = ratioRankRes.data ?? [];

    if (!profile && !financials.length) {
      return {
        error: `No fundamental data found for ${code}`,
        ticker: code,
      };
    }

    return {
      ticker: code,
      profile: profile?.profile ?? null,
      business_info: profile?.business_info ?? null,
      latest_financials: financials.map((f) => ({
        period: f.period,
        period_type: f.period_type,
        // Only include ratios, not raw statements, to conserve tokens
        ratios: f.ratios,
      })),
      ratio_rankings: ratioRanks,
    };
  },
};

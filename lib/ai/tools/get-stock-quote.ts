import type { ToolDefinition } from "./types";

export const getStockQuoteTool: ToolDefinition = {
  spec: {
    name: "get_stock_quote",
    description:
      "Get the latest real-time price quote for a Vietnam (HOSE/HNX) or Korea (KOSPI/KOSDAQ) stock. Returns current price, percentage change, volume, session state, and basic company info.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description:
            "Stock ticker code (case-insensitive), e.g. VIC, VHM, FPT, HPG, SSB",
        },
      },
      required: ["ticker"],
    },
  },

  async execute({ ticker }, { serviceClient }) {
    const code = String(ticker).toUpperCase().trim();

    const [quoteRes, symbolRes] = await Promise.all([
      serviceClient
        .from("symbol_quotes_latest")
        .select(
          "ref_price, last_price, pct_change, total_volume, total_value, session, quote_time, foreign_buy_vol, foreign_sell_vol",
        )
        .eq("symbol_code", code)
        .single(),
      serviceClient
        .from("symbols")
        .select("name, short_name, exchange, sector, industry, symbol_type")
        .eq("code", code)
        .single(),
    ]);

    if (quoteRes.error || !quoteRes.data) {
      return { error: `No quote data found for ${code}`, ticker: code };
    }

    const q = quoteRes.data;
    const s = symbolRes.data;

    return {
      ticker: code,
      name: s?.name ?? code,
      exchange: s?.exchange,
      sector: s?.sector,
      industry: s?.industry,
      ref_price: q.ref_price,
      last_price: q.last_price,
      pct_change: q.pct_change,
      total_volume: q.total_volume,
      total_value: q.total_value,
      foreign_buy_vol: q.foreign_buy_vol,
      foreign_sell_vol: q.foreign_sell_vol,
      session: q.session,
      quote_time: q.quote_time,
    };
  },
};

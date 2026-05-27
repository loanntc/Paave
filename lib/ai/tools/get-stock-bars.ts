import type { ToolDefinition } from "./types";

const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

export const getStockBarsTool: ToolDefinition = {
  spec: {
    name: "get_stock_bars",
    description:
      "Get daily OHLCV (open/high/low/close/volume) price bars for a stock. Use this to describe recent price trends, identify support/resistance levels, or explain price movements over a time period.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker code, e.g. VIC, VHM, FPT",
        },
        days: {
          type: "number",
          description: `Number of trading days to return. Default: ${DEFAULT_DAYS}. Max: ${MAX_DAYS}.`,
        },
      },
      required: ["ticker"],
    },
  },

  async execute({ ticker, days }, { serviceClient }) {
    const code = String(ticker).toUpperCase().trim();
    const limit = Math.min(
      typeof days === "number" && days > 0 ? days : DEFAULT_DAYS,
      MAX_DAYS,
    );

    const { data, error } = await serviceClient
      .from("symbol_day_bars")
      .select("trade_date, open, high, low, close, volume, value")
      .eq("symbol_code", code)
      .order("trade_date", { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      return { error: `No price history found for ${code}`, ticker: code };
    }

    // Return in chronological order for easier analysis
    const bars = [...data].reverse();

    const closes = bars.map((b) => Number(b.close)).filter(Boolean);
    const latest = closes.at(-1) ?? 0;
    const oldest = closes.at(0) ?? latest;
    const periodChange =
      oldest > 0 ? ((latest - oldest) / oldest) * 100 : 0;

    return {
      ticker: code,
      period_days: bars.length,
      period_change_pct: Number(periodChange.toFixed(2)),
      latest_close: latest,
      bars: bars.map((b) => ({
        date: b.trade_date,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume,
      })),
    };
  },
};

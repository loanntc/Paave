import type { ToolDefinition } from "./types";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;

export const getStockNewsTool: ToolDefinition = {
  spec: {
    name: "get_stock_news",
    description:
      "Get recent news articles and announcements related to a specific stock. Use this to explain recent price movements, identify catalysts, or summarise the latest company news.",
    input_schema: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker code, e.g. VIC, VHM, FPT",
        },
        limit: {
          type: "number",
          description: `Maximum number of articles to return. Default: ${DEFAULT_LIMIT}. Max: ${MAX_LIMIT}.`,
        },
      },
      required: ["ticker"],
    },
  },

  async execute({ ticker, limit }, { serviceClient }) {
    const code = String(ticker).toUpperCase().trim();
    const take = Math.min(
      typeof limit === "number" && limit > 0 ? limit : DEFAULT_LIMIT,
      MAX_LIMIT,
    );

    const [newsRes, annRes] = await Promise.all([
      // General news mentioning this ticker
      serviceClient
        .from("news_items")
        .select("id, source, title, body, published_at, url, language")
        .contains("symbols", [code])
        .order("published_at", { ascending: false })
        .limit(take),
      // Company-specific announcements
      serviceClient
        .from("news_announcements")
        .select("id, type, title, body, published_at, url")
        .eq("symbol_code", code)
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

    const articles = (newsRes.data ?? []).map((a) => ({
      type: "news",
      source: a.source,
      title: a.title,
      // Truncate body to first 300 chars to stay within context budget
      summary: a.body ? String(a.body).slice(0, 300) : null,
      published_at: a.published_at,
      url: a.url,
      language: a.language,
    }));

    const announcements = (annRes.data ?? []).map((a) => ({
      type: "announcement",
      source: "HOSE/HNX",
      title: a.title,
      summary: a.body ? String(a.body).slice(0, 300) : null,
      published_at: a.published_at,
      url: a.url,
    }));

    // Merge and sort by date
    const all = [...announcements, ...articles].sort(
      (x, y) =>
        new Date(y.published_at).getTime() - new Date(x.published_at).getTime(),
    );

    return {
      ticker: code,
      count: all.length,
      items: all,
    };
  },
};

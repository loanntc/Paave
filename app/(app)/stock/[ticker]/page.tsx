import { StockDetailView } from "./stock-detail-view";

export function generateMetadata({ params }: { params: { ticker: string } }) {
  return {
    title: `${params.ticker.toUpperCase()} · PAAVE`,
  };
}

export default function StockDetailPage({
  params,
}: {
  params: { ticker: string };
}) {
  return <StockDetailView ticker={params.ticker} />;
}

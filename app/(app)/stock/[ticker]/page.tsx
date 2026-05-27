import { StockDetailView } from "./stock-detail-view";

interface Props {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} · PAAVE` };
}

export default async function StockDetailPage({ params }: Props) {
  const { ticker } = await params;
  return <StockDetailView ticker={ticker.toUpperCase()} />;
}

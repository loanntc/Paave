import { Suspense } from "react";
import { VerifyOtpView } from "./verify-otp-view";

export const metadata = {
  title: "Check the Vibe · PAAVE",
};

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <Suspense>
      <VerifyOtpResolver searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyOtpResolver({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyOtpView email={email ?? "alex@vibe.com"} />;
}

import { ConfirmEmailContent } from "./ConfirmEmailContent";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ConfirmEmailContent email={email ?? ""} />;
}

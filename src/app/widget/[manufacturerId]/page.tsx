import { ChatWidget } from "./ChatWidget";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ manufacturerId: string }>;
}) {
  const { manufacturerId } = await params;
  return <ChatWidget manufacturerId={manufacturerId} />;
}

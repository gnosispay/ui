import CardDetailsAndSettings from "../card-details-and-settings";

export default async function Home({ params }: { params: { cardId: string } }) {
  const { cardId } = params;
  return <CardDetailsAndSettings cardId={cardId as string} />;
}

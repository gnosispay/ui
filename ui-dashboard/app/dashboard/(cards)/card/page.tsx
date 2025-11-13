import { redirect } from "next/navigation";
import { getCards } from "../cards/actions";
import CardDetailsAndSettings from "./card-details-and-settings";

export default async function Home() {
  const cards = await getCards();
  const activeCards = cards.filter((card) => card.activatedAt !== null);
  const [firstActiveCard] = activeCards;

  if (activeCards.length > 1) {
    redirect("/dashboard/cards");
  }

  if (!firstActiveCard) {
    return null;
  }

  return (
    <>
      <div className="px-4"></div>

      <CardDetailsAndSettings cardId={firstActiveCard.id} />
    </>
  );
}

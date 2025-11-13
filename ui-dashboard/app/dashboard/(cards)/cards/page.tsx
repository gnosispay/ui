import { getNonVoidedCards } from "./actions";
import { CardList } from "./card-list";

export default async function Cards() {
  const cards = await getNonVoidedCards();

  return <CardList cards={cards} />;
}

export const CardsRoute = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-full mt-4">
      <div className="col-span-4 col-start-2">
        <h2 className="text-xl">Your Cards</h2>
        <p className="text-muted-foreground">Manage your virtual and physical cards.</p>
      </div>
      <div className="col-span-4 col-start-2">
        {/* Here you would typically render your cards component */}
        {/* <Cards /> */}
      </div>
    </div>
  );
};

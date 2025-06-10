import "@rainbow-me/rainbowkit/styles.css";
import { HeaderNavBar } from "./components/nav/header";
import { Route, Routes } from "react-router";
import { CardsRoute } from "./pages/Cards";
import { Home } from "./pages/Home";
import { FooterNavBar } from "./components/nav/footer";
import { Home as HomeIcon, CreditCard } from "lucide-react";

export const routes = [
  {
    path: "/",
    element: <Home />,
    icon: HomeIcon,
    label: "Home",
  },
  {
    path: "/cards",
    element: <CardsRoute />,
    icon: CreditCard,
    label: "Cards",
  },
];

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavBar />
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <FooterNavBar />
    </div>
  );
}

export default App;

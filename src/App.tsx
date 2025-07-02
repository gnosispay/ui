import "@rainbow-me/rainbowkit/styles.css";
import { HeaderNavBar } from "./components/nav/header";
import { Route, Routes } from "react-router";
import { CardsRoute } from "./pages/Cards";
import { Home } from "./pages/Home";
import { FooterNavBar } from "./components/nav/footer";
import { Home as HomeIcon, CreditCard } from "lucide-react";
import { SignUpRoute } from "./pages/SignUp";
import { KycRoute } from "./pages/Kyc";
import { SafeDeploymentRoute } from "./pages/SafeDeployment";
export const menuRoutes = [
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
const allRoutes = [
  ...menuRoutes,
  {
    path: "/register",
    element: <SignUpRoute />,
  },
  {
    path: "/kyc",
    element: <KycRoute />,
  },
  {
    path: "/safe-deployment",
    element: <SafeDeploymentRoute />,
  },
];

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavBar />
      <Routes>
        {allRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <FooterNavBar />
    </div>
  );
}

export default App;

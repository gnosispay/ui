import { HeaderNavBar } from "./components/nav/header";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { CardsRoute } from "./pages/Cards";
import { Home } from "./pages/Home";
import { FooterNavBar } from "./components/nav/footer";
import { Home as HomeIcon, CreditCard, User } from "lucide-react";
import { SignUpRoute } from "./pages/SignUp";
import { KycRoute } from "./pages/Kyc";
import { SafeDeploymentRoute } from "./pages/SafeDeployment";
import { AuthGuard } from "@/components/AuthGuard";
import { AccountRoute } from "./pages/Account";
import { PartnersRoute } from "./pages/Partners";
import { ExistingCardOrder, NewCardOrder } from "./components/card-order";
import { useZendeskUserId } from "./hooks/useZendeskUserId";
import { AppLoader } from "./components/AppLoader";
import { useAppInitialization } from "./hooks/useAppInitialization";

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
  {
    path: "/account",
    element: <AccountRoute />,
    icon: User,
    label: "Account",
  },
];

const publicRoutes = [
  {
    path: "/partners",
    element: <PartnersRoute />,
    label: "Apps",
  },
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
  {
    path: "/card-order/new",
    element: <NewCardOrder />,
  },
  {
    path: "/card-order/:orderId",
    element: <ExistingCardOrder />,
  },
  {
    path: "/signup",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/signin",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/welcome",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/activation/choose-partner",
    element: <Navigate to="/partners" replace />,
  },
];

function ProtectedLayout({ checkForSignup }: { checkForSignup?: boolean }) {
  return (
    <AuthGuard checkForSignup={checkForSignup}>
      <Outlet />
    </AuthGuard>
  );
}

function App() {
  useZendeskUserId();
  const { isInitializing } = useAppInitialization();

  if (isInitializing) {
    return <AppLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavBar />
      <Routes>
        <Route element={<ProtectedLayout checkForSignup={false} />}>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route element={<ProtectedLayout checkForSignup={true} />}>
          {menuRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
      <FooterNavBar />
    </div>
  );
}

export default App;

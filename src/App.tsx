import "@rainbow-me/rainbowkit/styles.css";
import { HeaderNavBar } from "./components/nav/header";
import { Route, Routes } from "react-router";
import { CardsRoute } from "./pages/Cards";
import { Home } from "./pages/Home";
import { FooterNavBar } from "./components/nav/footer";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderNavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cards" element={<CardsRoute />} />
      </Routes>
      <FooterNavBar />
    </div>
  );
}

export default App;

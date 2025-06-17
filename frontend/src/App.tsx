import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/homepage/HomePage";
import ParentLoginPage from "./components/login/ParentLoginPage";
import ParentRegisterPage from "./components/login/ParentRegisterPage";
import KidLoginPage from "./components/login/KidLoginPage";
import KidRegisterPage from "./components/login/KidRegisterPage";
import ParentDashboard from "./components/parent/ParentDashboard";
import ChildDashboard from "./components/kid/KidDashboard";
import PetShop, { ShopItem } from "./components/pet/PetShop";
import { Toaster } from "./components/ui/toaster";

const shopItems: ShopItem[] = [
  { id: "food1", name: "Pet Food", price: 10, image: "/images/shop/food.png", type: "food" },
  { id: "toy1", name: "Ball", price: 15, image: "/images/shop/ball.png", type: "toy" },
  { id: "energy1", name: "Energy Drink", price: 20, image: "/images/shop/energy.png", type: "energy" },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<WelcomePage />} />
        <Route path='/login/parent' element={<ParentLoginPage />} />
        <Route path='/register/parent' element={<ParentRegisterPage />} />
        <Route path='/login/kid' element={<KidLoginPage />} />
        <Route path='/register/kid' element={<KidRegisterPage />} />
        <Route path='/parent/dashboard' element={<ParentDashboard />} />
        <Route path='/kid/dashboard' element={<ChildDashboard />} />
        <Route path='/kid/shop' element={<PetShop items={shopItems} coins={100} onBuy={item => console.log("Bought:", item)} />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

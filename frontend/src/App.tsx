import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/homepage/HomePage";
import ParentLoginPage from "./components/login/ParentLoginPage";
import ParentRegisterPage from "./components/login/ParentRegisterPage";
import KidLoginPage from "./components/login/KidLoginPage";
import KidRegisterPage from "./components/login/KidRegisterPage";
import ParentDashboard from "./components/parent/ParentDashboard";
import ChildDashboard from "./components/kid/KidDashboard";
import PetShop from "./components/pet/PetShop";
import VirtualPet from "./components/pet/VirtualPet";
import { Toaster } from "./components/ui/toaster";
import Tasks from "./components/tasks/Tasks";

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
        <Route path='/kid/shop' element={<PetShop />} />
        <Route path='/kid/tasks' element={<Tasks />} />
        <Route path='/kid/virtualpet' element={<VirtualPet />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

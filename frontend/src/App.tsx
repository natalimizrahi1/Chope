import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/homepage/HomePage";
import ParentLoginPage from "./components/login/ParentLoginPage";
import ParentRegisterPage from "./components/login/ParentRegisterPage";
import KidLoginPage from "./components/login/KidLoginPage";
import KidRegisterPage from "./components/login/KidRegisterPage";
import ParentDashboard from "./components/parent/ParentDashboard";
import ChildDashboard from "./components/kid/KidDashboard";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login/parent' element={<ParentLoginPage />} />
        <Route path='/register/parent' element={<ParentRegisterPage />} />
        <Route path='/login/kid' element={<KidLoginPage />} />
        <Route path='/register/kid' element={<KidRegisterPage />} />
        <Route path='/parent/dashboard' element={<ParentDashboard />} />
        <Route path='/kid/dashboard' element={<ChildDashboard />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

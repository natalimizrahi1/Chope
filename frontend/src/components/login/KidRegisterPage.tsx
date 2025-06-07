import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function KidRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <LoginPage
      mode="register"
      userType="kid"
      onSwitchMode={() => navigate('/login/kid')}
      key={location.pathname}
    >
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="Your name" required />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" min="1" max="18" placeholder="Your age" required />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="parentId">Parent ID</Label>
        <Input id="parentId" type="text" placeholder="Parent ID or Email" required />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Register
      </Button>
    </LoginPage>
  );
} 
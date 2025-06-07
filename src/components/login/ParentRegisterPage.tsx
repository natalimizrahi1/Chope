import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function ParentRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <LoginPage
      mode="register"
      userType="parent"
      onSwitchMode={() => navigate('/login/parent')}
      key={location.pathname}
    >
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="Your name" required />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" required />
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
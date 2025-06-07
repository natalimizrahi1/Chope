import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function ParentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <LoginPage
      mode="login"
      userType="parent"
      onSwitchMode={() => navigate('/register/parent')}
      key={location.pathname}
    >
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
            Forgot your password?
          </a>
        </div>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
    </LoginPage>
  );
} 
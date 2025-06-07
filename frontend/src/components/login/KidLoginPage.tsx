import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { login } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function KidLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting login form with data:", formData);

    try {
      const response = await login(formData);
      console.log("Login response:", response);

      // Store token and user in localStorage or sessionStorage based on remember
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", response.token);
      storage.setItem(
        "user",
        JSON.stringify({
          id: response._id || response.id,
          name: response.name,
          email: response.email,
          role: "child",
        })
      );

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      navigate("/kid/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <LoginPage mode='login' userType='child' onSwitchMode={() => navigate("/register/kid")} key={location.pathname}>
      <form onSubmit={handleSubmit} className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' name='email' type='email' placeholder='m@example.com' value={formData.email} onChange={handleChange} required />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <a href='#' className='text-sm text-primary hover:underline underline-offset-4'>
              Forgot password?
            </a>
          </div>
          <Input id='password' name='password' type='password' value={formData.password} onChange={handleChange} required />
        </div>
        <div className='flex items-center gap-2'>
          <input id='remember' type='checkbox' checked={remember} onChange={e => setRemember(e.target.checked)} className='accent-primary' />
          <Label htmlFor='remember'>Remember Me</Label>
        </div>
        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </LoginPage>
  );
}

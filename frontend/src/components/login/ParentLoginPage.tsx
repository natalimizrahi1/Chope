import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { login } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function ParentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting login form with data:", formData);

    try {
      const response = await login(formData.email, formData.password);
      console.log("Login response:", response);

      // Store token in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response._id,
          name: response.name,
          email: response.email,
          role: response.role,
        })
      );

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
      navigate("/parent/dashboard");
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
    <LoginPage mode='login' userType='parent' onSwitchMode={() => navigate("/register/parent")} key={location.pathname}>
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
        <Button type='submit' className='relative bg-[#ffd986] text-white font-bold px-6 md:px-8 py-2 rounded-full shadow hover:bg-[#ffd36a] transition overflow-hidden border-none w-full text-sm md:text-base' disabled={loading}>
          {loading ? "Logging in..." : "Login"}
          <span
            className='pointer-events-none absolute inset-0 rounded-full'
            style={{
              border: "2px dashed #fff",
              top: "2px",
              left: "2px",
              right: "2px",
              bottom: "2px",
              position: "absolute",
              borderRadius: "9999px",
              boxSizing: "border-box",
              zIndex: 1,
            }}
          />
        </Button>
      </form>
    </LoginPage>
  );
}

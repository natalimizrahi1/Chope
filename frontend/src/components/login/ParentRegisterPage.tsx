import LoginPage from "./LoginPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { register } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function ParentRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting form with data:", formData);

    try {
      const response = await register({
        ...formData,
        role: "parent",
      });
      console.log("Registration response:", response);

      toast({
        title: "Registration successful!",
        description: "You can now login to your account.",
      });
      navigate("/login/parent");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
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
    <LoginPage mode='register' userType='parent' onSwitchMode={() => navigate("/login/parent")} key={location.pathname}>
      <form onSubmit={handleSubmit} className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='name'>Name</Label>
          <Input id='name' name='name' type='text' placeholder='Your name' value={formData.name} onChange={handleChange} required />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' name='email' type='email' placeholder='m@example.com' value={formData.email} onChange={handleChange} required />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' name='password' type='password' value={formData.password} onChange={handleChange} required minLength={6} />
        </div>
        <Button type='submit' className='relative bg-[#ffd986] text-white font-bold px-6 md:px-8 py-2 rounded-full shadow hover:bg-[#ffd36a] transition overflow-hidden border-none w-full text-sm md:text-base' disabled={loading}>
          {loading ? "Registering..." : "Register"}
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

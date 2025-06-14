import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import axios from 'axios';
import useLoginValidation from '@/hooks/useLoginValidation';
import { Spinner } from '@/components/ui/Spinner';
import { motion } from "framer-motion";
import Cookies from 'js-cookie';

export default function AdminLogin({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValidityMessage, setEmailValidityMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailMessageStyle, setEmailMessageStyle] = useState('hidden');
  const [errorMessageStyle, setErrorMessageStyle] = useState('hidden');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const route = useRouter();

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(email)) {
      setEmailMessageStyle("text-green-500");
      setEmailValidityMessage("Valid email format.");
    } else {
      setEmailMessageStyle("text-red-500");
      setEmailValidityMessage("Invalid email format.");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessageStyle("hidden");

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/login-admin/`;

    const login_credentials = {
      email: email,
      password_hash: password
    };
    try {
      const response = await axios.post(API_URL, login_credentials, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      Cookies.set("access_token", response.data.access);
      route.push("/admin/dashboard");
    } catch(error) {
      setErrorMessage(error.response?.data?.error || "An error occurred. Please try again.");
      setErrorMessageStyle("");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useLoginValidation(setLoading, "/admin/dashboard");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
        <a href="#" className="flex items-center gap-2 font-medium">
  <div className="flex items-center justify-center">
    <Image
      src="/logo.png"
      alt="Hostelio Logo"
      width={50}
      height={50}
      className="h-12 w-12"  
    />
  </div>
  <motion.span
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="text-green-800 text-2xl font-bold"
  >
    Hostelio
  </motion.span>
</a>

        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[65%] flex justify-center">
            <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your email below to login to your admin account
                </p>
              </div>
              <div className="grid gap-6 max-w-xs">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); isValidEmail(e.target.value); }}
                  />
                  <p className={`mt-1 text-xs ${emailMessageStyle}`}>{emailValidityMessage}</p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <p className={`mt-1 text-xs text-red-500 ${errorMessageStyle}`}>{errorMessage}</p>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Spinner /> : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-y-0 left-0 w-px bg-border"></div>
        <Image
          src="/tree-house.jpg"
          alt="Login Cover"
          width={1920}
          height={1080}
          className="h-full w-full rounded-lg"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
    </div>
  );
}

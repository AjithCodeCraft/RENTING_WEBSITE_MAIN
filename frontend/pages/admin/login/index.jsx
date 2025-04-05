import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import axios from 'axios';
import useLoginValidation from '@/hooks/useLoginValidation';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLogin({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValidityMessage, setEmailValidityMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailMessageStyle, setEmailMessageStyle] = useState('hidden');
  const [errorMessageStyle, setErrorMessageStyle] = useState('hidden');
  const [loading, setLoading] = useState(true);
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

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/login-admin/`;

    const login_credentials = {
      email: email,
      password_hash: password
    };
    try {
      setErrorMessageStyle("hidden");
      const response = await axios.post(API_URL, login_credentials, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      localStorage.setItem("access_token", response.data.access);
      route.push("/admin/dashboard");
    } catch(error) {
      setErrorMessage(error.response.data.error);
      setErrorMessageStyle("");
      console.log(error);
    }
  };

  useLoginValidation(setLoading, "/admin/dashboard");

  return loading ? <Spinner /> : (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
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
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className={`mt-1 text-xs text-red-500 ${errorMessageStyle}`}>{errorMessage}</p>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/admin/signup" className="underline underline-offset-4">
                  Sign up
                </a>
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
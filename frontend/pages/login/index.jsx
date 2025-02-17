import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useState } from "react";
import Router from "next/router";
import axiosInstance from "@/axios/axios";

export default function LoginPage({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Send POST request to login
      const response = await axiosInstance.post('login/', {
        email: email,
        password_hash: password,
      });
  
      // Save the token to session storage
      sessionStorage.setItem("token", response.data.access);
  
      // Check the user_type and navigate accordingly
      const userType = response.data.user_type;  // Assuming this is in the response
  
      // You can add different conditions for various user types
      if (userType === 'owner') {
        Router.push("/owner");  // Replace with actual admin route
      } else if (userType === 'seeker') {
        Router.push("/users");  // Replace with actual user route
      } else {
        console.log("Error") // Fallback route if user_type is unexpected
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred during login");
    }
  };
  

  return (
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
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your email and password below to login
                </p>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                {errorMessage && (
                  <div className="text-red-500 text-sm text-center">{errorMessage}</div>
                )}
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4">
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

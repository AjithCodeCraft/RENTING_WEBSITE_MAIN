import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Router from "next/router";
import { Spinner } from '@/components/ui/Spinner';
import { motion } from "framer-motion";
import axios from 'axios';
import Cookies from 'js-cookie';


export default function LoginPage({ className, ...props }) {
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password_hash: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store tokens and user data
      
      Cookies.set("user_type", data.user_type);
      Cookies.set("email", email);

      // Redirect based on user type
      if (data.user_type === "owner") {
        Cookies.set("access_token_owner", data.access);
        Cookies.set("owner_id", data.user_id);
        Cookies.set("owner_id_number", data.id);
        Router.push("/owner");
      } else if (data.user_type === "seeker") {
        Cookies.set("access_token_user", data.access);
        Cookies.set("user_id", data.user_id);
        Cookies.set("user_id_number", data.id);
        Router.push("/users");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError("");
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/password-reset/',
        { email: forgotPasswordEmail },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setForgotPasswordSuccess(true);
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setForgotPasswordError(error.response.data.error || "Invalid email format");
            break;
          case 404:
            setForgotPasswordError("If this email exists, we've sent a reset link");
            break;
          case 500:
            setForgotPasswordError("Server error. Please try again later");
            break;
          default:
            setForgotPasswordError("An error occurred");
        }
      } else if (error.request) {
        setForgotPasswordError("Network error. Please check your connection");
      } else {
        setForgotPasswordError("An unexpected error occurred");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordModal = () => {
    setForgotPasswordEmail("");
    setForgotPasswordError("");
    setForgotPasswordSuccess(false);
    setShowForgotPassword(false);
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <button 
                onClick={resetForgotPasswordModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {forgotPasswordSuccess ? (
              <div className="text-center py-4">
                <div className="mb-4 text-green-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <p className="mb-4 font-medium">Password reset email sent!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Check your inbox for instructions to reset your password.
                </p>
                <Button onClick={resetForgotPasswordModal} className="w-full">
                  Return to Login
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your email to receive a password reset link.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {forgotPasswordError && (
                      <p className="text-red-500 text-sm">{forgotPasswordError}</p>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={forgotPasswordLoading}
                    >
                      {forgotPasswordLoading ? (
                        <Spinner className="mr-2" />
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Login Form Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="h-10 w-10">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="h-full w-full"
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
          <div className="w-full max-w-xs">
            <form 
              className={cn("flex flex-col gap-6", className)} 
              onSubmit={handleLogin}
              {...props}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <button 
                      type="button"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                {errorMessage && (
                  <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Spinner className="mr-2" /> : "Login"}
                </Button>
              </div>
              
              <p className="text-center text-sm">
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-y-0 left-0 w-px bg-border"></div>
        <Image
          src="/tree-house.jpg"
          alt="Login Cover"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
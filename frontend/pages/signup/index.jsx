import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Signup = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] = useState("");
  const [passwordStrengthColor, setPasswordStrengthColor] = useState("text-gray-500");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [passwordMatchColor, setPasswordMatchColor] = useState("text-gray-500");
  const [currentUser, setCurrentUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [userRole, setUserRole] = useState("seeker"); // Default role is "seeker"

  const searchParams = useSearchParams();

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8 && password.length <= 30;
    const upperCaseValid = /[A-Z]/.test(password);
    const lowerCaseValid = /[a-z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialCharValid = /[!@#$%^&*()+\-_=<>?]/.test(password);

    if (lengthValid && upperCaseValid && lowerCaseValid && numberValid && specialCharValid) {
      setPasswordStrengthColor("text-green-500");
      setPasswordValidationMessage("Strong password.");
    } else {
      setPasswordStrengthColor("text-red-500");
      setPasswordValidationMessage("Password must be 8-30 characters long and include upper and lower case letters, a number, and a special character.");
    }
  };

  const validatePasswordMatch = (confirmPassword) => {
    if (confirmPassword === password) {
      setPasswordMatchColor("text-green-500");
      setPasswordMatchMessage("Passwords match.");
    } else {
      setPasswordMatchColor("text-red-500");
      setPasswordMatchMessage("Passwords do not match.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSigningUp(true);
    setErrorMessage("");

    // Remove spaces from phone number
  const formattedPhoneNumber = phoneNumber.replace(/\s+/g, "");

  const userData = {
    email,
    phone: formattedPhoneNumber,
    password_hash: password,
    name: `${firstName}${lastName}`,
    user_type: userRole,
  };

    console.log("Sending data:", userData);


    try {
      const response = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      

      const data = await response.json();

      if (response.ok) {
        router.push("/login"); // Redirect to login page after successful signup
      } else {
        setErrorMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <TooltipProvider>
      <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 xl:h-screen bg-white text-gray-900 ">
        {/* Dropdown for Role Selection */}
        <div className="absolute top-4 left-4 ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-[3px]">
                You are: {userRole === "seeker" ? "Seeker" : "Owner"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setUserRole("seeker")}>
                Seeker
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserRole("owner")}>
                Owner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Signup Form */}
        <div className="mx-auto max-w-sm my-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
          <p className="text-center text-muted-foreground mb-6">
            Enter your information to create an account
          </p>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    placeholder="Enter First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-[3px]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-[3px]"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-[3px]"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91XXXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
              <div className="grid gap-2 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center">
                    Password
                    <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                      <TooltipTrigger
                        asChild
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <CircleAlert className="ml-2 cursor-pointer text-gray-500 h-4" />
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="p-4 bg-white border rounded-[3px] shadow-lg">
                        <div className="text-xs text-[#464646]">
                          <p>Contain 8 to 30 characters</p>
                          <p>Contain both lower- and upper-case letters</p>
                          <p>Contain a number</p>
                          <p>Contain a special character, e.g.: -!@#$%^&*+</p>
                          <p>
                            Not contain a letter or number sequence, e.g.: ‘abc’,
                            ‘123’, ‘4444’, ‘qwerty
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  className="rounded-[3px]"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                />
                <p className={`mt-1 ${passwordStrengthColor} text-xs`}>{passwordValidationMessage}</p>
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="confirm-password">Re-enter Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="rounded-[3px]"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePasswordMatch(e.target.value);
                  }}
                  required
                />
                <p className={`mt-1 ${passwordMatchColor} text-xs`}>{passwordMatchMessage}</p>
              </div>
              {errorMessage && (
                <span className="text-red-600 font-bold">{errorMessage}</span>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ? "Signing Up..." : "Create an account"}
              </Button>
            </div>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2dac5c] hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Dynamic Image Based on Role */}
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-y-0 left-0 w-px bg-border"></div>
          <Image
            src={userRole === "seeker" ? "/tree-house.jpg" : "/forent.png"}
            alt={userRole === "seeker" ? "Seeker Image" : "Owner Image"}
            layout="fill"
            objectFit=""
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Signup; 
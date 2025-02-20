import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "../../firebaseConfig";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [userRole, setUserRole] = useState("seeker");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0); // Start with 0, no countdown initially
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpButtonText, setOtpButtonText] = useState("Get OTP");
  const [otpButtonColor, setOtpButtonColor] = useState("bg-blue-500");

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

    if (!otpVerified) {
      setErrorMessage("Please verify your email with OTP.");
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
      name: `${firstName} ${lastName}`,
      user_type: userRole,
    };

  const userData = {
    email,
    phone: formattedPhoneNumber,
    password_hash: password,
    name: `${firstName} ${lastName}`,
    user_type: userRole,
  };

    try {
      const response = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Call login API to get access token
        const loginResponse = await fetch("http://localhost:8000/api/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password_hash: password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {

          localStorage.setItem("user_type", loginData.user_type);
          localStorage.setItem("access_token", loginData.access);
          localStorage.setItem("email", email);

          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);

          // Redirect based on user type
          if (loginData.user_type === "owner") {
            router.push("/addapp");
          } else {
            router.push("/login");
          }
        } else {
          setErrorMessage(loginData.message || "Login failed. Please try again.");
        }

        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password);
        
        router.push("/dashboard"); // Redirect to dashboard or any other page

      } else {
        setErrorMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleGetOtp = async () => {
    const userData = {
      email,
    };

    try {
      const response = await fetch("http://localhost:8000/api/send_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setIsOtpDialogOpen(true);
        setCountdown(45); // Start the countdown
      } else {
        setErrorMessage(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    // Check if all OTP slots are filled
    if (otp.length !== 6) {
      setOtpError("Please fill all OTP fields.");
      return;
    }

    const userData = {
      email,
      otp,
    };

    try {
      const response = await fetch("http://localhost:8000/api/verify_otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setIsOtpDialogOpen(false);
        setOtpError("");
        setOtpButtonText("Verified");
        setOtpButtonColor("bg-green-500");
      } else {
        setOtpError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("An error occurred. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setCountdown(300); // Reset the countdown
    await handleGetOtp(); // Resend OTP
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
      <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 xl:h-screen bg-white text-gray-900">
        {/* Dropdown for Role Selection */}
        <div className="absolute top-4 left-4">
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
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-[3px]"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleGetOtp}
                    className={`rounded-[3px] ${otpButtonColor}`}
                    disabled={otpVerified}
                  >
                    {otpButtonText}
                  </Button>
                </div>
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
                disabled={isSigningUp || !otpVerified}
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

      {/* OTP Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600">OTP sent to: {email}</p>
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {otpError && <span className="text-red-600 text-sm">{otpError}</span>}
            <div className="flex justify-between w-full">
              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                variant="outline"
              >
                Resend OTP {countdown > 0 ? `(${countdown}s)` : ""}
              </Button>
              <Button type="button" onClick={handleVerifyOtp}>
                Verify OTP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Signup;

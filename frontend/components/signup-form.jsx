import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function AdminSignupComponent({ props: props }) {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phoneNumber,
    setPhoneNumber,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showTooltip,
    setShowTooltip,
    isSigningUp,
    passwordStrengthColor,
    passwordMatchMessage,
    passwordMatchColor,
    errorMessage,
    validatePassword,
    validatePasswordMatch,
    handleSignup,
    passwordValidationMessage,
    validatePhoneNumber,
    phoneNumberMessage,
    phoneNumberMatchColor
  } = props;

  const handleMouseEnter = () => {
    setShowTooltip(true);
  }

  const handleMouseLeave = () => {
    setShowTooltip(false);
  }

  return (
    <TooltipProvider>
      <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 xl:h-screen bg-white text-gray-900 ">

        {/* Signup Form */}
        <div className="mx-auto max-w-sm my-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Sign Up</h1>
          <p className="text-center text-muted-foreground mb-6">
            Enter your information to create an admin account
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
                <Input id="phone" type="tel" placeholder="Phone Number" value={phoneNumber} 
                onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    validatePhoneNumber(e.target.value);
                }} required />
                <p className={`mt-1 ${phoneNumberMatchColor} text-xs`}>{phoneNumberMessage}</p>
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

        {/* Signup Cover Image */}
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-y-0 left-0 w-px bg-border"></div>
          <Image
            src="/tree-house.jpg"
            fill
            alt="Signup-decorative-image"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

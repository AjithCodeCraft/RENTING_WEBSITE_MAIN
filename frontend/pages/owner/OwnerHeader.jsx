import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellRing, MessageSquareText, User, Settings, HelpCircle, Globe, LogOut } from 'lucide-react'; // Import icons from lucide-react
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { abortController } from ".";
import Image from "next/image";
import axios from "axios";
import Cookies from 'js-cookie';

export default function OwnerHeader() {
  const [user, setUser] = useState({ name: "", avatarUrl: "", upi_id: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const router = useRouter();

  const logout = (e) => {
    e.preventDefault();
    abortController.abort();
    Cookies.remove("access_token_owner");
    router.push("/login");
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("access_token_owner")}`,
            },
          },
        );
        setUser({
          name: response.data.name,
          avatarUrl: response.data.avatarUrl || "https://github.com/shadcn.png",
          upi_id: response.data.upi_id || "",
          email: response.data.email || ""
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const checkVerification = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/check-owner-verification/",
        { email: Cookies.get("email") },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token_owner")}`,
          },
        },
      );
      setIsVerified(response.data.verified);
      return response.data.verified;
    } catch (err) {
      console.error("Error checking verification:", err);
      setIsVerified(false);
      return false;
    }
  };

  const handleNavigation = async (href) => {
    const isVerified = await checkVerification();
    if (isVerified) {
      router.push(href);
    } else {
      setShowVerificationModal(true);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      {/* Mobile Navigation Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white">
          <Link href="#" prefetch={false}>
            <div className="h-100 w-10">
              <Image
                src="/g88.png"
                alt="Logo"
                width={50}
                height={50}
                className="h-15 w-15"
              />
            </div>
            <span className="sr-only">ShadCN</span>
          </Link>
          <div className="grid gap-2 py-9">
            <button onClick={() => handleNavigation("/owner")} className="flex w-full items-center py-2 text-lg font-semibold">
              Home
            </button>
            <button onClick={() => handleNavigation("/owner/hostels")} className="flex w-full items-center py-2 text-lg font-semibold">
              Hostels
            </button>
            <button onClick={() => handleNavigation("/owner/bookings")} className="flex w-full items-center py-2 text-lg font-semibold">
              Bookings
            </button>
            <button onClick={() => handleNavigation("/owner/pocket")} className="flex w-full items-center py-2 text-lg font-semibold">
              Pocket
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation Menu */}
      <Link href="#" className="mr-6 hidden lg:flex" prefetch={false}>
        <div className="h-100 w-10">
          <Image
            src="/g88.png"
            alt="Logo"
            width={50}
            height={50}
            className="h-15 w-15"
          />
        </div>
        <span className="sr-only">ShadCN</span>
      </Link>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <button
              onClick={() => handleNavigation("/owner")}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            >
              Home
            </button>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <button
              onClick={() => handleNavigation("/owner/hostels")}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            >
              Hostels
            </button>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <button
              onClick={() => handleNavigation("/owner/bookings")}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            >
              Bookings
            </button>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <button
              onClick={() => handleNavigation("/owner/pocket")}
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
            >
              Pocket
            </button>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side Icons and Avatar */}
      <div className="ml-auto flex gap-2">
        <div className="flex items-center gap-8">
          <button onClick={() => handleNavigation("/owner/messages")}>
            <MessageSquareText className="h-8 w-8" />
          </button>

          {/* Avatar Popup */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 px-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">View Profile</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Link href="/owner/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <User className="h-5 w-5" />
                    <span>View Profile</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <Settings className="h-5 w-5" />
                    <span>Settings & Privacy</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </Link>
                  <Link href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <Globe className="h-5 w-5" />
                    <span>Language</span>
                  </Link>
                  <Separator />
                  <Link href="#" onClick={logout} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg">
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Verification Modal */}
      <Sheet open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <SheetContent side="right" className="w-[300px] bg-white">
          <SheetHeader>
            <SheetTitle>Verification Required</SheetTitle>
            <SheetDescription>
              You need to verify your account to access this feature.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}

// Icon Components
function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function ShirtIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

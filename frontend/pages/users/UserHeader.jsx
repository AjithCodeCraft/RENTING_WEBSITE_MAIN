import { useState, useEffect } from "react";
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
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BellRing,
  MessageSquareText,
  User,
  Settings,
  HelpCircle,
  Globe,
  LogOut,
  Heart, // Add this import
} from "lucide-react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";

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

export default function UserHeader() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0); // Add wishlist count state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token_user")}`,
            },
          },
        );
        setUser({
          name: profileResponse.data.name,
          avatarUrl: profileResponse.data.avatarUrl || "https://github.com/shadcn.png",
        });

        // Fetch wishlist count
        const accessToken = localStorage.getItem("access_token_user");
        if (accessToken) {
          const wishlistResponse = await axios.get(
            "http://localhost:8000/api/wishlist/get-item",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const items = wishlistResponse.data || [];
          setWishlistCount(items.length); 
          
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("access_token_user");
    router.push("/login");
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
          <Link
            href="/"
            className="flex items-center space-x-2"
            prefetch={false}
          >
            <Image src="/logo.png" alt="Hostelio Logo" width={50} height={50} />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Hostelio
            </motion.span>
          </Link>
          <div className="grid gap-2 py-9">
            <Link
              href="/users"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              href="/users/hostels"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Hostels
            </Link>
            <Link
              href="users/bookedhostels"
              className="flex w-full items-center py-2 text-lg font-semibold"
              prefetch={false}
            >
              Booked Hostel
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation Menu */}
      <Link
        href="/"
        className="mr-6 hidden lg:flex items-center space-x-2"
        prefetch={false}
      >
        <Image src="/logo.png" alt="Hostelio Logo" width={50} height={50} />
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Hostelio
        </motion.span>
      </Link>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <Link
              href="/users"
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
              prefetch={false}
            >
              Home
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              href="/users/hostels"
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
              prefetch={false}
            >
              Hostels
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              href="/users/bookedhostels"
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
              prefetch={false}
            >
              Booked hostel
            </Link>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side Icons and Avatar */}
      <div className="ml-auto flex gap-2">
        <div className="flex items-center gap-8">
          <Link href="/users/messages">
            <MessageSquareText className="h-8 w-8" />
          </Link>
          <div className="relative">
            <Link href="/users/wishlist">
              <Heart className="h-8 w-8" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
          </div>

          {/* Avatar Popup */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 px-4">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Link
                    href="/users/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <User className="h-5 w-5" />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings & Privacy</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Globe className="h-5 w-5" />
                    <span>Language</span>
                  </Link>
                  <Separator />
                  <Link
                    href="#"
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

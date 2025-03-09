"use client"; // Ensures animations work in Next.js

import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { motion } from "framer-motion"; // Import Framer Motion for animations

export default function Header() {
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          {/* Animated Logo + Hostelio Text */}
          <Link href="/" prefetch={false} className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Hostelio Logo" width={40} height={40} />
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-lg font-semibold"
            >
              Hostelio
            </motion.span>
          </Link>

          {/* Mobile Nav Links */}
          <div className="grid gap-2 py-9">
            {["Home", "About", "Services", "Portfolio", "Contact"].map((item) => (
              <Link key={item} href="#" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                {item}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Animated Logo + "Hostelio" Text for Desktop */}
      <Link href="/" className="mr-6 hidden lg:flex items-center space-x-2" prefetch={false}>
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

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          {["Home", "About", "Services", "Portfolio", "Contact"].map((item) => (
            <NavigationMenuLink asChild key={item}>
              <Link
                href="#"
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50"
                prefetch={false}
              >
                {item}
              </Link>
            </NavigationMenuLink>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Sign In / Sign Up Buttons */}
      <div className="ml-auto flex gap-2">
        <Link href="/login" prefetch={false}>
          <Button variant="outline">Sign in</Button>
        
        
        </Link>
        <Link href="/signup" prefetch={false}>
        <Button>Sign Up</Button>
        </Link>
      </div>
    </header>
  );
}

// Menu Icon Component
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

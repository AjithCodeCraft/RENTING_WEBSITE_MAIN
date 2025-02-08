import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image";

export default function LoginPage({ className, ...props }) {
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
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div> */}
        
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

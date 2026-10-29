"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Calculator,
  BookOpen,
  Sprout,
  Calendar,
  HelpCircle,
  Info,
  Phone,
  ClipboardCheck,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { CartButton } from "@/components/academy/course-cart-drawer";
import { cn } from "@/lib/utils";

const coaches = [
  {
    title: "Math - Coach Maya",
    href: "/academy",
    description: "Step-by-step problem solving, one question at a time",
    icon: Calculator,
  },
  {
    title: "Reading - Story Explorer",
    href: "/academy",
    description: "Turns every story into a fun detective adventure",
    icon: BookOpen,
  },
  {
    title: "Life Skills - Growth & Glow",
    href: "/academy",
    description: "Monthly real-world quests that build independence",
    icon: Sprout,
  },
  {
    title: "Kid-Safe by Design",
    href: "/about",
    description: "Parents approve access and see every step",
    icon: ShieldCheck,
  },
];

const resources = [
  { title: "Courses", href: "/academy", icon: BookOpen },
  { title: "Events & Community", href: "/events", icon: Calendar },
  { title: "Success Stories", href: "/success-stories", icon: ClipboardCheck },
  { title: "FAQ", href: "/faq", icon: HelpCircle },
];

export function CurioQuestNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/curioquest-logo.svg"
            alt="CurioQuest"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
          <span className="hidden sm:block text-lg font-bold tracking-tight">
            Curio<span className="text-amber-500">Quest</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Our Coaches</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                  {coaches.map((coach) => (
                    <Link
                      key={coach.title}
                      href={coach.href}
                      className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <coach.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{coach.title}</div>
                        <p className="text-sm text-muted-foreground">
                          {coach.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-2 p-4">
                  {resources.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                      >
                        <item.icon className="h-5 w-5 text-amber-600" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
              )}>
                <Link href="/contact">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <CartButton />
          <Link 
            href="/sign-in" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Register
          </Link>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="outline" asChild>
            <Link href="/academy">Explore Courses</Link>
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Our Coaches</h3>
                {coaches.map((coach) => (
                  <Link
                    key={coach.title}
                    href={coach.href}
                    className="flex items-center gap-3 py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <coach.icon className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">{coach.title}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/about"
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Info className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">About CurioQuest</span>
                </Link>
                {resources.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-3 py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-amber-600" />
                    <span>{item.title}</span>
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Contact</span>
                </Link>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/sign-in"
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserPlus className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">Register</span>
                </Link>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/academy" onClick={() => setMobileOpen(false)}>
                    Explore Courses
                  </Link>
                </Button>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900" asChild>
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, UserRound, Search } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Sohraa.png"
              alt="Sohraa logo"
              width={48}
              height={48}
              className="rounded"
            />
            <span className="font-semibold tracking-tight">Sohraa</span>
          </Link>
        </div>

        <nav
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-16 border-b bg-background md:static md:flex md:border-0`}
          aria-label="Main navigation"
        >
          <ul className="flex w-full flex-col items-start gap-2 p-4 md:w-auto md:flex-row md:items-center md:gap-6 md:p-0">
            <li>
              <Link className="text-sm hover:text-primary" href="#highlights">
                Features
              </Link>
            </li>
            <li>
              <Link className="text-sm hover:text-primary" href="#modules">
                Modules
              </Link>
            </li>
            <li>
              <Link className="text-sm hover:text-primary" href="#pricing">
                Pricing
              </Link>
            </li>
            <li>
              <Link className="text-sm hover:text-primary" href="#resources">
                Resources
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex transition-transform hover:scale-105 active:scale-95"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="hidden md:inline-flex btn-fun bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 transition-transform hover:scale-105 active:scale-95"
              >
                <UserRound className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className="md:hidden transition-transform hover:scale-105 active:scale-95"
              >
                <UserRound className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

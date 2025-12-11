"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Spline from "@splinetool/react-spline/next";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary min-h-screen animate-in fade-in duration-700">
      {/* 3D Spline Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Spline
          scene="https://prod.spline.design/iW4KuDCbnqTWLCRb/scene.splinecode"
          style={{
            width: "120%",
            height: "130%",
            background: "transparent",
            position: "absolute",
            top: "-20%",
            left: "0%",
            zIndex: 0,
            opacity: 0.8,
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 ">
        <div className="max-w-2xl text-left mx-20 my-20">
          <h1 className="text-pretty text-4xl font-semibold leading-tight md:text-5xl bg-gradient-to-r from-cyan-700 via-slate-600 to-cyan-900 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700 delay-200">
            Smart Hotel Management System with QR-Powered Guest Experience ✨
          </h1>
          <br />
          <p className="mt-4 max-w-prose text-muted-foreground leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-300 text-center">
            Complete property management dashboard with real-time room tracking,
            QR-based guest services, AI-powered food ordering, and seamless
            check-in workflows. Empower your staff and delight your guests.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button
              asChild
              className="px-6 shadow-lg btn-fun bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 transition-transform hover:scale-105 hover:-translate-y-0.5 active:scale-98"
            >
              <Link href="/login">Access Dashboard</Link>
            </Button>
            <Link href="/register">
              <Button
                variant="outline"
                className="btn-fun border-2 hover:bg-primary/5 transition-transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-3 text-muted-foreground animate-in fade-in duration-700 delay-700">
            <span className="text-sm">Follow us</span>
            <a
              aria-label="Facebook"
              href="#"
              className="rounded p-2 hover:bg-accent transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              aria-label="Instagram"
              href="#"
              className="rounded p-2 hover:bg-accent transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              aria-label="Twitter"
              href="#"
              className="rounded p-2 hover:bg-accent transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

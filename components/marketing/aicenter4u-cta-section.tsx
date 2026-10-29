"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";

export function AICenter4UCTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
      
      {/* Accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10" />

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
            Every Kid Can Learn.{" "}
            <span className="text-amber-400">Let&apos;s Prove It Together.</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Give your child a coach that asks, encourages, and never gives up on them.
            The first lesson is waiting.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold" 
              asChild
            >
              <Link href="/academy">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Learning Today
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 border-amber-400 text-amber-400 hover:bg-amber-400/20 hover:text-amber-300" 
              asChild
            >
              <Link href="/contact">
                <Mail className="mr-2 h-5 w-5" />
                Questions? Talk to Us
              </Link>
            </Button>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Kid-Safe by Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Parents Always in Control</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Hints, Not Just Answers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

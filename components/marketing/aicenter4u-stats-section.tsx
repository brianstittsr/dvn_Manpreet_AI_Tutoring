"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    value: 3,
    suffix: "",
    label: "AI Coaches",
    description: "Math, reading, and life skills",
  },
  {
    value: 6,
    suffix: "",
    label: "Learning Steps",
    description: "A clear path in every lesson",
  },
  {
    value: 1,
    suffix: "",
    label: "Question at a Time",
    description: "No overwhelm, just steady progress",
  },
  {
    value: 100,
    suffix: "%",
    label: "Parent Visibility",
    description: "See every step your child takes",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setDisplayValue(value);
              clearInterval(timer);
            } else {
              setDisplayValue(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-amber-500">
      {displayValue}{suffix}
    </span>
  );
}

export function AICenter4UStatsSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-400">
            Built for Real Learning
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The AICenter4U Difference
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            We measure what matters: does your child truly understand - and can they do it on their own?
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <div className="mt-2 text-lg font-semibold">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

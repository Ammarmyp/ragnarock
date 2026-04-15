"use client";

/**
 * Auth Layout
 * Split layout with animated mesh gradient on the left and form content on the right
 */

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { useIsDark } from "@/hooks/use-is-dark";

// Dynamic import for MeshGradient (client-side only)
const MeshGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => ({ default: mod.MeshGradient })),
  { ssr: false }
);

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * AuthLayout Component
 * Provides split-screen design with gradient background
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isDark = useIsDark();

  // Gradient colors based on theme
  const gradientColors: [string, string, string, string] = isDark
    ? ["#C4B5DE", "#9B85C8", "#B09ED4", "#D6CAEB"]
    : ["#FFCBA4", "#FFA07A", "#FFB6C1", "#FFE4E1"];

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Mesh Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0">
          <MeshGradient
            speed={1.2}
            colors={gradientColors}
            distortion={0.7}
            swirl={1.5}
            grainMixer={0}
            grainOverlay={0}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Logo/Brand */}
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Ragnarock</span>
            </Link>

            {/* Main Text */}
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {title || "Modern Requirements Management"}
            </h1>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              {subtitle || "Streamline your project requirements with powerful collaboration tools and intelligent workflows."}
            </p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="mt-12 space-y-4"
            >
              {[
                "Team collaboration in real-time",
                "Role-based access control",
                "Powerful analytics & reporting",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-5 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </div>
                  <span className="text-white/90 text-sm">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
              </div>
              <span className="text-xl font-bold">Ragnarock</span>
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}

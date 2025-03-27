"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 flex justify-between items-center px-6 sm:px-12 lg:px-32 py-4 bg-primary text-white shadow-md z-50">
      <Link href="/" className="text-2xl font-bold">
        FarmChop
      </Link>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden text-white border-white flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="size-5 text-white" />
        ) : (
          <Menu className="size-5 text-white" />
        )}
      </Button>

      {/* Animated Mobile Menu */}
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ ease: "easeOut", duration: 0.3 }}
          className="fixed inset-x-0 top-16 bg-primary flex flex-col items-center space-y-4 p-6 shadow-lg sm:hidden"
        >
          <Link href="/auth">
            <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
              Get Started
            </Button>
          </Link>
        </motion.nav>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex space-x-4">
        <Link href="/auth">
          <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
            Get Started
          </Button>
        </Link>
      </nav>
    </header>
  );
}

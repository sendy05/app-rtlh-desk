"use client";

import { Menu, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Header({
  user,
  onMenuClick,
  onLogout,
}: {
  user: { name: string; email?: string; role?: string } | null;
  onMenuClick: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-gray-700"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
        </h1>
      </div>

      {/* 👇 Dropdown User Info */}
      <div className="relative">
        <button
          className="flex items-center gap-3 focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          <span className="text-gray-700 text-sm hidden sm:block">
            {user?.name}
          </span>
          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </button>

       
      </div>
    </header>
  );
}

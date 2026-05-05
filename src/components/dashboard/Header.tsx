"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Header({ user }: Props) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-white font-semibold text-lg">Dashboard</h1>

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            {user.image ? (
              <img
                src={user.image}
                className="w-full h-full rounded-full object-cover"
                alt=""
              />
            ) : (
              <User className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <span className="text-slate-300 text-sm">
            {user.name ?? user.email}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition text-sm px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}

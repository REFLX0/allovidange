"use client";

import { ArrowSquareOut, SignOut } from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { AdminMobileNav } from "./AdminSidebar";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-start">
        <AdminMobileNav />
        <p className="admin-greeting">Bonjour, <strong>{user.name ?? "Admin"}</strong></p>
      </div>

      <div className="admin-topbar-actions">
        <Link href="/" target="_blank" className="admin-topbar-link" aria-label="Ouvrir le site public">
          <ArrowSquareOut size={16} weight="bold" aria-hidden="true" />
          <span>Site public</span>
        </Link>
        <button
          type="button"
          className="admin-topbar-signout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Se déconnecter"
        >
          <SignOut size={16} weight="bold" aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

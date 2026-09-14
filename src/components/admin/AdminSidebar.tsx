"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  CalendarDots,
  Car,
  GearSix,
  List,
  SquaresFour,
  UsersThree,
  Wrench,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", Icon: SquaresFour, exact: true },
  { href: "/admin/rendez-vous", label: "Rendez-vous", Icon: CalendarDots },
  { href: "/admin/calendrier", label: "Calendrier", Icon: CalendarDots },
  { href: "/admin/clients", label: "Clients", Icon: UsersThree },
  { href: "/admin/vehicules", label: "Véhicules", Icon: Car },
  { href: "/admin/services", label: "Services", Icon: Wrench },
  { href: "/admin/parametres", label: "Paramètres", Icon: GearSix },
];

function Brand() {
  return (
    <div className="admin-sidebar-header">
      <Image src="/logo.png" alt="ALLO VIDANGE" width={38} height={38} priority />
      <div>
        <div className="admin-sidebar-brand">ALLO VIDANGE</div>
        <div className="admin-mode-label">Administration atelier</div>
      </div>
    </div>
  );
}

function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="admin-nav" aria-label="Navigation principale">
      {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`admin-nav-link ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={close}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <div className="admin-sidebar-footer">
      <span>ALLO VIDANGE © {new Date().getFullYear()}</span>
    </div>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Brand />
      <Navigation />
      <Footer />
    </aside>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="icon-button admin-mobile-nav" aria-label="Ouvrir la navigation">
          <List size={22} weight="bold" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-menu-overlay" />
        <Dialog.Content className="admin-mobile-menu">
          <div className="admin-mobile-menu-head">
            <Dialog.Title className="sr-only">Navigation de l&apos;administration</Dialog.Title>
            <Brand />
            <Dialog.Close asChild>
              <button type="button" className="icon-button" aria-label="Fermer la navigation">
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <Navigation close={() => setOpen(false)} />
          <Footer />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDots, List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Le rendez-vous" },
  { href: "#contact", label: "Contact" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const close = () => setOpen(false);
  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, transform: "translateY(-12px)" },
        animate: { opacity: 1, transform: "translateY(0)" },
        exit: { opacity: 0, transform: "translateY(-8px)" },
      };

  return (
    <header className="public-nav" id="top">
      <div className="public-nav-inner">
        <Link href="/" className="brand-lockup" aria-label="ALLO VIDANGE, accueil">
          <Image src="/logo.png" alt="" width={44} height={44} priority />
          <span>
            <strong>ALLO VIDANGE</strong>
            <small>Entretien automobile</small>
          </span>
        </Link>

        <nav className="public-nav-links" aria-label="Navigation principale">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="public-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <Link href="/reservation" className="public-nav-cta">
          <CalendarDots size={18} weight="bold" aria-hidden="true" />
          <span>Prendre rendez-vous</span>
        </Link>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="public-menu-trigger" type="button" aria-label="Ouvrir le menu">
              <List size={24} weight="bold" aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <AnimatePresence>
            {open && (
              <Dialog.Portal forceMount>
                <Dialog.Overlay asChild>
                  <motion.div
                    className="mobile-menu-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.16 }}
                  />
                </Dialog.Overlay>
                <Dialog.Content asChild>
                  <motion.div
                    className="mobile-menu-panel"
                    {...panelMotion}
                    transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="mobile-menu-head">
                      <Dialog.Title>Navigation</Dialog.Title>
                      <Dialog.Close asChild>
                        <button type="button" className="icon-button" aria-label="Fermer le menu">
                          <X size={22} weight="bold" aria-hidden="true" />
                        </button>
                      </Dialog.Close>
                    </div>
                    <nav className="mobile-menu-links" aria-label="Navigation mobile">
                      {links.map((link) => (
                        <a key={link.href} href={link.href} onClick={close}>
                          {link.label}
                        </a>
                      ))}
                    </nav>
                    <Link href="/reservation" className="btn btn-primary btn-full" onClick={close}>
                      <CalendarDots size={19} weight="bold" aria-hidden="true" />
                      Réserver un créneau
                    </Link>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      </div>
    </header>
  );
}

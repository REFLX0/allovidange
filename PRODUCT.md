# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Drivers in Tunisia who need to book routine vehicle maintenance from a phone or desktop browser.
- ALLO VIDANGE workshop administrators who schedule work, maintain customer and vehicle records, and update operating settings.

## Product Purpose

ALLO VIDANGE lets a single automotive workshop accept and manage appointments for oil changes, filter replacement, diagnostics, and scheduled maintenance. It replaces ad-hoc phone and WhatsApp coordination with a clear online booking flow and a practical operations workspace.

## Positioning

The product is a branded, single-workshop experience built around vehicle-specific appointments, French-language service details, Tunisian phone numbers, and direct WhatsApp follow-up. It is not a multi-tenant marketplace or multi-garage product.

## Operating Context

Customers choose a service, provide contact and vehicle details, select an available slot, and receive a booking reference. Administrators review calendar activity, update appointment status, manage customers, vehicles and services, and maintain hours, closures, and contact details.

## Capabilities and Constraints

- Public multi-step booking, availability calculation, and booking confirmation.
- Admin authentication, appointment lifecycle management, customer and vehicle records, services, business hours, blocked periods, and business settings.
- French is the current customer-facing language. Tunisian phone formatting and WhatsApp contact links are supported.
- Next.js, TypeScript, Prisma, PostgreSQL, and Docker are the existing technical foundation.
- Preserve existing routes, booking field order, brand logo, and business functionality unless a change is necessary for responsive usability or accessibility.
- The redesign must avoid glassmorphism, minimize nonessential client JavaScript, respect reduced-motion preferences, and target strong Core Web Vitals. A universal performance score of 100 cannot be guaranteed because it depends on deployment, data, network, and testing conditions.

## Brand Commitments

- Brand name: ALLO VIDANGE.
- Existing logo and workshop photography are available in `public/`.
- The established visual identity is automotive, direct, and professional, using red and dark neutral tones.

## Evidence on Hand

- Public and admin routes in `src/app/`.
- Booking experience in `src/components/BookingWizard.tsx`.
- Existing logo and hero assets in `public/logo.png` and `public/hero-bg.png`.
- Domain models in `prisma/schema.prisma`.
- No verified customer testimonials, performance claims, pricing policy, or external proof assets are available. Do not fabricate them.

## Product Principles

1. Make booking a maintenance visit quick and understandable on a small screen.
2. Help administrators recognize the next operational action at a glance.
3. Keep vehicle and appointment context connected so the workshop can prepare accurately.
4. Build confidence with plain language, transparent service details, and dependable status feedback.
5. Prefer a fast, accessible interface over visual effects that slow the product down.

## Accessibility & Inclusion

- Responsive use on mobile and desktop is required.
- Meet WCAG AA contrast and keyboard-access requirements.
- Support reduced-motion preferences and avoid hover-only interactions.

# ALLO VIDANGE design system

## Product modes

- **Persuade:** a reassuring booking journey for people who need their vehicle serviced without calling back and forth.
- **Operate:** a fast, scan-friendly administration surface for one workshop team.

## Direction: service ledger

The visual language borrows from a well-kept workshop job card: warm graphite surfaces, measured rules, compact information blocks, precise labels, and a single signal-red action color. It is practical rather than glossy. There is no glassmorphism, ambient blur, decorative gradient, fake metric, or generic dashboard bento.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#101112` |
| Surface | `#18191b` |
| Raised surface | `#202225` |
| Signal action | `#e43636` |
| Warning / duration | `#efb13d` |
| Primary text | `#f5f3ef` |
| Secondary text | `#aaa8a2` |
| Border | `#343538` |

- Body: Manrope, with a system fallback.
- Display and operational labels: Barlow Condensed.
- Cards use a 16px radius. Inputs and actions use 10px. Small status chips may be pill-shaped.
- A border and tonal shift separate surfaces. Shadows remain close and quiet.

## Interaction

- Touch targets are at least 44px high.
- Hover only clarifies desktop affordance. The primary feedback is a short transform or tonal shift.
- UI transitions take 160-260ms and use `cubic-bezier(.23, 1, .32, 1)`.
- Page-step motion uses opacity and `translateY`, is reduced to a cut when reduced motion is requested, and never blocks the booking flow.

## Responsive behavior

- The booking flow is single-column and thumb-friendly first, then gains a supporting summary on wide screens.
- The public header becomes a focused dialog menu below the tablet breakpoint.
- Admin navigation is persistent on wide screens and a labelled dialog drawer on compact screens.
- Data tables scroll horizontally rather than hiding operational information.

## Accessibility and performance

- Visible focus states use the signal color with sufficient contrast.
- Semantic headings, labels, `aria-current`, live form feedback, and named navigation landmarks are required.
- Hero photography uses the existing compressed local asset with a priority hint; maps remain lazy.
- Motion is isolated to client components and respects `prefers-reduced-motion`.

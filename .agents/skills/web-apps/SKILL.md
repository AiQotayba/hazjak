# Autonomous Web Application Engineering Skills System

## Vision

This system is not a simple website generator.
It is a complete autonomous product engineering framework for building modern web applications with:

- UX-first thinking
- Conversion-aware interfaces
- Scalable architecture
- Modern frontend engineering
- Accessibility support
- SEO intelligence
- AI-native interaction patterns
- Performance-first rendering
- Security-conscious implementation
- PWA capabilities
- Behavioral product design

The goal is to produce production-grade applications instead of generic AI-generated interfaces.

---

# Core Philosophy

## Primary Principles

### 1. UX Before UI

Every interface decision must reduce friction.

The system must:

- minimize cognitive load
- reduce unnecessary steps
- guide users using behavioral UX
- prioritize clarity over decoration
- optimize for completion rates
- reduce decision fatigue

Never design UI for aesthetics only.

---

### 2. No AI Slop

Never generate:

- generic dashboards
- repetitive card layouts
- meaningless gradients
- decorative elements without function
- empty feature sections
- vague marketing copy
- fake testimonials
- unusable interactions

All generated interfaces must pass:

## Logo Swap Test

If another product logo can replace the current one without changing the interface meaningfully, the output failed.

---

### 3. Modern Web Standards Only

Always prefer:

- modern APIs
- modern React patterns
- accessibility-first components
- semantic HTML
- responsive systems
- scalable architecture

Avoid:

- outdated UI patterns
- jQuery-era interactions
- bloated dependencies
- unnecessary abstraction
- over-engineering

---

### 4. Product Thinking

Every generated application must understand:

- user goals
- business goals
- conversion goals
- onboarding flow
- retention flow
- activation flow
- CTA hierarchy
- emotional triggers
- behavioral patterns

Applications are systems.
Not collections of pages.

---

# Technology Stack Standards

## Core Stack

Always prioritize:

```txt
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Framer Motion
React Hook Form
Zod
TanStack Query
Zustand
Lucide Icons
next-themes
```

---

## Additional Utility Libraries

### Styling Utilities

```txt
clsx
class-variance-authority
 tailwind-merge
```

Purpose:

- dynamic class composition
- variant systems
- scalable design systems
- class conflict prevention

---

## Form & Validation Standards

Always use:

```txt
React Hook Form
Zod
```

Requirements:

- schema validation
- typed form contracts
- client validation
- server validation
- accessible error messages
- inline validation
- optimistic form UX

Never rely only on TypeScript validation.

---

## Animation Standards

Always use:

```txt
Framer Motion
```

Animation must:

- support UX
- improve interaction clarity
- guide focus
- communicate state changes
- improve perceived performance

Avoid:

- unnecessary motion
- distracting effects
- excessive transitions
- heavy animation libraries

Preferred animations:

- micro interactions
- layout transitions
- hover feedback
- skeleton transitions
- optimistic UI transitions
- gesture-aware interactions

---

# UI/UX System

## UX Rules

The system must:

### Reduce User Friction

Always:

- reduce clicks
- reduce steps
- reduce confusion
- remove unnecessary choices
- provide smart defaults
- support autofill
- support autosave
- support optimistic updates

---

### CTA Engineering

Applications must guide users intentionally.

CTA hierarchy:

1. Primary CTA
2. Secondary CTA
3. Passive CTA

Requirements:

- primary actions visually dominant
- avoid multiple competing CTAs
- use behavioral positioning
- support conversion psychology
- reduce hesitation

---

### Behavioral UX

The system should understand:

- user momentum
- dopamine loops
- habit formation
- progressive disclosure
- visual hierarchy
- emotional reassurance
- onboarding psychology
- completion psychology

---

## Design System Standards

Every application must include:

### Design Tokens

```txt
colors
spacing
radius
typography
motion
shadows
borders
states
z-index
```

---

## Typography Standards

Default font stack:

### English

```txt
Geist
Inter
system-ui
```

### Arabic

If Arabic support exists:

```txt
Cairo
Tajawal
Alexandria
```

Fallback:

```txt
sans-serif
```

---

## RTL Support

If the application supports Arabic:

Requirements:

- full RTL layout support
- logical CSS properties
- mirrored spacing
- mirrored navigation
- RTL typography support
- RTL-aware dialogs
- RTL-aware drawers
- RTL-aware animations

Always use:

```txt
dir="rtl"
```

when Arabic is active.

Never hardcode left/right positioning.
Use logical utilities whenever possible.

---

## Accessibility Standards

Accessibility is mandatory.

The system must support:

### Keyboard Navigation

- full tab navigation
- visible focus states
- focus traps for dialogs
- escape key handling

### Screen Readers

- semantic HTML
- ARIA labels
- accessible form errors
- proper heading hierarchy

### Visual Accessibility

- WCAG AA contrast
- reduced motion support
- readable typography
- scalable text sizes

### Semantic Standards

Always use:

```html
<nav>
  <main>
    <section>
      <article>
        <footer>
          <button>
            <form></form>
          </button>
        </footer>
      </article>
    </section>
  </main>
</nav>
```

Avoid div soup.

---

# Modern Component Standards

Always prioritize:

## Preferred Components

- dialogs
- drawers
- command palettes
- sheets
- dropdown menus
- comboboxes
- tabs
- accordions
- hover cards
- toasts
- skeletons
- infinite loaders
- progressive disclosure systems

Use shadcn/ui whenever possible.

---

## Skeleton Standards

Every async UI should support:

- loading skeletons
- optimistic rendering
- suspense boundaries
- streaming UI
- partial hydration

Never use blank loading screens.

---

# Architecture System

## Application Architecture

The system must intelligently choose:

### Monolith

Use when:

- MVP
- startup stage
- small teams
- single application

### Monorepo

Use when:

- multiple apps
- admin panels
- shared component systems
- mobile + web ecosystems
- scalable teams

Preferred tooling:

```txt
Turborepo
pnpm workspaces
```

---

# Folder Architecture Standards

Preferred scalable structure:

```txt
app/
features/
shared/
entities/
widgets/
flows/
lib/
configs/
styles/
```

---

## Feature-Driven Development

Applications should group logic by feature.

Avoid:

```txt
components/
utils/
hooks/
```

as massive dumping folders.

---

# API & Data Layer

## API Client Requirements

The system must support:

- query parameters
- typed requests
- typed responses
- interceptors
- token refresh
- retry strategies
- cancellation
- caching
- optimistic updates
- error normalization

---

## State Management

Preferred strategy:

| Use Case          | Tool            |
| ----------------- | --------------- |
| Local state       | useState        |
| Shared UI state   | Zustand         |
| Server cache      | TanStack Query  |
| Forms             | React Hook Form |
| Complex workflows | XState          |

Avoid global state abuse.

---

# Browser Capabilities Layer

Applications should leverage browser capabilities intelligently.

## Storage APIs

Use:

- localStorage
- sessionStorage
- IndexedDB

For:

- drafts
- preferences
- offline data
- session continuity

---

## Browser APIs

Support:

- Notifications API
- Clipboard API
- Web Share API
- MediaDevices API
- Geolocation API
- Background Sync
- Service Workers
- Web Workers
- Push Notifications

Only use when valuable to UX.

---

# Performance Standards

Applications must prioritize performance.

## Rendering Strategy

Prefer:

- Server Components
- streaming
- partial rendering
- edge rendering
- suspense boundaries
- lazy loading
- route-level splitting

---

## Performance Targets

### Core Web Vitals

| Metric | Target  |
| ------ | ------- |
| LCP    | < 2.5s  |
| INP    | < 200ms |
| CLS    | < 0.1   |

---

## Image Standards

Always use:

```txt
next/image
```

Requirements:

- explicit dimensions
- lazy loading
- responsive sizes
- modern formats
- optimized delivery

---

# SEO Intelligence System

Applications must support:

## Technical SEO

- metadata
- canonical URLs
- robots
- sitemap
- schema markup
- OpenGraph
- Twitter cards
- semantic structure

---

## Content SEO

Requirements:

- proper heading hierarchy
- semantic HTML
- keyword intent awareness
- readable content structure
- internal linking

---

## Structured Data

Support:

- Organization
- Product
- FAQPage
- SoftwareApplication
- Article
- BreadcrumbList

when relevant.

---

# Security Standards

Security must be built-in.

## Frontend Security Requirements

Applications must support:

- XSS prevention
- CSRF awareness
- secure cookies
- auth boundaries
- role-based access
- input sanitization
- upload validation
- secure storage handling
- token expiration handling

Never expose sensitive logic in frontend code.

---

## Authentication Standards

Support:

- JWT
- session auth
- OAuth
- refresh tokens
- role systems
- permission systems
- protected routes

---

# PWA Standards

Applications may support:

- installability
- offline mode
- push notifications
- app shell architecture
- cache strategies
- sync queues

Use PWA only when beneficial.

Do not force PWA unnecessarily.

---

# AI-Native Architecture

Modern applications should support AI-native experiences.

## AI UX Standards

Support:

- streaming responses
- conversational interfaces
- AI latency masking
- optimistic AI rendering
- contextual memory
- token-aware interactions
- interruptible generation

---

## AI Interaction Patterns

Preferred patterns:

- inline AI assistance
- contextual generation
- AI copilots
- command-based interaction
- AI suggestions
- contextual autocomplete

---

# Analytics & Behavioral Intelligence

Applications should support:

- funnel tracking
- click tracking
- retention tracking
- onboarding analytics
- CTA analytics
- session replay
- rage click detection
- feature adoption metrics

Preferred tooling:

```txt
PostHog
Plausible
GA4
```

---

# Conversion Engineering System

Applications must support conversion psychology.

## Conversion Rules

Always:

- reduce friction
- reduce uncertainty
- reduce hesitation
- reinforce trust
- guide momentum
- support activation

---

## Trust Systems

Support:

- testimonials
- metrics
- social proof
- guarantees
- onboarding reassurance
- progressive trust building

---

# Development Experience Standards

The system must support:

- linting
- formatting
- environment validation
- scalable scripts
- clean architecture
- reusable abstractions

Preferred tooling:

```txt
ESLint
Prettier
Husky
lint-staged
```

---

# Component Generation Rules

## Components Must Be

- reusable
- typed
- accessible
- composable
- scalable
- variant-driven
- responsive

---

## Component Rules

Avoid:

- oversized components
- duplicated logic
- hardcoded values
- inaccessible interactions
- deeply nested JSX

---

# Mobile-First Standards

Applications must prioritize:

- touch interactions
- responsive spacing
- thumb-friendly actions
- mobile navigation
- adaptive layouts

Minimum supported width:

```txt
375px
```

---

# Error Handling Standards

Applications must support:

- friendly error states
- retry systems
- offline handling
- toast notifications
- inline validation
- suspense fallbacks

Never expose raw technical errors to users.

---

# Empty States Standards

Empty states must:

- educate users
- guide next actions
- reduce confusion
- include CTA guidance

Avoid generic:

```txt
No data found
```

messages.

---

# Final System Objective

The objective is to create:

- scalable systems
- production-ready applications
- conversion-aware experiences
- accessibility-first interfaces
- AI-native workflows
- maintainable frontend architecture
- modern product ecosystems

The system should think like:

- product strategist
- UX engineer
- frontend architect
- conversion engineer
- accessibility specialist
- performance engineer
- behavioral designer

not a generic code generator.

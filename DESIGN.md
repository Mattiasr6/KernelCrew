# KernelLearn - Comprehensive Design System & UI Architecture

## Table of Contents
1. Visual Theme & Core Philosophy
2. Color Architecture (Tailwind/Hex)
3. Typography & Text Hierarchy
4. Layout, Grid & Spacing System
5. Component Styling (Atomic Design)
6. E-Learning Specific UI (Courses, Player, Progress)
7. Data Visualization & Dashboards
8. Depth, Shadows & Z-Index Scale
9. Animation & Micro-interactions
10. Accessibility & Focus States
11. Angular Material Override Rules
12. Empty States & Skeletons
13. System Prompt for AI Agents

---

## 1. Visual Theme & Core Philosophy
- **Identity:** Developer-centric Educational SaaS.
- **Aesthetic:** "Cyber-SaaS" / Modern Dark Mode. Minimalist, high-contrast, technical.
- **Vibe:** Similar to Vercel, Stripe (Dark), Linear, and Tailwind UI.
- **Rule of Thumb:** "Let the content glow." The UI should recede into the void (black/dark gray), while interactive elements, progress, and success states glow with neon precision.

---

## 2. Color Architecture (Tailwind/Hex)
Strictly adhere to this palette. **Do not invent new colors.**

### The Void (Surfaces & Backgrounds)
- **App Background:** `bg-zinc-950` (`#09090b`) - Lowest level.
- **Surface Level 1 (Cards, Sidebar):** `bg-zinc-900` (`#18181b`) - Default container background.
- **Surface Level 2 (Hover, Modals, Dropdowns):** `bg-zinc-800` (`#27272a`) - Elevated or active state.
- **Borders/Dividers:** `border-zinc-800` (subtle) or `border-zinc-700` (defined).

### The Light (Typography)
- **Primary Text (Headings, Active):** `text-zinc-50` (`#fafafa`)
- **Secondary Text (Body, Descriptions):** `text-zinc-400` (`#a1a1aa`)
- **Muted/Disabled Text:** `text-zinc-600` (`#52525b`)

### The Neon (Brand & Interaction)
- **Primary Accent (Neon Blue):** `text-cyan-500` / `bg-cyan-500` (`#06b6d4`). Used for primary buttons, active links, loading bars.
- **Secondary Accent (Purple):** `text-violet-500` / `bg-violet-500` (`#8b5cf6`). Used for premium plans, AI badges (KernelAI), and special gradients.

### Semantic/State Colors
- **Success/Completed:** `text-emerald-500` / `bg-emerald-500` (`#10b981`). Used for 100% progress, correct answers, active subscriptions.
- **Error/Locked/Destructive:** `text-rose-500` / `bg-rose-500` (`#f43f5e`). Used for locked courses, failed payments, delete actions.
- **Warning/Pending:** `text-amber-500` / `bg-amber-500` (`#f59e0b`). Used for expiring subs, pending reviews.

---

## 3. Typography & Text Hierarchy
- **Font Families:** `Inter` or system-sans for UI. `JetBrains Mono` for code snippets and technical badges.
- **H1 (Page Title):** `text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl`
- **H2 (Section Title):** `text-2xl font-semibold tracking-tight text-zinc-50`
- **H3 (Card Title):** `text-lg font-medium text-zinc-100`
- **Body Text:** `text-base font-normal text-zinc-400 leading-relaxed`
- **Small/Micro (Tags, Dates):** `text-xs font-medium uppercase tracking-wider text-zinc-500`

---

## 4. Layout, Grid & Spacing System
- **Main Container:** `<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">`
- **Grid System:** - Catalog/Courses: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - Dashboard Metrics: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- **Flexbox Defaults:** Always use `items-center` when aligning icons with text.
- **Section Spacing:** Use `space-y-8` or `my-12` to separate major page sections.

---

## 5. Component Styling (Atomic Design)

### Buttons
- **Primary Button:** `bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg px-4 py-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]`
- **Secondary Button:** `bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg px-4 py-2 border border-zinc-700 transition-colors`
- **Danger Button:** `bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20`

### Inputs & Forms
- **Text Inputs:** `bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block w-full p-2.5 outline-none transition-all placeholder-zinc-600`

### Badges / Chips
- **Standard:** `bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-700`
- **Premium (AI/Pro):** `bg-violet-500/10 text-violet-400 border border-violet-500/20`
- **Locked:** `bg-rose-500/10 text-rose-400 border border-rose-500/20`

---

## 6. E-Learning Specific UI

### Course Cards
- **Container:** `bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 relative group`
- **Thumbnail Area:** 16:9 ratio, dark overlay gradient (`bg-gradient-to-t from-zinc-900 to-transparent`).
- **Progress Bar:** - Track: `w-full bg-zinc-800 rounded-full h-1.5`
  - Fill: `bg-cyan-500 h-1.5 rounded-full` (or `bg-emerald-500` if 100%).
- **Locked State Overlay:** Absolute positioned overlay `bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center` with a Lock Icon.

---

## 7. Data Visualization & Dashboards
For the Instructor Dashboard and Analytics:
- **Metric Cards:** Clean `bg-zinc-900 p-6 rounded-xl border border-zinc-800`.
- **Trends:** Use small SVG sparklines or text indicators (e.g., `<span class="text-emerald-400 flex items-center"><mat-icon>trending_up</mat-icon> +12%</span>`).
- **Charts:** If using Chart.js, override defaults to remove grid lines (or make them `rgba(255,255,255,0.05)`). Use Neon Blue (`#06b6d4`) and Purple (`#8b5cf6`) for data lines/bars.

---

## 8. Depth, Shadows & Z-Index Scale
Shadows in dark mode are invisible unless colored or very spread. Rely on borders for definition.
- **Hover Shadows:** Use colored glows instead of black drop shadows.
- **Z-Index Scale:**
  - `z-0` Base content
  - `z-10` Sticky headers / Floating action buttons
  - `z-20` Dropdown menus (`mat-menu`)
  - `z-30` Overlays / Backdrops
  - `z-40` Navbars / Sidebars
  - `z-50` Modals / Dialogs
  - `z-60` Toasts / Snackbars (Notifications)

---

## 9. Animation & Micro-interactions
- **Global Rule:** Keep it snappy. Educational tools should feel fast.
- **Transitions:** Use `transition-all duration-200 ease-in-out` for hover states.
- **Modals/Dialogs:** Use a slight fade-in and scale-up (`animate-fade-in-up` custom utility).
- **Loading Spinners:** Use Cyan-500 for the SVG stroke. Keep it minimalist.

---

## 10. Accessibility & Focus States
- **Focus Rings:** Never remove `outline` without providing a `focus:ring`. Every interactive element MUST have `focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`.
- **Contrast:** Ensure all text passes WCAG AA contrast on dark backgrounds (Zinc 400 is the darkest text allowed on Zinc 950).

---

## 11. Angular Material Override Rules
Because Angular Material injects its own CSS, AI agents MUST use Tailwind to override it or use `::ng-deep` (sparingly) to force the Cyber-SaaS aesthetic:
- **Mat-Card:** Remove default shadows. Force `bg-zinc-900 border border-zinc-800`.
- **Mat-Menu:** Force background to `bg-zinc-800 border border-zinc-700`.
- **Mat-Divider:** Force border color `border-zinc-800`.
- **Mat-Icon:** Inherit text color (`text-current`) or apply Tailwind text colors (`text-cyan-500`).

---

## 12. Empty States & Skeletons
- **Empty States:** When a list is empty (e.g., 0 courses, 0 reviews), center content in a `border-dashed border-2 border-zinc-800 rounded-xl p-12 text-center`. Use a muted icon and a call-to-action button.
- **Loading Skeletons:** Instead of spinners for large content areas, use skeleton pulses: `animate-pulse bg-zinc-800 rounded-lg`.

---

## 13. System Prompt for AI Agents
**CRITICAL INSTRUCTION FOR ALL AI CODING AGENTS:**
1. You are designing for a Dark Mode natively platform.
2. YOU MUST strictly use the Tailwind CSS classes defined in this document (Zinc palette for backgrounds, Cyan/Violet for accents).
3. DO NOT output standard white-background CSS or Material Design defaults.
4. When creating Angular components, wrap logic in semantic HTML and apply the layout, grid, and atomic component styling defined in sections 4 and 5.
5. If creating a card or a button, apply the specific hover interactions and focus states outlined in sections 5 and 9.

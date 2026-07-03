---
Document ID: APA-EA-800
Title: Enterprise UX Architecture
Version: 1.0.0
Status: Frozen
Owner: Architecture Board
Reviewer: Chief Enterprise Architect
Classification: Internal
---

# APA-EA-800 Enterprise UX Architecture

This document serves as the "Kitab Figma" (UI/UX Bible) for APASIFIC ONE. It establishes the global design language, component rules, interaction patterns, and accessibility standards for all web and mobile interfaces.

---

## 1. Global Design Language

The APASIFIC ONE visual identity balances academic prestige with modern digital agility.

- **Primary Color**: Deep Indigo / Navy (Trust, Authority, Academic Depth).
- **Secondary / Accent**: Gold / Champagne (Excellence, Achievement, Premium feel).
- **Backgrounds**: Slate Gray / Pure White (Clarity, readability for long academic texts).
- **Typography**: 
  - *Headings*: Serif (e.g., Merriweather or Cinzel) for academic authority.
  - *Body/Interface*: Sans-Serif (e.g., Inter or Roboto) for high legibility in dense dashboards.

---

## 2. UI Principles

1. **Content First, Chrome Second**: The UI should never distract from the content (manuscripts, standards, profiles). Interfaces must be clean and spacious.
2. **Contextual Clarity**: Users operate in multiple roles simultaneously (Author + Reviewer). The UI must explicitly indicate which "Hat" the user is currently wearing.
3. **Progressive Disclosure**: Hide complex settings (like advanced editorial workflows) until requested by the user to reduce cognitive load.
4. **Predictable Interaction**: A button in the Certification platform should behave exactly like a button in the Publication platform.

---

## 3. Component System (Design Tokens)

All UI elements must be built using the shared component library to ensure pixel-perfect consistency across all 9 platforms.

- **Buttons**: Primary (Solid Deep Indigo), Secondary (Outline), Tertiary (Text only).
- **Cards**: Soft drop shadows, rounded corners (4px-8px). Used for journal issues, certification standards, and profile summaries.
- **Data Tables**: Striped rows, sticky headers, bulk action checkboxes, inline pagination.
- **Forms**: Floating labels, inline validation (green check / red cross), clearly grouped fieldsets (e.g., Personal Info vs Academic Qualifications).
- **Badges/Tags**: Used extensively for state tracking (e.g., [In Review], [Published]).

---

## 4. Interaction Patterns

- **Modals**: Used only for destructive actions (Delete, Reject Manuscript) or quick contextual tasks. Not for long forms.
- **Drawers / Slide-overs**: Used for deep-dives into metadata without losing context of the main data table.
- **Wizards / Steppers**: Mandatory for multi-step processes (e.g., 5-step Manuscript Submission, Certification Application).
- **Empty States**: Must provide a clear Call to Action (e.g., "You have no active submissions. [Submit a Manuscript]").

---

## 5. Dashboard Pattern: The Workspace Shell

As defined in APA-EA-400, the Dashboard is a dynamic **Workspace**.

- **Layout**: Fixed left sidebar (Navigation), fixed top header (Identity, Notifications, Search), fluid main content area.
- **Sidebar Architecture**:
  - Top: User Avatar, Name, Primary Capability (e.g., "Prof. Dr. John Doe - Eligible Editor").
  - Middle: Contextual Links injected by the Capability Engine (My Submissions, Pending Reviews, Assigned Assessments).
  - Bottom: Settings, Help, Logout.

---

## 6. Accessibility & Responsiveness

APASIFIC ONE is a global platform requiring strict adherence to accessibility laws.

- **WCAG 2.1 Level AA**: All color contrasts must pass the 4.5:1 ratio.
- **Keyboard Navigation**: All interactive elements must be reachable via Tab with visible focus states.
- **Screen Readers**: ARIA labels required for all icon-only buttons and complex UI widgets.
- **Mobile-First Responsive**: 
  - Complex data tables must collapse into card-views on mobile.
  - The Workspace Sidebar must convert to a bottom-tab bar or off-canvas hamburger menu on small screens.

---

## 7. Ecosystem Universal Search

The search bar located in the Workspace header must yield federated results categorized by Bounded Contexts.
- [Members] ? Returns Academic Profiles.
- [Publications] ? Returns Journal Articles.
- [Certifications] ? Returns Registry entries.

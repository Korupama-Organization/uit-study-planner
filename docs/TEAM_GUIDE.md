# 🤝 Team Responsibility Guide

This document outlines the responsibilities and working directories for the three main teams: **UI/UX**, **Data**, and **Logic**.

## 📂 Directory Overview

| Directory | Primary Team | Description |
| :--- | :--- | :--- |
| `src/components` | 🎨 UI/UX | Reusable UI components (Buttons, Cards, etc.) |
| `src/features` | Joint | specific feature code (UI + Logic) |
| `src/data` | 📊 Data | JSON data files used by the app |
| `scripts/` | 📊 Data | Scripts for scraping and processing data |
| `src/hooks` | 🧠 Logic | Custom React hooks |
| `src/store` | 🧠 Logic | Global state management (Redux/Zustand) |
| `src/lib` | 🧠 Logic | Helper functions and utilities |
| `src/core` | 🧠 Logic | Core business logic and types |

---

## 🎨 UI/UX Team
**Mission**: Create a beautiful, responsive, and user-friendly interface.

### Responsibilities
- **Design System**: Maintain `src/index.css` and `tailwind.config.js`.
- **Components**: Build reusable components in `src/components`.
- **Pages/Views**: Implement UI layers in `src/features/**/components`.
- **Assets**: Manage images, fonts, and icons in `src/assets`.

### Key Files & Directories
- `src/App.tsx` (Layout structure)
- `src/index.css` (Global styles)
- `src/components/**/*`
- `src/features/**/components/**/*`

---

## 📊 Data Team
**Mission**: Ensure accurate, structured, and up-to-date data for the application.

### Responsibilities
- **Data Collection**: Write scripts to scrape or fetch data.
- **Data Cleaning**: ensure data consistency and validity.
- **Data Transformation**: Convert raw data into JSON format usable by the frontend.

### Key Files & Directories
- `scripts/*.ts` (e.g., `validate-data.ts`, `scrape.ts`)
- `src/data/*.json` (The final output files)

> **Note**: Always validate JSON files against the types defined in `src/types.ts` or `src/core`.

---

## 🧠 Logic Team
**Mission**: Implement the business logic, state management, and application flow.

### Responsibilities
- **State Management**: Manage global state in `src/store`.
- **Business Logic**: Implement core algorithms in `src/core` or `src/lib`.
- **Hooks**: Create custom hooks in `src/hooks` to separate logic from UI.
- **API Integration**: Handle data fetching and API calls.

### Key Files & Directories
- `src/hooks/**/*`
- `src/store/**/*`
- `src/lib/**/*`
- `src/core/**/*`
- `src/features/**/hooks/**/*`

---

## 🔄 Collaboration Workflow
1. **Data Team** provides the `json` structure.
2. **Logic Team** creates `types` based on that data and hooks to consume it.
3. **UI/UX Team** uses those hooks and data types to build the interface.

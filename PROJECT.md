# Project: Velox Network Hardware Admin Panel

## Architecture
- **Framework**: Next.js 16.3.5 (App Router, Turbopack, React 19.2.8).
- **Styling**: Tailwind CSS v4 via `@theme inline` in `src/app/globals.css`.
- **Design Tokens**: Dark surface palette (`--theme-background: #09090b`, `--theme-surface: #111113`, `--theme-border-color: rgba(255, 255, 255, 0.08)`), emerald border accents (`border-emerald-500/30`, `text-emerald-400`, `bg-emerald-500/15`), orange brand primary (`#ea580c`).
- **Typography & Localization**: Vazirmatn font, RTL layout direction (`dir="rtl"`), numbers localized with `toPersianDigits()`, currency with `formatPrice()`, drilldown chevrons oriented RTL (`ChevronLeft`).
- **Overlay & Animation Strategy**: React `createPortal` to `document.body` + `framer-motion` (`AnimatePresence`, `motion.div`) for modals and slide-over drawers with ESC key handling and body scroll lock (no Radix UI installed).
- **Notifications**: Local React toast state with timeout and emerald badge container matching `AdminOverview` conventions.
- **Routing Structure**: `src/app/(admin)/admin/` containing `layout.tsx` (wrapped by `AdminLayoutClient`) and routes:
  - `/admin` (Overview dashboard)
  - `/admin/orders` (Orders & Shipments)
  - `/admin/rfq` (Project RFQ Management)
  - `/admin/invoices` (Invoices & Tax Gateway)
  - `/admin/partners` (B2B Corporate Partners)
  - `/admin/users` (Platform Users & Access Control)

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | AdminDataTable<T> | Generic responsive table with sorting, pagination, empty state, and mobile card view fallback | M1 | Survey / R1 |
| 2 | AdminFilterToolbar | Debounced search input (300ms), status filter tabs with badge counts, secondary segmented toggles, and export button | M1 | Survey / R1 |
| 3 | AdminStatsCards | Responsive metric KPI grid (2/3/4 cols) with tinted icon badges, trend indicators, and click interactions | M1 | Survey / R1 |
| 4 | AdminDetailDrawer | Reusable slide-over drawer (portal + framer-motion) with sticky header, scrollable body, and sticky actions footer | M1 | Survey / R1 |
| 5 | AdminActionModal | Confirmation & input modal for high-impact actions (financial approvals, tracking codes, suspensions) with loading state | M1 | Survey / R1 |
| 6 | Shared Admin Kit Export Barrier | Centralized barrel export in `src/features/admin/components/shared/index.ts` and `src/features/admin/index.ts` | M1 | Survey / R1 |
| 7 | Orders Page Full Replacement | Replace `AdminPagePlaceholder` in `/admin/orders` with full-featured `AdminOrdersView` | M2 | Survey / R2 |
| 8 | Order Status Tabs | 6 Tabs: All, Pending Financial, Warehouse Packaging, Courier/Freight, Delivered, Cancelled | M2 | Survey / R2 |
| 9 | Customer Type Segmentation | Filter and badge orders by B2B Enterprise vs Retail Customers | M2 | Survey / R2 |
| 10 | One-Click Bank Transfer Approval | Modal confirmation to approve Satna/Paya receipt and transition status to Warehouse Packaging | M2 | Survey / R2 |
| 11 | Shipping Tracking Assignment | Assign carrier (Tipax, Chapar, Freight, Express) and tracking code with toast feedback | M2 | Survey / R2 |
| 12 | Order Inspection Drawer | Detailed drawer showing customer info, shipping address, line items breakdown (Cisco/Nexans), and payment proof | M2 | Survey / R2 |
| 13 | RFQ Page Full Replacement | Replace `AdminPagePlaceholder` in `/admin/rfq` with full-featured `AdminRfqView` | M3 | Survey / R3 |
| 14 | RFQ Urgency Countdown Indicators | 3-tier visual badges (<4h pulsing red, <24h orange, normal) with remaining deadline countdown | M3 | Survey / R3 |
| 15 | Bill of Materials (BOM) Inspection | Equipment inspection separating active network hardware (switches/routers) and passive cabling with lengths | M3 | Survey / R3 |
| 16 | Project Discount & Validity Setting | Interactive discount adjustment percentage and validity duration selector (48h, 72h, 7d) | M3 | Survey / R3 |
| 17 | Digital Formal Proforma Issuance | Formal proforma preview dialog with official stamp/header, itemized pricing, VAT, and print action | M3 | Survey / R3 |
| 18 | Invoices Page Full Replacement | Replace `AdminPagePlaceholder` in `/admin/invoices` with full-featured `AdminInvoicesView` | M4 | Survey / R4 |
| 19 | Invoice Type Categorization | Type 1 (Legal B2B with 12-char economic code & national ID) vs Type 2 (Consumer standard) | M4 | Survey / R4 |
| 20 | National Tax System (سامانه مودیان) | Integration status badges and 22-character unique fiscal memory tax ID display with copy action | M4 | Survey / R4 |
| 21 | VAT Calculation & Financial Totals | 10% VAT calculation (قانون مالیات بر ارزش افزوده ۱۴۰۳), gross total, discounts, and payment status tracking | M4 | Survey / R4 |
| 22 | Official Standard Invoice Preview & Print | Print-ready layout conforming to ماده ۱۶۹ قانون مالیات‌های مستقیم with seller & buyer details | M4 | Survey / R4 |
| 23 | Partners Page Full Replacement | Replace `AdminPagePlaceholder` in `/admin/partners` with full-featured `AdminPartnersView` | M5 | Survey / R5 |
| 24 | Corporate Document Verification Pipeline | Verification status checklist for Official Gazette (روزنامه رسمی), Tax registration, and CEO National ID | M5 | Survey / R5 |
| 25 | Credit Line & Pichak Sayadi Cheques | Credit limit management (up to 500M Tomans) and Sayadi cheque tracking in Pichak system (16-digit ID) | M5 | Survey / R5 |
| 26 | Risk Tier & Account Executive Assignment| Risk tier assessment (Gold, Silver, Bronze) and dedicated network infrastructure account executive | M5 | Survey / R5 |
| 27 | Users Page Full Replacement | Replace `AdminPagePlaceholder` in `/admin/users` with full-featured `AdminUsersView` | M6 | Survey / R6 |
| 28 | User RBAC Role Filtering & Management | Filter and manage roles: Root Admin, Sales Manager, B2B Partner, Regular Customer | M6 | Survey / R6 |
| 29 | National ID & 2FA Security Badges | Shahkar National ID verification badges and 2FA status indicators (TOTP, SMS, Authenticator) | M6 | Survey / R6 |
| 30 | Customer Purchase History Summary | Lifetime order count, total spend in Tomans, and quick purchase summaries | M6 | Survey / R6 |
| 31 | Account Suspension & Role Modification Dialogs | Action modals with confirmation dialogs for suspending/activating accounts and modifying user roles | M6 | Survey / R6 |
| 32 | Zero Placeholder Verification | Verify zero `AdminPagePlaceholder` components remain across all 5 admin routes | M7 | AC / Quality |
| 33 | TypeScript Typecheck Cleanliness | Verify `npx tsc --noEmit` succeeds with zero errors across the entire codebase | M7 | AC / Quality |
| 34 | Responsive RTL Dark Theme Conformance | Verify dark theme tokens, emerald borders, Persian typography, RTL alignment, and mobile views | M7 | AC / Quality |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Shared Admin UI Kit | Create `src/features/admin/components/shared/` containing `AdminDataTable<T>`, `AdminFilterToolbar`, `AdminStatsCards`, `AdminDetailDrawer`, `AdminActionModal`, and barrel exports | none | DONE |
| M2 | Orders & Shipment Management | Replace placeholder on `/admin/orders` with `AdminOrdersView`, mock data extensions, status tabs, B2B filter, quick actions, detail drawer | M1 | IN_PROGRESS |
| M3 | Project RFQ Management | Replace placeholder on `/admin/rfq` with `AdminRfqView`, urgency countdowns, BOM inspection, discount & validity controls, proforma issuance | M1 | PLANNED |
| M4 | Official Invoices & Tax Gateway | Replace placeholder on `/admin/invoices` with `AdminInvoicesView`, Type 1 vs Type 2, سامانه مودیان 22-char ID, 10% VAT, invoice preview/print | M1 | PLANNED |
| M5 | B2B Corporate Partners | Replace placeholder on `/admin/partners` with `AdminPartnersView`, document verification, credit lines (up to 500M Tomans), Sayadi cheques in Pichak, risk tiers, account execs | M1 | PLANNED |
| M6 | Platform Users & Access Control | Replace placeholder on `/admin/users` with `AdminUsersView`, RBAC roles, National ID & 2FA badges, purchase history, suspension/role dialogs | M1 | PLANNED |
| M7 | Comprehensive Quality & Acceptance Gate | Zero placeholder verification, full `npx tsc --noEmit` typecheck, RTL dark theme validation, complete review & audit, Sentinel handoff | M1-M6 | PLANNED |

---

## Interface Contracts

### 1. `AdminDataTable<T>` (`src/features/admin/components/shared/admin-data-table.tsx`)
```typescript
export interface AdminColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  cell: (row: T, index: number) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  data: T[];
  columns: AdminColumnDef<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  onRowClick?: (row: T) => void;
  mobileCardRenderer?: (row: T) => React.ReactNode;
}
```

### 2. `AdminFilterToolbar` (`src/features/admin/components/shared/admin-filter-toolbar.tsx`)
```typescript
export interface FilterTabOption {
  id: string;
  label: string;
  count?: number;
  badgeVariant?: "default" | "orange" | "emerald" | "sky" | "purple" | "rose";
}

export interface AdminFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusTabs?: FilterTabOption[];
  activeStatusTab?: string;
  onStatusTabChange?: (statusId: string) => void;
  secondaryFilters?: React.ReactNode;
  onExport?: () => void;
  exportLabel?: string;
  isExporting?: boolean;
  customActionSlot?: React.ReactNode;
}
```

### 3. `AdminStatsCards` (`src/features/admin/components/shared/admin-stats-cards.tsx`)
```typescript
export interface AdminStatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  changePositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  variant: "emerald" | "orange" | "sky" | "purple" | "rose" | "amber";
  badge?: string;
  onClick?: () => void;
}

export interface AdminStatsCardsProps {
  items: AdminStatItem[];
  columns?: 2 | 3 | 4;
}
```

### 4. `AdminDetailDrawer` (`src/features/admin/components/shared/admin-detail-drawer.tsx`)
```typescript
export interface AdminDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}
```

### 5. `AdminActionModal` (`src/features/admin/components/shared/admin-action-modal.tsx`)
```typescript
export interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: React.ComponentType<{ className?: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}
```

---

## Code Layout
```
src/
├── app/
│   └── (admin)/
│       └── admin/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── orders/page.tsx     (Owned by M2)
│           ├── rfq/page.tsx        (Owned by M3)
│           ├── invoices/page.tsx   (Owned by M4)
│           ├── partners/page.tsx   (Owned by M5)
│           └── users/page.tsx      (Owned by M6)
├── features/
│   └── admin/
│       ├── components/
│       │   ├── shared/             (Owned by M1)
│       │   │   ├── admin-data-table.tsx
│       │   │   ├── admin-filter-toolbar.tsx
│       │   │   ├── admin-stats-cards.tsx
│       │   │   ├── admin-detail-drawer.tsx
│       │   │   ├── admin-action-modal.tsx
│       │   │   └── index.ts
│       │   ├── orders/             (Owned by M2)
│       │   │   ├── admin-orders-view.tsx
│       │   │   ├── order-detail-drawer-content.tsx
│       │   │   └── index.ts
│       │   ├── rfq/                (Owned by M3)
│       │   │   ├── admin-rfq-view.tsx
│       │   │   ├── rfq-proforma-modal.tsx
│       │   │   └── index.ts
│       │   ├── invoices/           (Owned by M4)
│       │   │   ├── admin-invoices-view.tsx
│       │   │   ├── invoice-preview-modal.tsx
│       │   │   └── index.ts
│       │   ├── partners/           (Owned by M5)
│       │   │   ├── admin-partners-view.tsx
│       │   │   ├── partner-detail-drawer-content.tsx
│       │   │   └── index.ts
│       │   ├── users/              (Owned by M6)
│       │   │   ├── admin-users-view.tsx
│       │   │   └── index.ts
│       │   ├── admin-layout-client.tsx
│       │   ├── admin-overview.tsx
│       │   ├── admin-page-placeholder.tsx
│       │   └── admin-sidebar.tsx
│       ├── data/
│       │   ├── admin-pages.ts
│       │   ├── mock-admin-data.ts
│       │   ├── mock-admin-orders.ts
│       │   ├── mock-admin-rfq.ts
│       │   ├── mock-admin-invoices.ts
│       │   ├── mock-admin-partners.ts
│       │   └── mock-admin-users.ts
│       ├── types/
│       │   ├── admin.types.ts
│       │   └── ...
│       └── index.ts
```

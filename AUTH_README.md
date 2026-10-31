# CampusSphare Multi-Role Authentication System

Welcome to the **Multi-Role Authentication Experience** for CampusSphare (`CampusShare`).

This subsystem allows **one person = one account = one email** to hold **multiple roles simultaneously** (e.g. Student + Space Owner + Volunteer) and switch between them instantly (<300ms) without logging out. The entire application (sidebar, dashboard, navigation, permissions, and top accent color) dynamically adapts to the active role.

---

## 🚀 Quick Start & Testing Flow

The application is running locally on **`http://localhost:8080`**.

### 1. Instant Demo Accounts
On `/login`, open the **"Instant Demo Accounts"** accordion to auto-fill credentials:

| Demo Persona | Email | Password | Role Capacities |
| :--- | :--- | :--- | :--- |
| **Multi-Role User (Aarjav Jain)** | `multi@campus.edu` | `Password123` | **Student** (Active), **Owner** (Active), **Volunteer** (Active), **Speaker** (Pending review) |
| **Single-Role Student (Aarav Sharma)** | `student@campus.edu` | `Password123` | **Student** only |
| **System Admin (Prof. Mehta)** | `admin@campus.edu` | `Password123` | **Admin** & **Manager** (can verify role requests & oversee space governance) |

---

## 🔑 End-to-End Walkthrough

### Step 1: Sign Up with Multiple Roles (`/signup`)
1. Navigate to [`/signup`](http://localhost:8080/signup).
2. Enter your Name, Email, and Password (notice the real-time **Password Strength Meter** enforcing min 8 characters, letters, and numbers).
3. Under **"I want to use CampusSphare as"**, tick two or more roles (e.g., **Student** + **Owner**).
   - Notice the **⚡ Instant** badge on Student and **⏳ Needs Approval** badge on Owner.
   - An informative alert appears: *"This role will be activated after admin approval. You can use your other roles meanwhile."*
4. A **"Start as"** chooser appears allowing you to select which instant role activates first.
5. Click **Complete Registration**:
   - A success dialog displays the status breakdown: Student (Active), Owner (Pending Approval).
   - Clicking continue directs you to your starting role's dashboard.

### Step 2: Instant Role Switching (`Alt+R` or Header Pill)
1. In the header bar, click the active role pill (e.g., `Student ▾`) or press **`Alt+R`**.
2. Click **Owner**:
   - The switch occurs instantly (<300ms) with a toast: *"Switched to Space / Equipment Owner"*.
   - The top colored accent bar turns **Emerald** (`#059669`).
   - The sidebar updates to display Owner tools: *Space Stewardship, Add Space, Review Booking Requests, Inventory*.

### Step 3: Conflict-of-Interest Guard
1. As an **Owner**, navigate to [`/approvals`](http://localhost:8080/approvals).
2. If any booking request was submitted by your own account (as Student), the approval buttons are disabled and replaced by:
   > ⚠️ **You can't review a request you made yourself.** *(Conflict-of-interest guard)*
3. Any action taken in the app is recorded in the audit trail as: `"User Name (as Active Role)"`.

### Step 4: Request an Approval-Required Role (`Add Role Modal`)
1. Click the Role Switcher pill and select **"Add another role to account"** (or click **"Add Role"** on [`/profile`](http://localhost:8080/profile)).
2. Choose **Speaker** or **Organisation**.
3. Fill in the requested credentials (e.g., topic, profession, organization name).
4. Submit: The role is immediately added to your account with **⏳ Pending Approval** status and a clock badge in the switcher dropdown.

### Step 5: Admin Approves the Role (`/admin/role-requests`)
1. Switch to the **Admin** account (`admin@campus.edu` / `Password123`) or switch your role to **Admin**.
2. Navigate to [`/admin/role-requests`](http://localhost:8080/admin/role-requests).
3. You will see the applicant's name, email, requested role, and submitted credentials.
4. Click **Approve**:
   - The role status transitions from `pending` to `active`.
   - The applicant is notified and can now immediately switch into that role without logging out!

---

## 🎨 Role Color Palette & Routing Matrix

| Role | Category | Home Route | Accent Color | Visual Token |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Self-Service | `/discover` | Indigo (`#4F46E5`) | 🎓 Graduation Cap |
| **Customer / Citizen** | Self-Service | `/discover` | Sky (`#0284C7`) | 👥 Community |
| **Volunteer** | Self-Service | `/volunteer` | Amber (`#D97706`) | 🤝 Heart Hands |
| **Owner (Steward)** | Approval-Required | `/owner` | Emerald (`#059669`) | 🏛️ Warehouse / Building |
| **Speaker** | Approval-Required | `/partner` | Rose (`#E11D48`) | 🎙️ Microphone |
| **Health Camp Partner**| Approval-Required | `/partner` | Red-Pink (`#DB2777`) | 🩺 Medical Heart |
| **Organisation (NGO)** | Approval-Required | `/partner` | Slate-Violet (`#7C3AED`)| 💼 Briefcase |
| **Campus Manager** | Admin-Assigned | `/approvals` | Teal (`#0D9488`) | 🛡️ Shield Check |
| **System Admin** | Admin-Assigned | `/admin` | Dark Slate (`#334155`)| ⚡ Shield |

---

## 🏗️ Architecture & Supabase Migration Guide

### 1. File Structure
```
src/
├── types/auth.ts                  # RoleId, RoleConfig, AuthUser, UserRoleRecord data models
├── store/authStore.ts             # Zustand store with localStorage persistence ('campussphere_auth_v2')
├── context/AuthContext.tsx        # React Context provider & useAuth hook for plug-and-play UI
├── components/
│   ├── RoleSwitcher.tsx           # Accessible Alt+R pill & dropdown with active/pending/rejected items
│   ├── AddRoleModal.tsx           # Role request dialog with custom fields per role type
│   └── auth/
│       ├── AuthLayout.tsx         # Split-screen responsive layout with branded gradient & stacked cards
│       ├── PasswordStrength.tsx   # Visual 4-tier password strength meter
│       ├── RoleCardSelect.tsx     # Tactile multi-select cards with instant/approval badges
│       ├── ContinueAsModal.tsx    # "Continue as" chooser for multi-role accounts with "Remember choice"
│       ├── PendingRoleBanner.tsx  # Warning banner for pending roles or temporary guest mode
│       └── RoleRouteGuard.tsx     # Route-level guard with one-click persona switch options
└── pages/
    ├── auth/
    │   ├── SignupPage.tsx         # Multi-role sign-up with role selection & post-signup status
    │   └── LoginPage.tsx          # Login with demo accounts autofill & forgot password modal
    └── admin/
        └── RoleRequests.tsx       # Institutional approval dashboard with live approve/decline controls
```

### 2. Upgrading to Supabase Auth (Without Changing the UI)
The `authStore.ts` actions and `AuthContext.tsx` methods are designed as clean wrappers around async operations.
To connect Supabase:
1. Replace `localStorage` mutations in `authStore.ts` with Supabase calls:
   - `signUp` $\rightarrow$ `supabase.auth.signUp()` + insert rows into a `user_roles` table:
     ```sql
     CREATE TABLE user_roles (
       user_id UUID REFERENCES auth.users(id),
       role VARCHAR(50) NOT NULL,
       status VARCHAR(20) DEFAULT 'pending', -- 'active', 'pending', 'rejected'
       details JSONB,
       requested_at TIMESTAMPTZ DEFAULT NOW(),
       approved_at TIMESTAMPTZ,
       PRIMARY KEY (user_id, role)
     );
     ```
2. Enable Row-Level Security (RLS) on `user_roles`:
   - Users can `SELECT` their own roles.
   - Users can `INSERT` roles where `status = 'pending'` (or auto-activate self-service roles via a database trigger).
   - Only admins (`role = 'admin'`) can `UPDATE status = 'active'` or `status = 'rejected'`.
3. In `RoleSwitcher.tsx`, no changes are needed because it already consumes `useAuthStore` selectors!

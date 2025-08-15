# SpiderQueue

A clean, fast task queuing system for teams. Built with React, Vite, TypeScript, and MUI. Local-first with a Firestore backend toggle.

## Highlights

- Workspaces with projects in a left sidebar
- Ticket board (Inbox, Hold, On Deck, In Progress, Done)
  - Drag a card to move between columns
  - Click-release on a card opens the ticket detail
- Filter bar (Home, Person, List) with people, tag and text filters
- Ticket details in a slide-over with history, tags, assignment, lending
- Invite flow:
  - Workspace settings → Invite user → copy 6‑char code
  - Accept Invite dialog: shows current email, enter/paste 6 boxes (auto‑submit on full paste)
- Auth: Google or local email fallback (when Firebase env vars aren’t set)
- Firestore repository abstraction (easy switch from local storage)

## Tech Stack

- React 18, TypeScript, Vite
- Material UI (MUI)
- Firestore (optional) via a repository layer
- @hello-pangea/dnd for drag and drop

## Getting Started

### Requirements
- Node.js 18.x (recommended 18.18+) and npm

### Install
```bash
npm install
```

### Configure environment
Create `.env` in the project root (kept out of git):
```
# Toggle Firestore repository (set true to use Firestore)
VITE_USE_FIRESTORE=false

# Firebase Web App config (needed if VITE_USE_FIRESTORE=true)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```
- With `VITE_USE_FIRESTORE=false`, the app runs fully in the browser using localStorage.
- With `VITE_USE_FIRESTORE=true`, the app uses Firestore for workspaces, members, invites, projects, and tickets.

### Run
```bash
npm run dev
```
Open `http://localhost:5173`

## Using the App

1. Sign in:
   - If Firebase is configured: Google sign-in
   - Otherwise: enter email (local mode)
2. Workspaces:
   - Top-right: Workspace selector, + menu, settings (gear), and profile menu
   - “+” → Create new… opens a dialog to create a workspace
   - “+” → Join existing… opens Accept Invite
   - Gear opens settings for the selected workspace
3. Projects:
   - Create and select projects from the left sidebar
4. Board:
   - Drag a ticket to move status
   - Click-release on a ticket opens the detail overlay
5. Filters:
   - Home, Person, and List views
   - People multi-select, tag chips, and text search in List view
6. Invites:
   - Settings → Invite User (generates a 6-character code stored in Firestore)
   - Accept Invite shows your email and a 6-box code input
   - Pasting a full 6-character code auto-submits

## Firestore Details

When Firestore is enabled, collections used:
```
workspaces/{workspaceId}
  projects/{projectId}
    tickets/{ticketId}
memberships/{membershipId}   // { workspaceId, email, role }
invites/{inviteId}           // { code, email, workspaceId, createdAt }
```
- Ticket history is stored on each ticket document (`history` array). The app normalizes timestamps safely.

### Dev Security Rules (example)
Use for local development only. Restrict appropriately for production.
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Architecture

- UI: MUI components layered into small modules: `WorkspaceSelector`, `ProjectSidebar`, `FilterBar`, `TicketBoard`, `TicketDetail`, `WorkspaceSettingsDialog`, `WorkspaceCreateDialog`, `AcceptInviteDialog`
- Data: repository pattern
  - `src/lib/repos/workspacesRepo.ts` provides a single API
  - Local impl (localStorage) and Firestore impl (switch with `VITE_USE_FIRESTORE`)
- Auth: `src/lib/firebase.ts` wraps Firebase init/auth; falls back gracefully if env vars are missing

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview the production build

## Roadmap

- Email invites and notifications
- Role-based permissions per workspace
- Realtime updates (listen to Firestore changes)
- Attachments and activity comments
- Analytics and reporting
- Dark mode

## License

MIT

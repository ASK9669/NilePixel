# FieldTrack — Offline Field Issue Tracker

**NilePixel Technologies — Cohort 1 Graduation Project**

## 1. Project Overview

FieldTrack is an offline-first infrastructure issue reporting application designed for field workers operating in areas with unreliable internet connectivity.

It allows users to report broken water points, damaged equipment, service interruptions, safety concerns, and maintenance requirements.

Reports are stored locally and synchronized with the backend when connectivity returns. Coordinators can review reports and update their statuses.

## 2. Features

- Create infrastructure issue reports.
- Save reports locally using IndexedDB.
- Continue using the application when offline.
- Automatically synchronize pending reports when connectivity returns.
- Display Pending, Synchronized, and Failed synchronization states.
- Prevent duplicate submissions using unique client-generated IDs.
- Manage report statuses through a validated workflow.
- Record report activity and synchronization failures.
- Responsive dashboard for desktop and mobile.
- Progressive Web App support.

## 3. Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- IndexedDB
- idb
- Lucide React
- Vite PWA

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Testing
- Node.js built-in test runner
- Vitest
- fake-indexeddb

## 4. Architecture

The frontend communicates with the backend through REST APIs.

IndexedDB stores reports locally and maintains their synchronization states.

MongoDB stores synchronized reports and their activity history.

The application checks connectivity and attempts synchronization when the browser comes online or the application starts.

## 5. Report Workflow

The supported workflow is:

Draft → Submitted → Assigned → In Progress → Resolved

Rejected is also supported.

Valid transitions:

- Submitted → Assigned
- Submitted → Rejected
- Assigned → In Progress
- Assigned → Rejected
- In Progress → Resolved

Resolved and Rejected are terminal states in this version.

## 6. Synchronization Strategy

1. A field worker creates a report.
2. The report receives a unique client-generated ID.
3. The report is saved in IndexedDB before network synchronization.
4. When online, the application sends the report to the backend.
5. The backend checks the client ID to prevent duplicate creation.
6. Successful reports are marked Synchronized locally.
7. Failed reports remain stored locally with an error message.
8. Retry attempts use exponential backoff.
9. The application retries pending reports on startup and when connectivity returns.

The server's unique client ID index provides duplicate protection during repeated requests.

## 7. Installation and Setup

### Requirements

- Node.js
- npm
- MongoDB Atlas or local MongoDB

### Clone the repository

```bash
git clone YOUR_PUBLIC_REPOSITORY_URL
cd fieldtrack
```

### Backend setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
```

Start the backend:

```bash
npm run dev
```

### Frontend setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the frontend URL displayed by Vite.

## 8. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | Backend health check |
| POST | /api/reports | Create or synchronize report |
| GET | /api/reports | Retrieve reports |
| PATCH | /api/reports/:id/status | Update report status |

## 9. Automated Tests

Backend:

```bash
cd server
npm test
```

Frontend:

```bash
cd client
npm test
```

Production build:

```bash
cd client
npm run build
```

Testing priorities include valid and invalid workflow transitions, rejection validation, and local report persistence.

## 10. Design Decisions and Assumptions

- Authentication is not implemented because it is optional.
- Field-worker and coordinator roles are simulated.
- Every report receives a unique client-generated ID.
- The server is authoritative after successful synchronization.
- Submitted reports cannot be edited through the current interface.
- Rejected reports require a rejection reason.
- Resolved and rejected reports cannot be reopened in this version.
- Server-side report status updates require an internet connection.
- Duplicate detection is based on client-generated IDs rather than matching report descriptions.

## 11. Known Limitations

- No real authentication or role-based access control.
- No map-based location selection.
- No image attachments.
- No cross-device conflict resolution.
- No guaranteed background synchronization after the browser is completely closed.
- Retry scheduling is currently triggered by application startup, connectivity restoration, and manual synchronization.
- Automated database integration and end-to-end tests can be expanded.

## 12. Manual QA Checklist

- [ ] Create a report while online.
- [ ] Create a report while offline.
- [ ] Refresh while offline and verify local persistence.
- [ ] Restore connectivity and synchronize.
- [ ] Retry a failed synchronization.
- [ ] Verify that retrying does not create duplicates.
- [ ] Reject a report without a reason and verify validation.
- [ ] Reject a report with a valid reason.
- [ ] Test invalid status transitions.
- [ ] Verify activity history.
- [ ] Test the production build offline.

## 13. Git and Development History

The project is developed incrementally using descriptive Git commits.

## 14. AI and Development Tool Disclosure

AI assistance: OpenAI ChatGPT.

Purpose:
- Project planning and architecture guidance.
- Code generation and debugging suggestions.
- Testing guidance.
- Documentation assistance.

Generated suggestions were reviewed, adapted, and tested during development. The developer remains responsible for understanding and verifying the implementation.

## 15. Development Information

**Project:** FieldTrack

**Organization:** NilePixel Technologies

**Participant:** Awel Surur Kemer

**Development time:** Record actual approximate development time.

**Future improvements:** Authentication, role-based access, stronger synchronization recovery, image attachments, map integration, and expanded automated tests.
# Rosterly — Engineering Employee Roster

Rosterly is a responsive engineering scheduling web app. It maps Microsoft 365 users to projects, presents assignments in a weekly calendar, and supports both administrator-assigned and employee self-assigned work.

## Included

- Weekly engineering calendar with project, time, task detail, project filter, and employee search
- Administrator view for employee creation/access, role selection, and self-assignment permission
- Employee view that restricts new assignments to the signed-in user
- Project-to-person mapping and team-wide schedule visibility
- Browser-local persistence for the working prototype
- Responsive desktop, tablet, and mobile layouts
- Netlify deployment configuration

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## GitHub and Netlify

1. Create a GitHub repository and push this directory.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`.
4. Add production environment variables in **Site configuration → Environment variables**.

## Microsoft 365 / O365 integration

The UI currently uses seeded users so it runs without credentials. For production, register an application in Microsoft Entra ID and use MSAL plus Microsoft Graph:

1. Register a single-page application and add the Netlify URL as a redirect URI.
2. Request delegated permissions `User.Read` and `User.ReadBasic.All`. Admin consent may be required by your tenant.
3. Add `VITE_ENTRA_CLIENT_ID` and `VITE_ENTRA_TENANT_ID` in Netlify; never commit secrets.
4. Use `@azure/msal-browser` for authorization-code flow with PKCE.
5. Load employees from `GET https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,jobTitle,userPrincipalName`.
6. Store the Graph user `id` as the stable external identity, not the email address.

The browser must not hold an application client secret. For privileged Graph calls or scheduled synchronization, use a Netlify Function with a server-side secret or certificate.

## Recommended production data model

Use a managed PostgreSQL service with these entities:

- `profiles`: `id`, `entra_user_id`, `display_name`, `email`, `role`, `self_assign_enabled`, `active`
- `projects`: `id`, `name`, `color`, `active`
- `project_members`: `project_id`, `profile_id`
- `assignments`: `id`, `profile_id`, `project_id`, `starts_at`, `ends_at`, `details`, `status`, `created_by`
- `audit_log`: actor, action, entity, timestamp, before/after JSON

## Security and access

- Authenticate every request with Entra ID and validate JWT issuer, audience, signature, and expiry server-side.
- Enforce roles on the API/database, not only by hiding UI controls.
- Engineers may create/update assignments only where `profile_id` equals their identity and `self_assign_enabled` is true.
- Admins may manage users, permissions, projects, and all assignments.
- All authenticated engineers may read team assignments; keep sensitive notes out of task details.
- Use least-privilege Graph scopes, HTTPS-only secure cookies where applicable, CSP/security headers, input validation, rate limits, and an audit log.
- Use UTC in storage and render in the user’s configured timezone.

## Current prototype boundary

The application is a polished, functional front-end prototype. Microsoft sign-in, Graph synchronization, a shared database, and server-side authorization require tenant/database credentials and should be added before production use.

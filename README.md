# KUAT Digital

A small-business platform with an education catalog, articles, digital-readiness
assessments, consultation booking, freelancer profiles, service packages, and
project request and delivery workflows. Member, freelancer, and administrator
roles are retained in this source edition.

## Stack and setup

Use Node.js 22.13 or newer. The application uses Next.js, React, TypeScript,
Tailwind CSS, Clerk authentication, MySQL, and Drizzle ORM.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Database-backed pages and protected workflows still
require a separately configured MySQL database and Clerk instance. Database and
third-party integration code is retained; it has not been replaced with mocks.

Required database settings are `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER`,
and `DATABASE_PASSWORD`. Optional connection settings include `DATABASE_PORT`,
`DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED`, and `DATABASE_SSL_CA`.
Authentication uses `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`;
`ADMIN_EMAILS` controls the administrator allowlist. Supply your own development
configuration outside source archives. No environment file, credentials, or
production data is included.

```sh
npm run db:migrate
npm run db:seed
npm run db:check
```

The seed script uses the included example catalog and clearly labeled demo
freelancer profiles. `SEED_DEMO_FREELANCERS=true` enables those optional profiles.
Do not run migration or seeding scripts against a production database.

## Checks

```sh
npm run test:unit
npm run lint
npm run build
```

The unit checks cover role selection, readiness scoring, and freelancer workflow
transitions. Full application checks require the development services above.
Generic support contacts use reserved `example.com` addresses. Public illustration
assets contain no personal portraits.

## License

MIT. Installed dependencies retain their own licenses; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

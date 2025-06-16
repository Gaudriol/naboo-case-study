# Naboo interview

## (Post-completion) What could have been improved?

- Adding more frontend testing :sweat_smile:
- Add tests to resolvers, e2e testing
- Fixing the dependecies vulnerabilities warnings
- Upgrading Next.js
- Better handling of apollo cache invalidating and refetching queries (feels a bit clunky as is)

## What's used ?

backend

- mongodb
- nestjs
- mongoose
- data mapper pattern
- graphql

frontend

- nextjs (with page router)
- mantine-ui
- @hello-pangea/dnd (for drag and drop)
- axios
- vitest
- graphql
- apollo client

## How to launch project ?

backend

```bash
npm i

npm run start:dev
```

frontend

```bash
npm i

npm run dev
```

after graphql modification

```bash
# > frontend
npm run generate-types
```

## Connection informations

### Regular user

email: user1@test.fr
password: user1

### Admin user

email: admin@test.fr
password: admin

# Snap Share

## Local development

`pnpm dev` starts both surfaces and prints their URLs:

- Marketing site (public homepage, pricing, FAQ, landing pages): http://localhost:4321
- App (login, order, host tools, guest album): http://localhost:8080

Opening http://localhost:8080/ redirects to the marketing site. In production, CloudFront serves the Astro build at `/` and the Vue shell only for app paths. See `docs/routing-and-deploy.md`.

`apps/api` in this repo is empty. The Laravel API is a separate repository.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

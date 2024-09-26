# Shelf 📚

## Writing and publishing made simple, with a peloton of tools for your website.

Hosted on Vercel and Cloudinary, built with Astro and Tina - be ready with your website under *10 minutes*.

You can use Github authentication for all services.

## Quick start

### Pre-requisites

1. Github account
1. Sign in, https://app.tina.io
1. Sign in, https://vercel.com
1. Sign in, https://console.cloudinary.com/console

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhandshou%2Fastro-vercel&env=TINA_PUBLIC_CLIENT_ID,TINA_CONTENT_TOKEN,TINA_SEARCH_TOKEN)

### Vercel settings

Node version 18 should be used. 

## Developers

### Testing

E2E not complete.

### Running locally

Setup `.env` with environment variables. Check [commands](#commands).

### Contributing

Fork this repository. Allow updates to be fetched by adding an upstream remote.

```bash
git remote add upstream https://github.com/handshou/astro-vercel-blog-2.git
git remote -v
git fetch upstream
```

If this remote url changes, update it.

```bash
git remote set-url upstream https://github.com/newusername/repository-name.git
git remote -v
```

More on git remotes [here](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).

## Environment Variables

| Variable               | Link to get it                               |
| :--------------------- | :------------------------------------------- |
| TINA_PUBLIC_CLIENT_ID  | [Project Details](https://app.tina.io/projects) |
| TINA_CONTENT_TOKEN     | [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| TINA_SEARCH_TOKEN      | [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| CLOUDINARY_CLOUD_NAME  | [API Keys > Header](https://console.cloudinary.com/settings) |
| CLOUDINARY_API_KEY     | [API Keys](https://console.cloudinary.com/settings) |
| CLOUDINARY_API_SECRET  | [API Keys](https://console.cloudinary.com/settings) |

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `cp .env.example .env` | Copy environment variables template for local    |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## Credit

Astro
Tina-astro

Vercel deploy button, inspired by [Starter Kit](https://github.com/opengovsg/starter-kit).


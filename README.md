# Shelf 📚

Make your website. 

## Writing and publishing made simple

Hosted on,

- Vercel 
- Cloudinary 

Built with, 

- Astro 
- Tina 

Be ready in *10 minutes*. You can use your Github sign in for everything.

## Quick start

### Pre-requisites

1. A Github account
1. Sign in https://app.tina.io
1. Sign in https://vercel.com
1. Sign in https://console.cloudinary.com/console

### One click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhandshou%2Fastro-vercel&env=TINA_PUBLIC_CLIENT_ID,TINA_CONTENT_TOKEN,TINA_SEARCH_TOKEN)

### Vercel settings

Node version 18 

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

[Read more](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes) on git remotes

## Environment Variables

| Variable               | How to Get                                   |
| :--------------------- | :------------------------------------------- |
| TINA_PUBLIC_CLIENT_ID  | [Projects](https://app.tina.io/projects) > Project Details |
| TINA_CONTENT_TOKEN     | [Projects](https://app.tina.io/projects) > Project Details > [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| TINA_SEARCH_TOKEN      | [Projects](https://app.tina.io/projects) > Project Details > [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| CLOUDINARY_CLOUD_NAME  | [Settings](https://console.cloudinary.com/settings) > API Keys > See Header |
| CLOUDINARY_API_KEY     | [Settings](https://console.cloudinary.com/settings) > API Keys |
| CLOUDINARY_API_SECRET  | [Settings](https://console.cloudinary.com/settings) > API Keys |

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | What It Does                                     |
| :--------------------- | :----------------------------------------------- |
| `cp .env.example .env` | Copy environment vars                            |
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


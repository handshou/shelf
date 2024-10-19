# Shelf 📚

Make your website and use your Github sign in for **everything**. 

Be ready in 10 minutes! 

## Writing and publishing made simple

Made with love

- Astro 
- Cloudinary 
- Tina 
- Vercel 

## Quick start

### Prerequisites

Signing up for everything takes the biggest part. Then its all downhill!

1. A Github account
1. Sign in https://app.tina.io
1. Sign in https://vercel.com
1. Sign in https://console.cloudinary.com/console

### One click deploy

Have your environment variables ready, see [here](#environment-variables) to get them.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhandshou%2Fastro-vercel&env=TINA_PUBLIC_CLIENT_ID,TINA_CONTENT_TOKEN,TINA_SEARCH_TOKEN)

## Developers

Here are some instructions to make your own changes or contribute.

### Testing

E2E coming!

### Running locally

Setup `.env` with environment variables. Check [Commands](#commands).

### Contributing

Fork this repository. Allow updates to be fetched by adding an upstream remote.

```bash
git remote add upstream https://github.com/handshou/astro-vercel-blog-2.git
git remote -v
git fetch upstream
```

> [!NOTE]
> If this repository changes, update your project remotes.

```bash
git remote set-url upstream https://github.com/new-username/new-repository-name.git
git remote -v
```

[Read more](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes) on git remotes.

## Outro

### Environment Variables

| Variable               | How to Get                                   |
| :--------------------- | :------------------------------------------- |
| PUBLIC_GOOGLE_MAPS_API_KEY    | [Enable Maps Embed API](https://developers.google.com/maps/documentation/embed/cloud-setup#enabling-apis) > [Keys & Credentials](https://console.cloud.google.com/google/maps-apis/credentials) |
| TINA_PUBLIC_CLIENT_ID  | [Projects](https://app.tina.io/projects) > Project Details |
| TINA_CONTENT_TOKEN     | [Projects](https://app.tina.io/projects) > Project Details > [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| TINA_SEARCH_TOKEN      | [Projects](https://app.tina.io/projects) > Project Details > [Tokens](https://app.tina.io/projects/$TINA_PUBLIC_CLIENT_ID/tokens) |
| PUBLIC_CLOUDINARY_CLOUD_NAME  | [Settings](https://console.cloudinary.com/settings) > API Keys > See Header |
| PUBLIC_CLOUDINARY_API_KEY     | [Settings](https://console.cloudinary.com/settings) > API Keys |
| CLOUDINARY_API_SECRET  | [Settings](https://console.cloudinary.com/settings) > API Keys |

### Commands

All commands are run from the root of the project.

Essentials:

| Main Command           | What It Does                                     |
| :--------------------- | :----------------------------------------------- |
| `cp .env.example .env` | Copy environment vars                            |
| `vim .env`             | Edit environment vars                            |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`      |

Others:

| Misc Command           | What It Does                                     |
| :--------------------- | :----------------------------------------------- |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

### Credits

Astro

Tina-astro

Deploy button is inspired by [Starter Kit](https://github.com/opengovsg/starter-kit).

### Thanks

Your interest in this project is appreciated!


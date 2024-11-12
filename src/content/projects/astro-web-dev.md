---
title: Astro web dev
pubDate: 2024-11-10T16:00:00.000Z
description: Awesome websites
---

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731334711/posts/file_t22nxy.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731334716/posts/file_eqy1im.png)

Many developers have blogs, but not all are active, not all are technical. Mine fell into both camps.

This is the longest running web dev project I've worked on. In January 2023, I moved this website off my home-based Raspberry Pi, running a local copy of GhostCMS with an Nginx reverse proxy. Almost 2 years later (Nov 2024), I'm still working on it.

Astro's new concept is separate Component Islands.

To keep my website from stagnanting, I wanted to rebuild and understand how each process worked.

The old stack was not inspiring; I did not understand the layers; The Pi to CMS to content delivery network. Others have moved to Jekyll and Hugo to squish complexity.

## Make blogs active again

Back to wicked fast statically generated sites (SSG).

Astro [documentation](https://docs.astro.build/en/install-and-setup/) is well organised and easy to use. The mission is to make contentful sites with an option for Markdown files and Astro Island components. Astro is [UI-agnostic](https://docs.astro.build/en/concepts/why-astro/).

Great developer and user experience.

### CMS to improve writing experience

[TinaCMS](https://tina.io) primarily allows the blog to run on serverless functions. The secondary reasons for choosing it is real-time editing: I can see changes as I change content similarly to WYSIWYG editors.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140367/posts/file_lohqik.png)

### Serving on Vercel

Before Vercel, I had hosted my blog using Cloudflare and before that, on Github pages (github.io).

The one-click deploy button is the primary reason I decided to stay with Vercel. I have hopes to make websites for others, making it straightforward create an account and get straight into a demo. Vercel allows me to do that in one-click.

### Hosting media: Cloudinary

There are great third-party media integration choices to make, and I chose to use Cloudinary for all media (videoes, images). I made this change around early September 2024 to write about my travel experiences with all the images to share. Avoiding using external image hosts because they may go out overnight in a rug pull sometimes.

### MDX, AST, plugins

Abstract syntax trees (ASTs) are new to me. Making the switch from SSG, to server-side rendering (SSR), meant the need to handroll some parts of rendering MDX data to serve HTML pages. Between the MDX and HTML layers is a pipeline to convert data structures to HTML. The text you are reading now used to be rendered by hand, but I've moved to use Tina's Markup plugin, Remark, behind the scenes. I can render custom plugins such as iFrames featuring google maps, Cloudinary media player, even custom components such as [Shadcn library](https://ui.shadcn.com) inside Tina's Slate rich text editor.

### Server-side rendering, server components

The /travels part of this website is written mostly in React, and use of SSR to paint what you see on the browser means a separation of frontend and backend. The method in which media, fonts, plugins (such as code and pre block highlighting), has to be thought differently.

### Linting and tests

Refactoring this site to add structure to code was added only when expanding `/travels`. Prevent code regression with light routing tests, allow endpoints to be changed and components to move locations and be grouped by type. As more code enters in separate windows of code, linting helps unify the code patterns with rules. I adopted to use Biome for linting and Playwright for simple tests.

# ISWAS pitch site: static build for upload

This folder holds only the files the site serves. It is the **iswas.grok.me build**
(the newest one). It was mirrored on 2026-09-29 around 03:38 ET and checked against
the live site at 04:40 ET, when it was still the same build. Asset hashes are
`index-7le_n55D.js` and `styles-DUFhvYpD.css`.
None of the site's text or images were changed.

## Contents (50 files, about 2.9 MB)
| Path | Purpose |
|---|---|
| `index.html` | Overview page (`/`) |
| `need/ stars/ form/ comparison/ contact/` | Pre-rendered route pages (`index.html` in each) |
| `404.html` | The build's own "Not Found" page. GitHub Pages serves it for unknown URLs. |
| `assets/` (10) | Compiled JS chunks and CSS |
| `fonts/` (5) | Self-hosted web fonts |
| `plates/` (13), `portraits/` (9), `og.jpg` | Site images, plus the social share image |
| `favicon.svg`, `__grok/` | Favicon, web manifest, and apple-touch icon |
| `.nojekyll` | Stops GitHub Pages' Jekyll from hiding the `__grok/` folder (it drops paths that start with `_`) |
| `README.md` | This file |

## Where it goes
Upload the **contents** of this folder to the root of the Pages publishing branch or folder,
e.g. the repo `JOTSmedia/ISWAS`. You can also use any static host.

## IMPORTANT: base-path caveat
This build is built to run at the **site root `/`**. Every URL in it is root-absolute
(`/assets/...`, `/fonts/...`, `/plates/...`), and the router expects `/`, `/need`, and so on.
- At `https://jotsmedia.github.io/ISWAS/` (a project-page subpath) it will **not work**.
  The browser will request `jotsmedia.github.io/assets/...`, get 404s, and show a blank or unstyled page.
- It works as-is on a **custom domain** set on the repo (Settings > Pages > Custom domain, which adds a CNAME).
  It also works on a root host: the `jotsmedia.github.io` org repo, Netlify, Vercel, or Cloudflare Pages.
- For a `/ISWAS/` subpath, rebuild from source with `vite.ghpages.config.ts` (`base: "/ISWAS/"`).
  That is a dev task and has not been done here.

## Noindex
The build has **no** robots meta tag and **no** robots.txt. iswas.grok.me gets `noindex`
only from an HTTP header (`x-robots-tag: noindex`). GitHub Pages can't send custom headers,
so **this upload will be indexable**.
Suggested follow-up for the design/tech side: add
`<meta name="robots" content="noindex, nofollow">` in the source (`__root.tsx` head) and rebuild.

## Notes
- `contact/index.html`: Cloudflare had scrambled the two contact emails (Email Obfuscation).
  Without the fix they would show as "[email protected]" with dead `/cdn-cgi/` links off Cloudflare.
  The emails were decoded back to the original `mailto:` markup, which matches the
  site's own JS/source (Malek@ / Ryan@trancasfilms.com). The injected Cloudflare script tag was removed.
  No other bytes changed.
- The pages still contain the tags grok.me's host injected: `og:image` points to
  `https://iswas.grok.me/og.jpg`, plus a `grok.com/grok-app-builder/extensions.js` script and grok
  project meta tags. The manifest is named "Grok App". All of this was left as fetched.

## Deliberately excluded
.zip archives, the ISWAS preliminary packet PDF (and all PDFs), source code (src/, *.ts/tsx,
package.json, lockfiles, node_modules, vite/tsconfig configs, tests, .git), the draft folders
(story/, creative/, sizzle/, design/, writing/), .DS_Store, .env files and secrets, audit/scratch
files, and mirror/host artifacts (headers.txt, refs.txt, ua.html).

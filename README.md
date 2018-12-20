# linus.zone

A URL shortener / note sharing service, running at [linus.zone](https://linus.zone).

## Setup

To start `zone`:

1. Make sure you have `npm` installed, and install dependencies with `npm install` or `yarn install`
2. `npm start` or `yarn start` to start the server.

## Todo's

- [ ] Avoid sanitizing dangerous HTML tags if they're rendered inside code snippets. This may require is to restructure our sanitizer so we sanitize on render and not save.
- [ ] Ability to see all created uris and notes as links under one page (`/all`), password-authenticated


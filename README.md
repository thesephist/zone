# linus.zone

A URL shortener / note sharing service, running at [linus.zone](https://linus.zone).

## Setup

To start `zone`:

1. Make sure you have `npm` installed, and install dependencies with `npm install` or `yarn install`
2. Create a `.env` file with your global password (see below note), `PASSWORD=<some sha256 hash>`
3. `npm start` or `yarn start` to start the server.

### Note on a global password and spam prevention

I wrote this app a while ago, and still run it in production for my personal use at linus.zone. It used to be open for anyone to use, but I started running into problems with spam, with scammers trying to use this redirector to mask their real domains. This is obviously problematic in many ways, but I didn't want to add a fully-fledged auth system to the app, so for now I've set a global secret password, defined in a `.env` file, so that only those with that single password can edit the link shortener database.

It's not an elegant solution, but it took a few minutes and worked for me, without adding any complexity.

This means that, if you want to run this on your own, you also either need to set a `PASSWORD` in an `.env` file, or remove the global-password-checking logic from `src/main.js` (grep for `isAuthorizedUser`).

## Todo's

- [ ] Avoid sanitizing dangerous HTML tags if they're rendered inside code snippets. This may require is to restructure our sanitizer so we sanitize on render and not save.
- [ ] Ability to see all created uris and notes as links under one page (`/all`), password-authenticated


# linus.zone

A URL shortener / note sharing service, running at [linus.zone](https://linus.zone).

## Setup

To start `zone`:

1. Make sure you have `npm` installed, and install dependencies with `npm install` or `yarn install`
2. `npm start` or `yarn start` to start the server.

## Todo's

- [ ] Add password-protected writes - [Issue](https://github.com/thesephist/zone/issues/1)
- [ ] Sanitize notes by removing `<script>`, `<style>`, and `<link>` from notes before markdown conversion - [Issue](https://github.com/thesephist/zone/issues/2)
    - A nice stretch goal here would be to use [CSS containment](https://developer.mozilla.org/en-US/docs/Web/CSS/contain) to make sure note content can't overflow outside of the note area
- [ ] Add a button to incrementally expand the height of the textarea for larger multiline inputs, since it's awkward to use the dragger when the page has a limited height itself
- [ ] Ability to add images
- [ ] Ability to see all created uris and notes as links under one page (`/all`), password-authenticated


# Photo Gallery (Infinite Scroll)

React + Vite single page app that renders photos from the paginated feed
`https://picsum.photos/v2/list?page=N`.

## Features
- 1-column list showing the photo and `Author: <name>`
- Infinite scroll with IntersectionObserver: reaching the bottom loads the next page
- Stops when a page returns no data ("You have reached the end.")
- Font Awesome thumbs-up icon next to each photo with a count starting at 0; every click adds 1
- Loading state, error message with retry, duplicate-request guard
- No CORS proxy needed (the picsum API allows cross-origin requests)

## Run
```bash
npm install
npm run dev     # http://localhost:3000
```

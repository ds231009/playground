# Games

Small puzzle games (Sudoku, Str8ts, Wordle), split out of the portfolio repo. The game code comes from the portfolio's `main` branch as of commit `5ab089a` (Feb 2026), including the Str8ts rewrite and the 3D views.

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # static build in dist/
```

- `src/games.ts` lists the games (title, summary, icon, lazy component). Add a game there.
- `src/games/<Name>/` holds each game's code, untouched from the portfolio.
- Routing uses `HashRouter` (`/#/sudoku`), so the build works on any static host, GitHub Pages included, without a 404 redirect.
- Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml` (live at https://ds231009.github.io/playground/). Needs Settings → Pages → Source set to "GitHub Actions".
- `src/styles/` is a copy of the portfolio's tokens and type ramp so both sites look alike.

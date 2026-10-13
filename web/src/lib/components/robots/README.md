# EZBO robots

75 animated helper robots + your logo robot as the AI CEO.

## Files
- `createRobot.js`: SVG robot generator. `createRobot(agent)` returns an `<svg>` string.
- `agents.js`: all 75 helpers (name, tag, description, icon, category) and per-bot overrides.
- `RobotShowcase.jsx`: React component (CEO, category tabs, grid, hover bubble).
- `robots.css`: styles and animations (light and dark, reduced-motion aware).

## Setup (Next.js or React)
1. Copy the four files into `components/robots/`.
2. `npm i @tabler/icons-webfont`, then import once in your root layout:
   `import '@tabler/icons-webfont/dist/tabler-icons.min.css'`
3. Put your logo robot (transparent background) at `public/ezbo-ceo.png`.
4. Use it where the old Helpers Catalog was:
   `import RobotShowcase from '@/components/robots/RobotShowcase'`
   `<RobotShowcase signupUrl="/signup" />`

## Customize
- Edit text, icons, or the category of any bot in `agents.js`.
- Tweak one robot's look with `OVERRIDES` (eyes, ear, ant, hat, c, e).
- Link each bot to its own studio page: `<RobotShowcase studioUrl={(a) => `/studio/${a.name.toLowerCase()}`} />`

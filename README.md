# era — care, before it's urgent

A clickable website prototype for **era**, a free public service that helps families prepare for care together — before it becomes urgent. Student service-design project at CIID (Copenhagen Institute of Interaction Design).

All people, places, services and data in this prototype are made up.

## Open it

Download or clone the repository and double-click `index.html`. An internet connection is needed for the fonts.

Or run a small local server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## What's inside

| Page | What it shows |
|---|---|
| Login | Animated first touchpoint: bubbles pop in, come together, the logo appears, then the join form |
| Family | A map of the family — who lives where, travel times, nearby services. Drag the map; click a person to see their card |
| Connect | "Connect with brother Marco" → *Quick checks!* (share / receive medical information) → "now connected". A page refresh resets it |
| Your steps | Chat with the era assistant (scripted, not a real AI) and a checklist it fills |
| Services | Services near Rosa with filters, search and a neighbourhood map |
| Help desk · Privacy Policy · Urgent help | Talk to a real person, short explanations, and the urgent-help window |

## Files

- `index.html` — page shell, header, urgent-help window
- `styles.css` — design tokens and all styles
- `app.js` — pages, example data, map, animations
- `assets/` — logo and example photos

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static web application displaying a cocktail menu with French UI. No build tools or dependencies - pure HTML, CSS, and vanilla JavaScript.

## Development

Open `index.html` directly in a browser, or serve with any static file server:
```bash
python -m http.server 8000
# or
npx serve .
```

## Architecture

- **[index.html](index.html)** - Single-page app shell with header, category nav, main content area, and modal overlay
- **[js/app.js](js/app.js)** - All application logic: fetches cocktail data, renders categories/items, handles modal interactions
- **[css/styles.css](css/styles.css)** - Mobile-first dark theme using CSS custom properties (--bg, --gold, --text, etc.)
- **[data/cocktails.json](data/cocktails.json)** - Cocktail data: categories array and cocktails array with ingredients/instructions
- **[images/cocktails/](images/cocktails/)** - Optional cocktail images; SVG glass icons display as fallback

## Data Structure

Cocktails in `data/cocktails.json` follow this schema:
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "category": "category-id",
  "glass": "coupe|rocks|highball|wine",
  "description": "Flavor profile",
  "ingredients": [{ "name": "...", "amount": "..." }],
  "instructions": "Preparation steps"
}
```

Categories: `petillants`, `fruites`, `herbaces`, `corses`

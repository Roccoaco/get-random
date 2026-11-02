# Get Random

**A non-linear compass for your week.** Get Random gives you one small, novel thing to do each day, balanced across ten domains of a rich life (Senses, Explore, Learn, Create, Connect, Move, Reflect, Give, Awe, Play). It draws on motivation science and cognitive psychology. A Curioster project. *Have fun, be yourself and enjoy.*

- **Open the app:** https://roccoaco.github.io/get-random/
- **Brand book:** https://roccoaco.github.io/get-random/brand/

Available in English, Italiano, Français, Español, Deutsch and Dansk. Use the globe menu in the header to switch.

## Features

| Section | What it does |
|---|---|
| **Compass** | Seven generated "sparks", one per day. You can lock or re-spin any day, set energy, company and time, and pick a psychological need to feed. Each spark comes with a when-cue and a short "why this works". |
| **Toolbox × Week** | Store as many weeks as you like. Drag sparks between an event tray and the seven day boxes (mouse, touch, or the keyboard Move menu). Rename, duplicate, delete, import, and share weeks as a copyable code. |
| **Happenings** | Eight lockable reels (format, theme, place, guests, rule, prop, soundtrack, closing ritual) give trillions of combinations for small events. |
| **Diary** | Mood and energy scales, science-backed writing prompts, a third-person mode and a mood line. |
| **Library** | Folders inside folders for notes, sparks and happenings. Search looks through all of your stuff and also invents fresh sparks about any word you type. |
| **Commons** | Suggest weeks to others and adopt theirs (GitHub issues on the public site). |
| **Why it works** | The twelve theories behind the generator, with citations. |

### How the generator stays fresh
Sparks are built from templates with open slots (country, genre, colour, skill, question…) plus optional twists. That grammar gives millions of combinations. A novelty ledger fingerprints every spark you have seen and steers new weeks away from them. Sparks are stored as language-neutral recipes rather than sentences, so switching language rewrites your whole week instantly.

## Privacy
Weeks, diary and library are saved only in your own browser (`localStorage`). Nothing is sent to a server. Clearing site data or switching device starts fresh.

## Commons and Claude ideas on GitHub Pages
Both work on the public site, with no server.

- **Commons:** shared weeks are stored as [issues in this repository](https://github.com/Roccoaco/get-random/issues). The app reads them through GitHub's public API, so anyone can browse and adopt weeks without an account. GitHub allows 60 anonymous requests per hour per visitor, and the app caches results for 5 minutes. **Post on GitHub** opens a pre-filled issue: you need a free GitHub account, and you press "Submit new issue" to publish. 👍 reactions count as likes. To remove a post, close the issue. The repository owner can moderate by closing or deleting issues.
- **Claude ideas** (wild-card sparks, happening plans, "Ask Claude" in search): each visitor pastes their own Anthropic API key in the Compass sidebar. The key is stored only in that browser and sent only to `api.anthropic.com`, and usage is billed to the visitor's own Anthropic account. Keys are available at [console.anthropic.com](https://console.anthropic.com/).

Inside claude.ai the same app uses the artifact's built-in shared store and Claude instead, so no key or GitHub account is needed there.

## Build from source
The pages are plain HTML, CSS and JavaScript with no dependencies.

```
python3 src/build.py
```

This regenerates `index.html` (app), `brand/index.html` (brand book) and `dist/artifact.html` (the body used for the claude.ai artifact).

```
src/
  engine.js     app logic: generator, views, drag and drop, language menu
  i18n/*.js     language packs: UI text, templates, word lists, reels, theories
  meta.js       template metadata (domain, energy, social, minutes)
  legacy.js     data used to migrate weeks saved by the first version
  page.html     page shell
  *.css         styles
  brand.html    brand book source
```

### Adding a language
Copy `src/i18n/en.js`, translate every string, and keep every list the same length and in the same order. Templates may reorder their `{slots}` but must use the same set. Add the code to the language order in `engine.js` (`ORDER`) and to the list in `src/build.py`, then rebuild.

## Science
Built on Self-Determination Theory (Ryan & Deci, 2000), psychological richness (Oishi & Westgate, 2022), savoring (Bryant & Veroff, 2007), curiosity as an information gap (Loewenstein, 1994), flow (Csikszentmihalyi, 1990), weak ties (Sandstrom & Dunn, 2014), behavioral activation (Jacobson et al., 1996), self-distancing and expressive writing (Kross et al., 2014; Pennebaker, 1997), varied kindness (Lyubomirsky, Sheldon & Schkade, 2005), awe (Keltner & Haidt, 2003), implementation intentions (Gollwitzer, 1999) and hedonic adaptation (Frederick & Loewenstein, 1999).

Get Random is a wellbeing and curiosity tool, not therapy or medical advice.

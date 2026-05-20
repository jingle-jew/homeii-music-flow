# How To Add A Language

HOMEii Music Flow uses flat JavaScript dictionaries in `src/localization/`. English is the fallback language, so every new language file should start by copying the English keys. Version 5.6.1 ships with English, Hebrew, and Simplified Chinese.

## Steps

1. Create a new language file in `src/localization/`, for example `fr.js`.
2. Copy the full contents of `src/localization/en.js` into the new file.
3. Translate only the string values. Do not rename, remove, or reorder keys unless you also update the source code.
4. Open `src/localization/index.js` and import the new file, for example:

```js
import fr from "./fr.js";
```

5. Register the dictionary in `DICTIONARIES` and add a display option in `LANGUAGE_OPTIONS`:

```js
export const DICTIONARIES = Object.freeze({ en, fr, he });

export const LANGUAGE_OPTIONS = Object.freeze([
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "he", label: "Hebrew" },
]);
```

6. If the language is right-to-left, add its code to `RTL_LANGUAGE_CODES` in `src/localization/index.js`.
7. Run `npm test`, `npm run build`, and `node scripts/release.mjs` locally.
8. Test the card by setting `language: fr` in the card config. If a key is missing, the card will fall back to English.

Use `TRANSLATING.md` as the glossary and context reference while translating.

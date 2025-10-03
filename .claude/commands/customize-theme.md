---
description: Customize application theme using daisyUI
argument-hint: None required
---

# Customize Theme

Help the user customize their application's theme using daisyUI's theme system.

## Process

1. Help them through the theme customization process:
   - Guide them to https://daisyui.com/theme-generator/
   - Have them create both light and dark theme variants
   - Ask them to provide the generated CSS theme definitions
2. Integrate their custom themes into `src/index.css`.

Note — there should be exactly two themes, one of them default and the other prefersdark. If the user provides a theme with default: false and prefersdark: false, infer which one it should be

## Important Syntax Notes

- Use the correct daisyUI theme syntax: `@plugin "daisyui/theme"` (NOT the old themes array format)
- Each theme requires a separate `@plugin "daisyui/theme"` block
- Include `@plugin "daisyui";` before the theme definitions
- Reference: https://daisyui.com/docs/themes/

## Example Format

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: "theme-name";
  default: true;
  prefersdark: false;
  color-scheme: "light";
  --color-base-100: oklch(...);
  /* other color variables */
}

@plugin "daisyui/theme" {
  name: "theme-name-dark";
  default: false;
  prefersdark: true;
  color-scheme: "dark";
  /* dark theme colors */
}
```

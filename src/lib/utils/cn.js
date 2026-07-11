import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doesn't know about our custom fontSize tokens
 * (text-heading-md, text-button-sm, etc. from tailwind.config.js).
 * Without this, it misclassifies them as text-color utilities and
 * incorrectly strips real color classes like `text-white` when they
 * appear earlier in the same className (e.g. Button variants).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xxl",
            "display-xl",
            "display-lg",
            "display-md",
            "heading-lg",
            "heading-md",
            "heading-sm",
            "subtitle",
            "body-lg",
            "body-md",
            "body-sm",
            "button-md",
            "button-sm",
            "caption",
          ],
        },
      ],
    },
  },
});

/**
 * Merge Tailwind classes with conflict resolution.
 * shadcn-style utility.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

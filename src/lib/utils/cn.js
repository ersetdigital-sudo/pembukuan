import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * shadcn-style utility.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

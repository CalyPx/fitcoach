import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge doesn't know about our custom display type scale
// (text-display-hero/lg/md/sm) — by default it buckets any unrecognized
// `text-*` class into the text-color group, so it collides with and
// silently drops `text-fg` (or vice versa) whenever both appear together.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-hero', 'display-lg', 'display-md', 'display-sm'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

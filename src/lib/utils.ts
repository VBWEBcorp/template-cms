import { twMerge } from 'tailwind-merge'

type ClassValue = Parameters<typeof twMerge>[number]

/** Assemble des classes Tailwind ; en cas de conflit, la dernière gagne (h-8 puis h-11 donne h-11). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(inputs)
}

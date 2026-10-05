/**
 * Assemblage de classes SANS résolution de conflits : pour les composants
 * client du site public, afin de ne pas embarquer tailwind-merge (8 Ko gzip)
 * dans chaque page. Ne pas y combiner deux classes qui se contredisent
 * (h-8 et h-11) : utiliser `cn` côté serveur ou dans l'admin pour cela.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

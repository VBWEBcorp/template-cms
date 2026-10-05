import { Phone } from 'lucide-react'

/**
 * Bouton d'appel flottant. Désactivé par défaut (siteConfig.features.floatingCallButton) :
 * il ajoute une troisième voie de contact à côté du formulaire et du rendez-vous.
 * À n'activer que pour un métier où l'appel immédiat est la conversion attendue
 * (dépannage, urgence). Placé à gauche pour ne pas couvrir le bouton « haut de page ».
 */
export function FloatingCallButton({ phoneE164 }: { phoneE164: string }) {
  return (
    <a
      href={`tel:${phoneE164}`}
      aria-label="Appeler"
      className="group fixed bottom-6 left-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95"
    >
      <Phone className="size-5 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '3s' }} />
    </a>
  )
}

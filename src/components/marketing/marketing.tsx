import { MarketingBannerBar } from '@/components/marketing/banner-bar'
import { MarketingPopup } from '@/components/marketing/marketing-popup'
import { type MarketingSettings, isBannerLive, isPopupLive } from '@/lib/marketing'

/**
 * Point de montage du marketing dans l'ossature du site (src/app/(site)/layout.tsx).
 *
 * Sans ce montage, les réglages de l'admin n'atteignent personne : la popup
 * existe en base, l'admin répond 200, et rien ne s'affiche, sans aucune erreur.
 * Le test src/tests/cablage.test.ts échoue si ce composant n'est plus monté.
 *
 * Le bandeau est rendu côté serveur (aucun JavaScript) ; seule la popup, quand
 * elle est active, charge un petit script.
 */
export function Marketing({ settings }: { settings: MarketingSettings }) {
  return (
    <>
      {isBannerLive(settings) && (
        <div className="fixed inset-x-0 top-0 z-[60]">
          <MarketingBannerBar settings={settings} />
        </div>
      )}
      {isPopupLive(settings) && <MarketingPopup settings={settings} />}
    </>
  )
}

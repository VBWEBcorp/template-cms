import { AtSign, Clock, Map } from 'lucide-react'

import { siteConfig } from '@/lib/seo'

export function InfoCards() {
  return (
    <section className="bg-beige py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:px-10 md:grid-cols-3">
        {/* Adresse */}
        <div className="bg-beige-deep p-8">
          <div className="flex items-center gap-3">
            <Map strokeWidth={1.6} className="size-6 text-sauge-deep" />
            <h3 className="font-display text-3xl font-medium text-foreground">
              Adresse
            </h3>
          </div>
          <div className="mt-5 space-y-2 text-sm leading-relaxed text-foreground/85">
            <p>
              {siteConfig.address.street}, {siteConfig.address.city}
            </p>
            <p>
              <span className="font-semibold">Accès :</span>{' '}
              {siteConfig.address.access}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-beige-deep p-8">
          <div className="flex items-center gap-3">
            <AtSign strokeWidth={1.6} className="size-6 text-sauge-deep" />
            <h3 className="font-display text-3xl font-medium text-foreground">
              Contact
            </h3>
          </div>
          <div className="mt-5 space-y-2 text-sm leading-relaxed text-foreground/85">
            <p>
              <span className="font-semibold">Mail :</span>
              <br />
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:opacity-70"
              >
                {siteConfig.email}
              </a>
            </p>
            <p>
              <span className="font-semibold">Numéro :</span>{' '}
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
                className="hover:opacity-70"
              >
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </div>

        {/* Horaires */}
        <div className="bg-beige-deep p-8">
          <div className="flex items-center gap-3">
            <Clock strokeWidth={1.6} className="size-6 text-sauge-deep" />
            <h3 className="font-display text-3xl font-medium leading-[1.05] text-foreground">
              Horaires
              <br />
              d&rsquo;ouverture
            </h3>
          </div>
          <ul className="mt-5 space-y-1 text-sm leading-relaxed text-foreground/85">
            <li>
              <span className="font-semibold">Lundi et mardi</span> : fermé
            </li>
            {siteConfig.openingHours.slice(2).map((h) => (
              <li key={h.day}>
                <span className="font-semibold">{h.day}</span> : {h.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

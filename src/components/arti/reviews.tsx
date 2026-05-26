import { Star } from 'lucide-react'

const reviews = [
  {
    name: 'Fanette Herisse',
    when: 'il y a 4 mois',
    initials: 'FH',
    color: 'bg-[#E89A6A]',
    content: 'Parfait. Un moment unique 😊',
  },
  {
    name: 'Fleur "Fleur"',
    when: 'il y a 7 mois',
    initials: 'F',
    color: 'bg-[#6A8FE8]',
    content:
      'Super expérience ! Beaucoup de choix de céramique selon les saisons !',
  },
  {
    name: 'Margaux B',
    when: 'il y a 4 mois',
    initials: 'MB',
    color: 'bg-[#D04A78]',
    content:
      "Super expérience de peinture sur céramique, nous recommandons chaudement ! La personne qui nous accueille est extrêmement gentille et disponible. Le café est également…",
  },
] as const

export function Reviews() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-sauge-deep">
          Ce qu&apos;ils pensent de nous
        </p>
        <h2 className="mt-4 text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
          Découvrez les avis clients
        </h2>

        <div className="relative mt-12">
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.name}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`flex size-14 items-center justify-center rounded-full ${r.color} font-sans text-base font-semibold text-white`}
                  aria-hidden
                >
                  {r.initials}
                </div>
                <p className="mt-4 font-sans text-sm font-semibold text-foreground">
                  {r.name}
                </p>
                <p className="text-xs text-foreground/60">{r.when}</p>
                <div className="mt-2 flex items-center gap-0.5 text-[#F5B544]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-4 max-w-[20rem] text-[13px] leading-relaxed text-foreground/80">
                  {r.content}
                </p>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="mt-8 block w-full text-center text-xs font-medium uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground"
          >
            Lire la suite
          </button>
        </div>
      </div>
    </section>
  )
}

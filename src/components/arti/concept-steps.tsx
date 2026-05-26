import {
  IconCups,
  IconJugs,
  IconKiln,
  IconVase,
} from '@/components/arti/concept-icons'

const steps = [
  {
    n: '1',
    title: 'Choisissez',
    Icon: IconCups,
    body:
      "En arrivant, l'équipe d'Arti prendra quelques minutes pour vous donner toutes les explications nécessaires sur la peinture, les techniques et le matériel puis c'est parti ! Vous pourrez choisir la céramique de votre choix parmi une large sélection de pièces : bol, tasse, vase, assiette, coquetier…",
  },
  {
    n: '2',
    title: 'Décorez',
    Icon: IconVase,
    body:
      "A vos pinceaux ! Choisissez vos couleurs et laissez libre court à votre créativité. Si les idées venaient à vous manquer, un carnet d'inspiration sera à votre disposition pour vous permettre de réaliser les plus jolies des créations.",
  },
  {
    n: '3',
    title: 'Patientez',
    Icon: IconKiln,
    body:
      "A la fin de votre atelier, nous récupérons votre pièce afin de l'émailler et la cuire dans notre four à haute température (1 000°C). Cela révèlera les couleurs et la rendra étanche !",
  },
  {
    n: '4',
    title: 'Récupérez',
    Icon: IconJugs,
    body:
      'Environ 3 semaines plus tard, vous pourrez passer au café pour découvrir et récupérer votre création.',
  },
] as const

export function ConceptSteps({ title = 'Le concept' }: { title?: string }) {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <h2 className="text-center font-display text-5xl font-medium text-foreground sm:text-6xl">
          {title}
        </h2>

        <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map(({ n, title: t, Icon, body }) => (
            <div key={n} className="flex flex-col items-center text-center">
              <Icon className="mb-6 h-16 w-auto text-foreground" />
              <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
                {n}. {t}
              </h3>
              <p className="mt-4 max-w-[18rem] text-[13px] leading-relaxed text-foreground/75">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

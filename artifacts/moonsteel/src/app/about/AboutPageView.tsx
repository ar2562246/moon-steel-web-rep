import Link from "next/link";
import { Award, Building2, Cog, Factory, PenTool, ShieldCheck, Wrench } from "lucide-react";
import { ParentBackLink } from "@/components/layout/ParentBackLink";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { CmsImage } from "@/components/ui/CmsImage";

const generations = [
  {
    era: "First generation",
    year: "1947",
    name: "Ghulam Haider",
    body: "Moon Steel Fabricators traces its roots to 1947, when Ghulam Haider established the family metalworking enterprise in Karachi. He had two sons — Muhammad Suleman and Dawood Ahmed.",
  },
  {
    era: "Second generation",
    year: "1974",
    name: "Muhammad Suleman",
    body: "Muhammad Suleman joined his father in the business, and together they delivered the company's first dedicated steel fabrication project in 1974. Under their partnership the operation grew from general metalwork into a manufacturing facility for commercial kitchen, hotel, hospital, and laboratory stainless equipment.",
  },
  {
    era: "Third generation",
    year: "Today",
    name: "Ovais Suleman & Abdul Rahman",
    body: "Muhammad Suleman has three sons — Ovais Suleman, Abdul Rahman, and Soban Suleman. Ovais and Abdul Rahman joined their father in the business and continue the family legacy. Today Muhammad Suleman and his two sons run Moon Steel Fabricators together, combining three generations of craft knowledge with modern manufacturing capability.",
  },
];

const team = [
  {
    name: "Muhammad Suleman",
    role: "Chief Executive Officer",
    detail: "Leads the company and oversees fabrication standards.",
    phone: "+92-321-8228314",
    tel: "+923218228314",
    photo: "/images/team/muhammad-suleman.jpg",
  },
  {
    name: "Ovais Suleman",
    role: "Sales and Project Management",
    detail: "Client projects, scheduling, and site coordination.",
    phone: "+92-300-2276057",
    tel: "+923002276057",
    photo: "/images/team/ovais-suleman.jpg",
  },
  {
    name: "Abdul Rahman",
    role: "Business Development",
    detail: "New business, consultants, and technical proposals.",
    phone: "+92-300-2562246",
    tel: "+923002562246",
    photo: "/images/team/abdul-rahman.jpg",
  },
];

const capabilities = [
  {
    icon: Factory,
    title: "State-of-the-art machinery",
    body: "We have continually invested in modern fabrication machinery so cutting, forming, and finishing are repeatable to specification rather than dependent on hand work alone.",
  },
  {
    icon: ShieldCheck,
    title: "Certified stainless steel",
    body: "Fabrication in AISI 304 and AISI 316 stainless steel, or the grade your specification calls for — with food-grade finishes for kitchen and hygienic environments.",
  },
  {
    icon: PenTool,
    title: "In-house design",
    body: "Kitchen layouts and individual items drawn in AutoCAD, so consultants and clients approve exact dimensions before we cut steel.",
  },
  {
    icon: Wrench,
    title: "On-site fabrication and installation",
    body: "Our own teams handle site fabrication, installation, and fit-out, so equipment lands level, sealed, and ready for service.",
  },
  {
    icon: Cog,
    title: "Fully custom work",
    body: "Beyond our standard catalogue we build to drawing — chute systems, claddings, platforms, kick plates, and one-off equipment.",
  },
  {
    icon: Award,
    title: "Proven with leading names",
    body: "Kitchen equipment for Pizza Hut branches across Pakistan, Serena Hotels, Sheikh Zayed Palaces, Aga Khan Hospital, and dozens more.",
  },
];

const stats = [
  { value: "1947", label: "Family business established" },
  { value: "1974", label: "First steel fabrication project" },
  { value: "3", label: "Generations in the business" },
  { value: "50+", label: "Years fabricating steel" },
];

export function AboutPageView() {
  return (
    <main className="layer-0 pb-16 pt-28">
      <div className="container mx-auto px-4 md:px-6">
        <ParentBackLink href="/" label="home" />
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="apple-section-title mb-6 section-title-accent">About Moon Steel</h1>
          <p className="apple-section-copy">
            A three-generation manufacturing facility in Karachi. We build and supply customized
            stainless steel equipment for commercial kitchens, hospitals, laboratories, hotels, and
            industry across Pakistan.
          </p>
        </div>

        <SectionReveal className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="layer-1 rounded-xl p-6 text-center">
              <p className="text-4xl font-display font-semibold leading-none text-foreground md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-3 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </SectionReveal>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">Three generations, one manufacturing facility.</h2>
            <p className="apple-section-copy">
              Moon Steel Fabricators has been passed from father to son twice. The same family that
              started it still runs it — which is why our clients deal directly with the people whose
              name is on the work.
            </p>
          </div>

          <SectionReveal className="grid gap-6 md:grid-cols-3">
            {generations.map((generation) => (
              <article key={generation.era} className="layer-1 rounded-xl p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {generation.era}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{generation.year}</span>
                </div>
                <h3 className="mb-3 text-xl font-display font-semibold text-foreground">
                  {generation.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{generation.body}</p>
              </article>
            ))}
          </SectionReveal>
        </section>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">Pioneers in steel fabrication.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="layer-1 space-y-4 rounded-xl p-8">
              <p className="text-base leading-relaxed text-muted-foreground">
                Moon Steel Fabricators are pioneers in steel fabrication in Pakistan and leading
                manufacturers of customized stainless steel equipment — particularly for commercial
                kitchens, laboratories, hotels, and restaurants.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Our portfolio includes major names such as Serena Hotel Islamabad, Sheikh Zayed
                Palaces across Pakistan, and kitchen equipment for Pizza Hut branches nationwide. The
                ethos of the company places the utmost emphasis on quality and durability, using the
                latest technological tools at our disposal to ensure the client always gets their
                money&rsquo;s worth.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                Over five decades we have also delivered for hospitals, pharmaceutical laboratories,
                petroleum operators, clubs, banks, and industrial plants — alongside the consultants
                who specify our work.
              </p>
              <p className="pt-2 text-sm text-muted-foreground">
                This history was first published on our earlier website,{" "}
                <a
                  href="https://moonsteelfab.com/aboutus/"
                  className="text-primary underline-offset-4 hover:underline"
                  rel="noopener noreferrer"
                >
                  moonsteelfab.com/aboutus
                </a>
                .
              </p>
            </div>

            <div className="layer-1 flex flex-col justify-between gap-6 rounded-xl p-8">
              <div>
                <div className="layer-2 layer-tint-primary mb-5 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-display font-semibold text-foreground">
                  Our facility
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Plot 142, Sector 24, Korangi Industrial Area, Karachi &mdash; our manufacturing
                  facility, where we design, cut, form, weld, and finish equipment under one roof,
                  then supply it to sites across Pakistan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                >
                  See our projects
                </Link>
                <Link
                  href="/clients"
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
                >
                  See our clients
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">How we build quality in.</h2>
            <p className="apple-section-copy">
              Craft knowledge passed down three generations, backed by machinery that holds
              tolerances repeatably.
            </p>
          </div>

          <SectionReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div
                  key={capability.title}
                  className="layer-1 flex items-start gap-4 rounded-xl p-6 transition-colors hover:border-primary/40"
                >
                  <div className="layer-2 layer-tint-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-display font-semibold text-foreground">
                      {capability.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {capability.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </SectionReveal>
        </section>

        <section className="mb-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="apple-section-title mb-4 text-3xl">Our team.</h2>
            <p className="apple-section-copy">
              You deal with the family directly — no account layers between you and the people who build the work.
            </p>
          </div>

          <SectionReveal className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="layer-1 overflow-hidden rounded-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-[3/4]">
                  <CmsImage
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.detail}
                  </p>
                  <a
                    href={`tel:${member.tel}`}
                    className="mt-4 inline-flex text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {member.phone}
                  </a>
                </div>
              </div>
            ))}
          </SectionReveal>
        </section>

        <section className="layer-1 rounded-2xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-display font-semibold text-foreground md:text-3xl">
            Planning a kitchen, lab, or facility fit-out?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground">
            Send us your drawings or requirements and we will come back with specifications and a
            quote — the same way we have for three generations of clients.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Request a quote
            </Link>
            <a
              href="tel:+922135121145"
              className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary"
            >
              +92-21-35121145-46
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

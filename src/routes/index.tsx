import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Scale, Clock, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { CATS, Counter, Img } from "@/components/shared";
import { useApp } from "@/store/app";
import type { Category } from "@/data/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusSphere — Open campus spaces & free community programs" },
      { name: "description", content: "Book underused college labs, halls and equipment, and join free study, career, skill, health and government scheme programs." },
      { property: "og:title", content: "CampusSphere — Our campus, open to everyone" },
      { property: "og:description", content: "Book labs, halls and equipment. Join free community programs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const resources = useApp((s) => s.resources);
  return (
    <div className="bg-hero">
      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-16 pt-12 lg:grid-cols-2 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-soft">
            <span className="h-2 w-2 rounded-full bg-teal" /> St. Xavier's College · Community Access
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Our campus, <span className="bg-brand bg-clip-text text-transparent">open to everyone.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Book labs, halls and equipment that would otherwise sit empty. Join free study spaces, career talks, skill workshops, health camps and scheme help — run by our community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl"><Link to="/login">Get started <ArrowRight /></Link></Button>
            <Button asChild variant="outline" size="xl"><Link to="/programs">See free programs</Link></Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[{ v: 4280, l: "hours unlocked" }, { v: 1960, l: "people served" }, { v: 820, l: "volunteer hours" }].map((x) => (
              <div key={x.l}><dt className="sr-only">{x.l}</dt><dd className="font-display text-2xl font-bold"><Counter value={x.v} />+</dd><div className="text-xs text-muted-foreground">{x.l}</div></div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <img src={hero} alt="Students, volunteers and neighbours using the college campus together" className="aspect-[3/2] w-full rounded-3xl object-cover shadow-lift" />
          <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-lift">
            <ShieldCheck className="h-8 w-8 text-st-approved" />
            <div className="text-sm"><div className="font-semibold">Verified & fair</div><div className="text-muted-foreground">Every decision explained</div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12">
        <h2 className="text-2xl font-bold">Free community programs</h2>
        <p className="mt-1 text-muted-foreground">Running inside our own halls and labs.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(CATS) as Category[]).map((k) => {
            const c = CATS[k];
            return (
              <Link key={k} to={c.to} className={`lift rounded-2xl border ${c.ring} ${c.bg} p-5`}>
                <c.icon className={`h-7 w-7 ${c.text}`} aria-hidden />
                <div className="mt-4 font-semibold">{c.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.blurb}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="flex items-end justify-between">
          <div><h2 className="text-2xl font-bold">Spaces & equipment</h2><p className="mt-1 text-muted-foreground">{resources.length} resources you can request today.</p></div>
          <Button asChild variant="ghost"><Link to="/discover">Browse all <ArrowRight /></Link></Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resources.slice(0, 4).map((r) => (
            <Link key={r.id} to="/resources/$id" params={{ id: r.id }} className="lift overflow-hidden rounded-2xl border bg-card">
              <Img src={r.image} alt={r.name} className="aspect-[4/3] w-full" />
              <div className="p-4"><div className="font-semibold">{r.name}</div><div className="text-sm text-muted-foreground">{r.location}</div></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-8">
        <div className="grid gap-4 rounded-3xl border bg-card p-8 shadow-soft md:grid-cols-3">
          {[
            { i: ShieldCheck, t: "Verify once", b: "College email or phone + ID. Takes two minutes." },
            { i: Scale, t: "Fair-Share Score", b: "Limited slots go to those who've had less, with reasons shown." },
            { i: Clock, t: "Transparent waiting lists", b: "See your position and why — no guessing." },
          ].map((x) => (
            <div key={x.t} className="flex gap-4"><x.i className="h-7 w-7 shrink-0 text-teal" /><div><div className="font-semibold">{x.t}</div><div className="text-sm text-muted-foreground">{x.b}</div></div></div>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Users className="h-4 w-4" /> All people and data shown are fictional.</p>
      </section>
    </div>
  );
}

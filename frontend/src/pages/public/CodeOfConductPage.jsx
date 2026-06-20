/**
 * CodeOfConductPage — /code-of-conduct
 * The agreement that keeps a batch a safe space. Badlaav voice.
 */
import { Seo } from '../../components/ui/Seo.jsx';

export default function CodeOfConductPage() {
  return (
    <>
      <Seo
        title="Code of Conduct — Badlaav"
        description="What keeps a Badlaav batch a safe space: confidentiality, respect, and a shared commitment to the work."
      />

      <section className="bg-cream py-[var(--section-y)] px-[var(--section-x)]">
        <div className="max-w-narrow mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-3">Legal</p>
          <h1 className="font-display font-semibold text-ink mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Code of Conduct
          </h1>
          <p className="font-mono text-xs text-muted mb-12">Badlaav · Last updated June 2026</p>

          <div className="space-y-8 font-sans text-charcoal leading-body">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Why this exists</h2>
              <p>Real work only happens when people feel safe. This is the agreement that makes a Badlaav batch a place you can be honest in — for you and for everyone in the room.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Confidentiality</h2>
              <p>What is shared in the room stays in the room. You may carry your own learnings home; you may not repeat another participant’s story, name, or struggle outside the batch.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Respect</h2>
              <p>Listen without judging. Disagree without diminishing. No participant is treated differently because of background, belief, gender, or where they are in life.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Presence</h2>
              <p>Phones stay away during sessions. You arrive on time, you stay for the work, and you give the room your full attention — that is the whole point of coming.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">What is not acceptable</h2>
              <p>Harassment, intimidation, recording others without consent, intoxication during sessions, or any behaviour that makes the space unsafe. Any of these ends your participation, without refund.</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink mb-3">Raising a concern</h2>
              <p>If something feels wrong, tell Arjun or a volunteer at any time, or write to us afterwards. Every concern is taken seriously and handled discreetly.</p>
              <p className="mt-3"><a href="mailto:iambadlaav@gmail.com" className="text-teal underline">iambadlaav@gmail.com</a> · 7409339740</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

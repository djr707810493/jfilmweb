import { IntroPortrait } from "@/components/home/intro-portrait";
import { introContent } from "@/data/homepage";

export function IntroSection() {
  return (
    <section className="section-y-compact border-b border-taupe/40">
      <div className="container-editorial grid grid-cols-5 items-start gap-5 md:gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="col-span-3 flex flex-col justify-center md:col-span-5 lg:col-span-5 lg:col-start-2">
          <p className="label-editorial">{introContent.label}</p>
          <h2 className="font-display mt-2 text-[clamp(1.375rem,4.5vw,2.75rem)] leading-snug text-soft-black md:mt-6">
            {introContent.heading}
          </h2>
          <div className="mt-3 space-y-3 text-[0.8125rem] leading-relaxed text-soft-black-muted md:mt-8 md:space-y-5 md:text-base">
            {introContent.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="col-span-2 md:col-span-5 lg:col-span-4 lg:col-start-8">
          <IntroPortrait />
        </div>
      </div>
    </section>
  );
}

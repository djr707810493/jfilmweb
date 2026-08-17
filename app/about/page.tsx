import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { placeholderImages } from "@/data/images";
import { introContent } from "@/data/homepage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About J FILM STUDIO | Utah Wedding Photographer",
  description:
    "Meet Jeffery D, founder and lead photographer at J FILM STUDIO. Learn about our philosophy, our Sony Alpha gear, and our approach to documentary wedding photography in Utah.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article>
      {/* Hero Section */}
      <section className="container-editorial section-y border-b border-taupe/30">
        <h1 className="label-editorial mb-4">About J FILM STUDIO | Utah Wedding Photographer</h1>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,5vw,4rem)] leading-tight text-soft-black">
          {introContent.heading}
        </h2>

        {/* Stats & Trust Signals */}
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-taupe/30 pt-12 md:grid-cols-4 lg:mt-16 lg:pt-16">
          <div>
            <p className="font-display text-4xl text-soft-black lg:text-5xl">12</p>
            <p className="label-editorial mt-2 text-taupe">Years of Experience</p>
          </div>
          <div>
            <p className="font-display text-4xl text-soft-black lg:text-5xl">200+</p>
            <p className="label-editorial mt-2 text-taupe">Weddings Documented</p>
          </div>
          <div className="col-span-2 flex flex-col justify-center border-l border-taupe/30 pl-8 md:col-span-2 lg:pl-12">
            <p className="label-editorial mb-3 text-taupe">Trusted Vendor On</p>
            <div className="flex flex-wrap items-center gap-6 opacity-80 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              <span className="font-display text-xl tracking-wider text-soft-black">Bark</span>
              <span className="text-xl font-bold tracking-tight text-soft-black">The Knot</span>
              <span className="font-serif text-xl italic text-soft-black">WeddingWire</span>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / Intro */}
      <section className="container-editorial section-y grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-taupe/10">
          <SiteImage
            src={placeholderImages.founderJeffery}
            alt="Jeffery D, Founder and Lead Photographer/Cinematographer at J FILM STUDIO"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="label-editorial mb-6 text-taupe">Meet the Founder</p>
          <h2 className="font-display mb-6 text-3xl text-soft-black md:text-4xl">
            Jeffery D
          </h2>
          <div className="space-y-6 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
            <p className="font-medium text-soft-black">
              Founder, Lead Photographer & Cinematographer
            </p>
            {introContent.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            <p>
              As the leader of our photography and cinematography team, my goal is not to stage your day, but to observe it beautifully. We guide gently when needed, allowing you to be present with each other and your guests. The result is a collection of images that feels authentic, evocative, and enduring.
            </p>
          </div>
        </div>
      </section>

      {/* Equipment / Studio Overview */}
      <section className="border-y border-taupe/30 bg-ivory-dark">
        <div className="container-editorial section-y">
          <div className="mx-auto mb-16 max-w-3xl text-center md:mb-24">
            <p className="label-editorial mb-6 text-taupe">Our Gear & Studio</p>
            <h2 className="font-display mb-6 text-3xl text-soft-black md:text-5xl">
              Precision & Craft
            </h2>
            <p className="text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-lg">
              We operate a fully hybrid studio, utilizing top-tier equipment designed for both breathtaking photography and cinematic videography. Our gear never gets in the way of the story; it simply ensures every detail is captured with uncompromising quality.
            </p>
          </div>

          <div className="grid gap-16 md:gap-24 lg:gap-32">
            {/* Block 1: Camera System */}
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-taupe/10">
                <SiteImage
                  src={placeholderImages.photographyGear}
                  alt="Sony Alpha cameras and flashes flatlay"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
              <div>
                <h3 className="font-display mb-4 text-2xl text-soft-black md:text-3xl">
                  Sony Alpha System
                </h3>
                <div className="space-y-4 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
                  <p>
                    We exclusively shoot with professional <strong>Sony Alpha series</strong> mirrorless cameras. This state-of-the-art system provides unparalleled autofocus precision, incredible low-light performance, and breathtaking color science for both stills and motion.
                  </p>
                  <p>
                    We carry backup bodies and dual-slot memory cards to every event, ensuring your memories are securely preserved from the moment they are captured.
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2: Lenses */}
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className="order-2 md:order-1">
                <h3 className="font-display mb-4 text-2xl text-soft-black md:text-3xl">
                  G-Master Optics
                </h3>
                <div className="space-y-4 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
                  <p>
                    Paired with premium <strong>Sony G-Master prime lenses</strong>, our gear ensures every frame is razor-sharp, with beautiful bokeh and rich contrast.
                  </p>
                  <p>
                    From wide environmental storytelling to intimate portrait compression, our curated lens selection allows us to adapt to any lighting condition—whether we're shooting high-speed reception motion or intimate candlelit vows.
                  </p>
                </div>
              </div>
              <div className="relative order-1 aspect-[4/3] w-full overflow-hidden bg-taupe/10 md:order-2">
                <SiteImage
                  src={placeholderImages.sonyGMaster}
                  alt="Sony G-Master prime lenses"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Block 3: Cinema, Drone & Audio */}
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-taupe/10">
                <SiteImage
                  src={placeholderImages.cinemaRig}
                  alt="Professional cinema rig for wedding videography"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
              <div>
                <h3 className="font-display mb-4 text-2xl text-soft-black md:text-3xl">
                  Cinema, Aerials & Audio
                </h3>
                <div className="space-y-4 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
                  <p>
                    For our films, we build our cameras into dedicated cinema rigs, ensuring stable, cinematic movement. We integrate <strong>professional audio equipment</strong> (lavalier mics and standalone recorders) to capture your vows and toasts with crystal clarity.
                  </p>
                  <p>
                    To capture the grand scale of your venue, we fly the <strong>DJI Mavic 4 Pro</strong> drone, providing breathtaking aerial perspectives. As the sun sets, our professional off-camera lighting setups guarantee vibrant, energetic reception coverage.
                  </p>
                </div>
              </div>
            </div>

            {/* Block 4: Studio Editing */}
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <div className="order-2 md:order-1">
                <h3 className="font-display mb-4 text-2xl text-soft-black md:text-3xl">
                  Professional Post-Production
                </h3>
                <div className="space-y-4 text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
                  <p>
                    The capture is only half the process. Our dedicated editing studio is built around color-calibrated monitors and powerful workstations to process high-resolution RAW files and 4K 10-bit video.
                  </p>
                  <p>
                    This controlled environment ensures our signature true-to-color editorial grading is consistent across every single frame and film, resulting in a timeless, heirloom-quality gallery.
                  </p>
                </div>
              </div>
              <div className="relative order-1 aspect-[4/3] w-full overflow-hidden bg-taupe/10 md:order-2">
                <SiteImage
                  src={placeholderImages.editingStudio}
                  alt="Professional color-calibrated editing studio"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container-editorial section-y text-center">
        <h2 className="font-display mb-6 text-3xl text-soft-black md:text-4xl lg:text-5xl">
          Ready to tell your story?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-[0.9375rem] leading-relaxed text-soft-black-muted md:text-base">
          We would love to hear about your vision for your wedding day. Let's create something beautiful together.
        </p>
        <Link
          href="/#contact"
          className="label-editorial inline-flex items-center justify-center border border-soft-black bg-soft-black px-8 py-4 text-ivory transition-colors hover:bg-soft-black/90"
        >
          Inquire Now
        </Link>
      </section>
    </article>
  );
}

"use client";

import { useSearchParams } from "next/navigation";

type ContactIntro = {
  label: string;
  heading: string;
  body: string;
};

export const defaultContactIntro: ContactIntro = {
  label: "Inquire",
  heading: "Contact Your Utah Wedding Photographer",
  body: "Share your date, location, and vision. We accept a limited number of weddings each year.",
};

const intros: Record<string, ContactIntro> = {
  "ai-film": {
    label: "Start Your AI Film",
    heading: "Tell us about your AI Film",
    body: "Send the photos you're thinking about — or just the moment you wish you had. We'll reply with a package, a timeline, and an honest read on what's possible.",
  },
};

export function ContactIntroCopy({
  intro = defaultContactIntro,
}: {
  intro?: ContactIntro;
}) {
  const requested = useSearchParams().get("service");
  const active = (requested && intros[requested]) || intro;

  return (
    <>
      <p className="label-editorial">{active.label}</p>
      <h1 className="font-display mt-4 text-4xl text-soft-black lg:text-5xl">
        {active.heading}
      </h1>
      <p className="mt-6 text-soft-black-muted">{active.body}</p>
    </>
  );
}

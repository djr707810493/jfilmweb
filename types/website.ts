export type HeroButtonStyle = "primary" | "secondary";

export type HeroButton = {
  id: string;
  label: string;
  href: string;
  style: HeroButtonStyle;
};

export type HeroCopy = {
  label: string;
  headline: string;
  body: string;
  buttons: HeroButton[];
};

export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  copy: HeroCopy;
};

export type HeroSettings = {
  slides: HeroSlide[];
};

export type IntroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type HeroCarouselSettings = {
  slides: HeroSlide[];
  intervalMs: number;
};

export type CoverageVideo = {
  src: string;
  poster: string;
  title: string;
};

export type AiFilmVideo = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  duration: string;
  poster: string;
  alt: string;
  src: string;
};

export type AiFilmShowcaseSettings = {
  films: AiFilmVideo[];
};

/**
 * Homepage Featured Gallery — fully static, independent of portfolio data.
 * Photos live in /public/images/placeholders/ (178* files).
 * To change order or swap photos, edit this list only.
 */

export type FeaturedPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const P = "/images/placeholders";

export const featuredGalleryPhotos: FeaturedPhoto[] = [
  { src: `${P}/1782283744556-A7409514.webp`, alt: "Editorial wedding portrait", width: 1600, height: 2400 },
  { src: `${P}/1782286377803-DJI_20250906112523_0125_D.webp`, alt: "Aerial wedding landscape", width: 2400, height: 1829 },
  { src: `${P}/1782284273977-A7400797.webp`, alt: "Bride and groom portrait", width: 1600, height: 2400 },
  { src: `${P}/1782286397186-DSC04861.webp`, alt: "Wedding celebration outdoors", width: 2400, height: 1600 },
  { src: `${P}/1782370861098-DSC04562.webp`, alt: "Ceremony portrait", width: 1600, height: 2400 },
  { src: `${P}/1782280164726-7_22___2__5_.webp`, alt: "Couple in evening light", width: 2400, height: 1350 },
  { src: `${P}/1782398045919-jeffd_jfilmstudio_1756179672_3707426259781873334_4744126217.jpg`, alt: "Bridal details", width: 1440, height: 1919 },
  { src: `${P}/1782285884347-A7407576.webp`, alt: "Golden hour portrait", width: 1600, height: 2400 },
  { src: `${P}/1782398254674-jeffd_jfilmstudio_1752775655_3678871295619288591_4744126217.jpg`, alt: "Desert elopement at sunset", width: 1440, height: 960 },
  { src: `${P}/1782370879299-DSC07642.webp`, alt: "Bride portrait", width: 1600, height: 2400 },
  { src: `${P}/1782280241082-7_22___2__1_.webp`, alt: "Couple walking in desert light", width: 2400, height: 1350 },
  { src: `${P}/1782398060369-jeffd_jfilmstudio_1756179672_3707426259882475830_4744126217.jpg`, alt: "Editorial bridal portrait", width: 1440, height: 1911 },
  { src: `${P}/1782370882727-DSC07733.webp`, alt: "Ceremony moment", width: 1600, height: 2400 },
  { src: `${P}/1782280153832-7_22___2__21_.webp`, alt: "Reception under evening lights", width: 2400, height: 1350 },
  { src: `${P}/1782398220150-jeffd_jfilmstudio_1752775152_3678867080820581018_4744126217.jpg`, alt: "Ceremony aisle", width: 1440, height: 1920 },
  { src: `${P}/1782280179311-7_22___2__2_.webp`, alt: "Wedding day moment", width: 2400, height: 1350 },
  { src: `${P}/1782398203369-jeffd_jfilmstudio_1750918531_3663292609032484333_4744126217.jpg`, alt: "Portrait on film", width: 1440, height: 1919 },
  { src: `${P}/1782280159574-7_22___2__17_.webp`, alt: "Candid celebration", width: 2348, height: 1321 },
  { src: `${P}/1782398263414-jeffd_jfilmstudio_1752775655_3678871295636043193_4744126217.jpg`, alt: "Reception celebration", width: 1440, height: 960 },
  { src: `${P}/1782280256468-7_22___2__16_.webp`, alt: "Couple under wide sky", width: 2400, height: 1350 },
  { src: `${P}/1782398210571-jeffd_jfilmstudio_1750918531_3663292609108050259_4744126217.jpg`, alt: "Film portrait", width: 1440, height: 1920 },
  { src: `${P}/1782280238998-7_22___2__18_.webp`, alt: "Canyon landscape", width: 2343, height: 1318 },
  { src: `${P}/1782398233008-jeffd_jfilmstudio_1752775152_3678867080820770674_4744126217.webp`, alt: "Processional moment", width: 1440, height: 1919 },
  { src: `${P}/1782280183997-7_22___2__20_.webp`, alt: "Aisle toward mountain vows", width: 2400, height: 1350 },
  { src: `${P}/1782398067822-jeffd_jfilmstudio_1756220511_3707768840860482382_4744126217.jpg`, alt: "Bridal daylight details", width: 1440, height: 1919 },
  { src: `${P}/1782398258627-jeffd_jfilmstudio_1752775655_3678871295619354083_4744126217.jpg`, alt: "Elopement embrace", width: 1440, height: 960 },
  { src: `${P}/1782280222513-7_22___2__23_.webp`, alt: "Film camera detail", width: 1080, height: 1440 },
  { src: `${P}/1782398240536-jeffd_jfilmstudio_1752775152_3678867080904557223_4744126217.webp`, alt: "Ceremony golden hour", width: 1440, height: 1919 },
];

type SeoJsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function SeoJsonLd({ data }: SeoJsonLdProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

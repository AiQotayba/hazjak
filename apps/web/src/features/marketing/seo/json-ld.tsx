type JsonLdGraph = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data }: { data: JsonLdGraph }) {
  const graph = Array.isArray(data) ? data : [data];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

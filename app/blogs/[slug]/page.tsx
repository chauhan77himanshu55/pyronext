import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "../../components/ScrollReveal";
import BlogRenderer from "../../components/BlogRenderer";
import blogsData from "../../data/blogs.json";
import type { BlogPost, ContentBlock } from "../../data/types";
import { breadcrumbSchema, faqSchema, ORG_ID, SITE_LOGO, SITE_URL, WEBSITE_ID } from "../../utils/schema";
import { extractFaqFromBlocks } from "../../utils/faq";

const blogs = blogsData as BlogPost[];

// Pre-generate all blog slug pages at build time
export function generateStaticParams() {
  return blogs.map((post) => ({ slug: post.slug }));
}

// Generate per-post metadata from JSON
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) return {};
  const heroImage = post.content.find((block) => block.type === "image");
  const socialImage = heroImage?.src ?? "/logo.png";
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.metaKeywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blogs/${post.slug}`,
      title: post.title,
      description: post.metaDescription,
      publishedTime: post.dateISO,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: socialImage, alt: heroImage?.alt ?? "Pyronite" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: [socialImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);

  if (!post) return notFound();

  const firstImage = post.content.find(
    (b): b is Extract<ContentBlock, { type: "image" }> => b.type === "image"
  );
  const postUrl = `${SITE_URL}/blogs/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.metaDescription,
    image: firstImage ? `${SITE_URL}${firstImage.src}` : SITE_LOGO,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    proficiencyLevel: "Expert",
    dependencies: post.tags.join(", "),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    keywords: post.tags.join(", "),
    url: postUrl,
    mainEntityOfPage: postUrl,
    isPartOf: { "@id": WEBSITE_ID },
  };

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
    { name: post.title, url: `/blogs/${post.slug}` },
  ]);

  const faqItems = extractFaqFromBlocks(post.content);
  const faq = faqItems.length > 0 ? faqSchema(faqItems) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
      <ScrollReveal />
      <section className="section" style={{ paddingTop: "4rem" }}>
        <div className="blog-container">
          {/* Back link */}
          <Link
            href="/blogs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              marginBottom: "2rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              textTransform: "uppercase",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "1rem",
                border: "1px solid var(--border-light)",
                padding: 4,
              }}
            >
              arrow_back
            </span>
            Back to Blogs
          </Link>

          {/* Header */}
          <div className="blog-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <span className="label" style={{ marginBottom: 0 }}>
                {post.date} / {post.category} / {post.readTime}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Pyronite Author"
                  width={32}
                  height={32}
                  style={{
                    border: "1px solid var(--border-light)",
                    objectFit: "contain",
                    padding: 4,
                    background: "#000",
                  }}
                  priority
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "#fff",
                    textTransform: "uppercase",
                  }}
                >
                  {post.author}
                </span>
              </div>
            </div>
            <h1>{post.title}</h1>

            {/* Tags */}
            <div className="project-tags" style={{ marginTop: "1.5rem" }}>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Content rendered from JSON blocks */}
          <BlogRenderer blocks={post.content} />
        </div>
      </section>
    </>
  );
}

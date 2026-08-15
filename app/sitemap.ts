import type { MetadataRoute } from "next";
import { getPosts } from "@/app/lib/getPosts";
import { projects } from "@/app/data/projects";


import { siteConfig } from "@/app/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.seo.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.seo.url}/journey`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.seo.url}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.seo.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.seo.url}/certifications`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
     url: `${siteConfig.seo.url}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const postRoutes: MetadataRoute.Sitemap = getPosts().map((post) => {
    const parsedDate = Date.parse(post.date);

    return {
      url: `${siteConfig.seo.url}${post.href}`,
      lastModified: Number.isNaN(parsedDate) ? now : new Date(parsedDate),
      changeFrequency: "yearly",
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

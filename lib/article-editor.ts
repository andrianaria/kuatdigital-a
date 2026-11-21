import { asc, eq } from "drizzle-orm";

import { database } from "@/db";
import { educationCategories, educationContents } from "@/db/schema";

export type ArticleEditorValue = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  videoUrl: string;
  attachments: string[];
  format: string;
  level: string;
  durationMinutes: number;
  access: "FREE" | "MEMBER" | "PREMIUM";
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
};

export async function getArticleEditorData(id?: number) {
  const db = database();
  const [categories, article] = await Promise.all([
    db.select({ name: educationCategories.name }).from(educationCategories).orderBy(asc(educationCategories.name)),
    id
      ? db
          .select({
            id: educationContents.id,
            title: educationContents.title,
            slug: educationContents.slug,
            category: educationCategories.name,
            excerpt: educationContents.excerpt,
            body: educationContents.body,
            coverImageUrl: educationContents.coverImageUrl,
            videoUrl: educationContents.videoUrl,
            attachments: educationContents.attachments,
            format: educationContents.format,
            level: educationContents.level,
            durationMinutes: educationContents.durationMinutes,
            access: educationContents.access,
            status: educationContents.status,
          })
          .from(educationContents)
          .leftJoin(educationCategories, eq(educationContents.categoryId, educationCategories.id))
          .where(eq(educationContents.id, id))
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  const value: ArticleEditorValue = article
    ? {
        id: String(article.id),
        title: article.title,
        slug: article.slug,
        category: article.category ?? "Bisnis UMKM",
        excerpt: article.excerpt ?? "",
        body: article.body ?? "",
        coverImageUrl: article.coverImageUrl ?? "",
        videoUrl: article.videoUrl ?? "",
        attachments: Array.isArray(article.attachments)
          ? article.attachments.filter((item): item is string => typeof item === "string")
          : [],
        format: article.format ?? "Artikel",
        level: article.level ?? "Pemula",
        durationMinutes: article.durationMinutes,
        access: article.access ?? "MEMBER",
        status: article.status,
      }
    : {
        id: null,
        title: "",
        slug: "",
        category: "Bisnis UMKM",
        excerpt: "",
        body: "",
        coverImageUrl: "",
        videoUrl: "",
        attachments: [],
        format: "Artikel",
        level: "Pemula",
        durationMinutes: 8,
        access: "MEMBER",
        status: "DRAFT",
      };

  return { value, categories: categories.map((category) => category.name) };
}

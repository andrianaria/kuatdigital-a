import type { Metadata } from "next";

import ArticleEditor from "@/components/ArticleEditor";
import { getArticleEditorData } from "@/lib/article-editor";
import { requireAdmin } from "@/lib/authz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Artikel Baru | KUAT Digital Admin" };

export default async function NewArticlePage() {
  await requireAdmin();
  const data = await getArticleEditorData();
  return <ArticleEditor initialValue={data.value} categories={data.categories} />;
}

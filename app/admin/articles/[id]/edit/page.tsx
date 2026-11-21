import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleEditor from "@/components/ArticleEditor";
import { getArticleEditorData } from "@/lib/article-editor";
import { requireAdmin } from "@/lib/authz";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Artikel | KUAT Digital Admin" };

export default async function EditArticlePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isSafeInteger(articleId) || articleId <= 0) notFound();
  const data = await getArticleEditorData(articleId);
  if (!data.value.id) notFound();
  return <ArticleEditor initialValue={data.value} categories={data.categories} />;
}

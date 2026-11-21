"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Eye, FileText, Link2, Save, Send, Video } from "lucide-react";

import { saveArticleAction } from "@/app/actions";
import type { ArticleEditorValue } from "@/lib/article-editor";

type Props = {
  initialValue: ArticleEditorValue;
  categories: string[];
};

function videoEmbedUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) return value;
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (url.hostname.endsWith("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function EditorPreview({ value }: { value: ArticleEditorValue }) {
  const embedUrl = videoEmbedUrl(value.videoUrl);
  return (
    <article className="article-editor-preview">
      {value.coverImageUrl ? (
        <div className="article-editor-cover" style={{ backgroundImage: `url(${value.coverImageUrl})` }} role="img" aria-label={`Cover ${value.title || "artikel"}`} />
      ) : (
        <div className="article-editor-cover empty"><FileText /><span>Cover artikel</span></div>
      )}
      <span>{value.category || "Kategori"} · {value.access}</span>
      <h1>{value.title || "Judul artikel akan tampil di sini"}</h1>
      <p className="lead">{value.excerpt || "Ringkasan artikel akan tampil di sini."}</p>
      {embedUrl ? <iframe src={embedUrl} title={value.title || "Video artikel"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : null}
      <div className="article-editor-body-preview">
        {(value.body || "Mulai menulis isi artikel di panel sebelah kiri.").split(/\n+/).filter(Boolean).map((paragraph, index) => {
          if (paragraph.startsWith("## ")) return <h2 key={index}>{paragraph.slice(3)}</h2>;
          if (paragraph.startsWith("### ")) return <h3 key={index}>{paragraph.slice(4)}</h3>;
          if (paragraph.startsWith("- ")) return <p className="preview-list" key={index}>✓ {paragraph.slice(2)}</p>;
          return <p key={index}>{paragraph}</p>;
        })}
      </div>
    </article>
  );
}

export default function ArticleEditor({ initialValue, categories }: Props) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(true);
  const [value, setValue] = useState(initialValue);

  function update<K extends keyof ArticleEditorValue>(key: K, next: ArticleEditorValue[K]) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  function insertMarkup(prefix: string) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.body.slice(start, end) || "Tulis teks di sini";
    const next = `${value.body.slice(0, start)}${prefix}${selected}${value.body.slice(end)}`;
    update("body", next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }

  function submit(status: "DRAFT" | "PUBLISHED") {
    const form = new FormData();
    for (const [key, formValue] of Object.entries({ ...value, status })) {
      if (key === "attachments") form.set(key, (formValue as string[]).join("\n"));
      else form.set(key, formValue === null ? "" : String(formValue));
    }
    setNotice("");
    startTransition(async () => {
      try {
        const result = await saveArticleAction(form);
        setNotice(result.message);
        setValue((current) => ({ ...current, id: result.id, slug: result.slug, status }));
        if (!initialValue.id) router.replace(`/admin/articles/${result.id}/edit`);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Artikel belum berhasil disimpan.");
      }
    });
  }

  return (
    <main className="article-editor-page">
      <header className="article-editor-header">
        <div className="article-editor-brand">
          <Image src="/brand/kuat-logo-transparent.png" alt="KUAT" width={40} height={40} />
          <div><b>KUAT Digital</b><small>Article Studio</small></div>
        </div>
        <div className="article-editor-actions">
          <button className="button button-ghost" onClick={() => setPreview((current) => !current)}><Eye /> {preview ? "Tutup preview" : "Preview"}</button>
          <button className="button button-ghost" disabled={pending} onClick={() => submit("DRAFT")}><Save /> Simpan draft</button>
          <button className="button" disabled={pending} onClick={() => submit("PUBLISHED")}><Send /> Terbitkan</button>
        </div>
      </header>
      <div className={`article-editor-layout ${preview ? "with-preview" : ""}`}>
        <section className="article-editor-form">
          <Link href="/admin" className="article-editor-back"><ArrowLeft /> Kembali ke Admin</Link>
          <div className="article-editor-title-row">
            <div><span>{initialValue.id ? "Edit artikel" : "Artikel baru"}</span><h1>{initialValue.id ? "Perbarui konten" : "Tulis artikel baru"}</h1></div>
            <em>{value.status === "PUBLISHED" ? "Sudah terbit" : "Draft"}</em>
          </div>
          {notice ? <div className="admin-notice" role="status">{notice}</div> : null}
          <label className="article-field wide">Judul artikel<input value={value.title} onChange={(event) => update("title", event.target.value)} placeholder="Contoh: Cara Membuat Konten 30 Hari" /></label>
          <div className="article-field-grid">
            <label className="article-field">Kategori<input list="article-categories" value={value.category} onChange={(event) => update("category", event.target.value)} /><datalist id="article-categories">{categories.map((category) => <option value={category} key={category} />)}</datalist></label>
            <label className="article-field">Slug<input value={value.slug} onChange={(event) => update("slug", event.target.value)} placeholder="Otomatis dari judul" /></label>
            <label className="article-field">Format<select value={value.format} onChange={(event) => update("format", event.target.value)}><option>Artikel</option><option>Panduan</option><option>Checklist</option><option>Video</option><option>Template</option><option>Webinar</option></select></label>
            <label className="article-field">Level<select value={value.level} onChange={(event) => update("level", event.target.value)}><option>Pemula</option><option>Menengah</option><option>Lanjutan</option></select></label>
            <label className="article-field">Akses<select value={value.access} onChange={(event) => update("access", event.target.value as ArticleEditorValue["access"])}><option value="FREE">Gratis</option><option value="MEMBER">Member</option><option value="PREMIUM">Premium</option></select></label>
            <label className="article-field">Durasi baca (menit)<input type="number" min="1" max="600" value={value.durationMinutes} onChange={(event) => update("durationMinutes", Number(event.target.value))} /></label>
          </div>
          <label className="article-field wide">Ringkasan<textarea rows={3} value={value.excerpt} onChange={(event) => update("excerpt", event.target.value)} placeholder="Ringkasan singkat untuk kartu artikel dan SEO." /></label>
          <div className="article-body-editor">
            <div className="article-toolbar"><button type="button" onClick={() => insertMarkup("## ")}>H2</button><button type="button" onClick={() => insertMarkup("### ")}>H3</button><button type="button" onClick={() => insertMarkup("- ")}>• List</button></div>
            <textarea ref={bodyRef} value={value.body} onChange={(event) => update("body", event.target.value)} placeholder="Tulis isi artikel di sini. Gunakan H2, H3, dan list dari toolbar." />
          </div>
          <section className="article-media-fields">
            <div><Video /><span><b>Video</b><small>YouTube atau Vimeo</small></span></div>
            <label className="article-field wide">URL video<input type="url" value={value.videoUrl} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://youtube.com/watch?v=..." /></label>
            <div><Link2 /><span><b>Media & lampiran</b><small>Gunakan URL file yang dapat diakses publik</small></span></div>
            <label className="article-field wide">URL cover<input type="url" value={value.coverImageUrl} onChange={(event) => update("coverImageUrl", event.target.value)} placeholder="https://.../cover.jpg" /></label>
            <label className="article-field wide">URL lampiran, satu per baris<textarea rows={4} value={value.attachments.join("\n")} onChange={(event) => update("attachments", event.target.value.split(/\r?\n/))} placeholder="https://.../template.pdf" /></label>
          </section>
        </section>
        {preview ? <EditorPreview value={value} /> : null}
      </div>
    </main>
  );
}

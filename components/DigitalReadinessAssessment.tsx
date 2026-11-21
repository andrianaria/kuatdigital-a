"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, BarChart3, Check, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";

import { submitDigitalReadinessAction } from "@/app/actions";
import { readinessDimensions, readinessOptions, readinessQuestions, type ReadinessResult } from "@/lib/digital-readiness";

export default function DigitalReadinessAssessment({ authenticated }: { authenticated: boolean }) {
  const [started, setStarted] = useState(authenticated);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const question = readinessQuestions[step];

  function finish(form: HTMLFormElement) {
    const payload = new FormData(form);
    payload.set("businessName", businessName);
    payload.set("businessCategory", businessCategory);
    payload.set("answers", JSON.stringify(answers));
    setError("");
    startTransition(async () => {
      try {
        setResult(await submitDigitalReadinessAction(payload));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Hasil belum berhasil dibuat.");
      }
    });
  }

  return (
    <>
      <section className="readiness-hero">
        <div>
          <span className="eyebrow"><Sparkles /> AI Digital Readiness Check</span>
          <h1>Seberapa siap usahamu bertumbuh secara digital?</h1>
          <p>Jawab 8 pertanyaan singkat untuk mendapatkan skor, peta kekuatan, dan tiga langkah prioritas yang relevan.</p>
          <div className="readiness-facts"><span>± 3 menit</span><span>4 area bisnis</span><span>Hasil langsung</span></div>
          {!authenticated ? (
            <div className="button-row">
              <Link className="button" href="/register?redirect_url=%2Ftes-kesiapan-digital%2Fmulai">Daftar untuk mulai <ArrowRight /></Link>
              <Link className="button button-ghost" href="/tes-kesiapan-digital/mulai">Sudah punya akun / mulai tes</Link>
            </div>
          ) : null}
        </div>
        <div className="readiness-score-preview" aria-label="Contoh hasil kesiapan digital">
          <span>Contoh hasil</span><strong>72</strong><small>Siap Berkembang</small>
          {readinessDimensions.map((item, index) => <div key={item.id}><label>{item.label}</label><i><b style={{ width: `${[78, 66, 74, 58][index]}%` }} /></i></div>)}
        </div>
      </section>

      {!authenticated && (
        <section className="readiness-public-info">
          <div><LockKeyhole /><h2>Kenapa perlu daftar?</h2><p>Akun diperlukan agar hasil asesmen tersimpan dan dapat digunakan untuk rekomendasi materi serta layanan KUAT.</p></div>
          <div><BarChart3 /><h2>Apa yang dinilai?</h2><p>Kehadiran digital, penjualan, operasional, serta cara usaha menggunakan data untuk mengambil keputusan.</p></div>
          <div><Sparkles /><h2>Hasil yang didapat</h2><p>Skor 0–100, tingkat kesiapan, perbandingan empat dimensi, dan tiga prioritas berikutnya.</p></div>
        </section>
      )}

      {authenticated && started && !result && (
        <section className="readiness-test-shell">
          <form onSubmit={(event) => { event.preventDefault(); finish(event.currentTarget); }}>
            <div className="readiness-progress"><span>Pertanyaan {step + 1} dari {readinessQuestions.length}</span><i><b style={{ width: `${((step + 1) / readinessQuestions.length) * 100}%` }} /></i></div>
            {step === 0 && <div className="readiness-business"><label>Nama usaha<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} minLength={2} maxLength={180} required placeholder="Contoh: Demo Coffee Shop" /></label><label>Bidang usaha<input value={businessCategory} onChange={(event) => setBusinessCategory(event.target.value)} minLength={2} maxLength={120} required placeholder="Contoh: Kuliner" /></label></div>}
            <span className="eyebrow">{readinessDimensions.find((item) => item.id === question.dimension)?.label}</span>
            <h2>{question.question}</h2><p>{question.hint}</p>
            <div className="readiness-options">
              {readinessOptions.map((option, value) => <button type="button" className={answers[question.id] === value ? "selected" : ""} onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))} key={option}><span>{answers[question.id] === value ? <Check /> : value + 1}</span>{option}</button>)}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="readiness-controls"><button type="button" className="button button-ghost" disabled={step === 0 || pending} onClick={() => setStep((value) => value - 1)}>Kembali</button>{step < readinessQuestions.length - 1 ? <button type="button" className="button" disabled={answers[question.id] === undefined || (step === 0 && (businessName.trim().length < 2 || businessCategory.trim().length < 2))} onClick={() => setStep((value) => value + 1)}>Lanjut <ArrowRight /></button> : <button className="button" disabled={answers[question.id] === undefined || pending}>{pending ? "Menganalisis..." : "Lihat hasil"}</button>}</div>
          </form>
        </section>
      )}

      {result && (
        <section className="readiness-result">
          <div className="readiness-result-score"><span>Skor kesiapan digital</span><strong>{result.totalScore}</strong><b>{result.level}</b><p>{result.summary}</p></div>
          <div><span className="eyebrow">Peta kesiapan</span>{readinessDimensions.map((item) => <div className="readiness-result-bar" key={item.id}><label>{item.label}<b>{result.dimensionScores[item.id]}%</b></label><i><b style={{ width: `${result.dimensionScores[item.id]}%` }} /></i></div>)}</div>
          <div className="readiness-recommendations"><span className="eyebrow">3 langkah prioritas</span>{result.recommendations.map((item, index) => <article key={item}><span>0{index + 1}</span><p>{item}</p></article>)}</div>
          <div className="readiness-result-actions"><button className="button button-ghost" onClick={() => { setResult(null); setStarted(true); setStep(0); setAnswers({}); }}><RotateCcw /> Ulangi tes</button><Link className="button" href="/dashboard">Lihat dashboard <ArrowRight /></Link></div>
        </section>
      )}
    </>
  );
}

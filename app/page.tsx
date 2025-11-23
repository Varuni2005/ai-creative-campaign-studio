"use client";

import { useState } from "react";

// Small reusable copy button
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded border border-zinc-600 hover:bg-zinc-700"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // To support Regenerate
  const [lastPayload, setLastPayload] = useState<any | null>(null);
  const [regenerateTone, setRegenerateTone] = useState("Funny");

  const callApi = async (payload: any) => {
    const res = await fetch("/api/generate-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate");
    return data;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);

    const selectedPlatforms = formData.getAll("platforms") as string[];
    const platformString =
      selectedPlatforms.length > 0
        ? selectedPlatforms.join(", ")
        : "Instagram";

    const payload = {
      productName: (formData.get("productName") || "").toString(),
      description: (formData.get("description") || "").toString(),
      audience: (formData.get("audience") || "").toString(),
      platform: platformString,
      tone: (formData.get("tone") || "Friendly").toString(),
    };

    try {
      const data = await callApi(payload);
      setResult(data);
      setLastPayload(payload);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastPayload) return;
    setLoading(true);
    setError(null);

    const payload = {
      ...lastPayload,
      tone: regenerateTone,
    };

    try {
      const data = await callApi(payload);
      setResult(data);
      setLastPayload(payload);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">AI Creative Campaign Studio</h1>
        <p className="text-sm text-gray-400 mb-6">
          Enter product details and generate a full campaign using AI.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3 bg-zinc-900 border border-zinc-700 rounded-xl p-4"
        >
          <input
            name="productName"
            required
            placeholder="Product name (e.g., Organic Cold Brew Coffee)"
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-sm"
          />

          <textarea
            name="description"
            required
            rows={3}
            placeholder="Short description (what it is, key features, why it's special)"
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-sm"
          />

          <input
            name="audience"
            placeholder="Target audience (e.g., students, remote workers)"
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-sm"
          />

          <div className="grid md:grid-cols-2 gap-3">
            {/* MULTI-PLATFORM CHECKBOXES */}
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 mb-1">
                Platforms (select one or more):
              </p>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="platforms"
                  value="Instagram"
                  defaultChecked
                  className="accent-indigo-500"
                />
                Instagram
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="platforms"
                  value="LinkedIn"
                  className="accent-indigo-500"
                />
                LinkedIn
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="platforms"
                  value="Twitter"
                  className="accent-indigo-500"
                />
                Twitter
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="platforms"
                  value="WhatsApp Status"
                  className="accent-indigo-500"
                />
                WhatsApp Status
              </label>
            </div>

            {/* TONE SELECT */}
            <div>
              <p className="text-xs text-zinc-400 mb-1">Primary tone:</p>
              <select
                name="tone"
                className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-sm"
              >
                <option>Friendly</option>
                <option>Premium</option>
                <option>Funny</option>
                <option>Emotional</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Campaign"}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <p className="mt-4 text-red-400 text-sm bg-red-900/30 border border-red-700 p-3 rounded">
            {error}
          </p>
        )}

        {/* REGENERATE CONTROLS */}
        {result && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs text-zinc-400">
              Try a different tone:
            </span>
            <select
              value={regenerateTone}
              onChange={(e) => setRegenerateTone(e.target.value)}
              className="p-1 rounded bg-zinc-950 border border-zinc-700 text-xs"
            >
              <option value="Friendly">Friendly</option>
              <option value="Premium">Premium</option>
              <option value="Funny">Funny</option>
              <option value="Emotional">Emotional</option>
              <option value="Bold">Bold</option>
            </select>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="px-3 py-1 rounded bg-zinc-800 border border-zinc-600 text-xs font-semibold disabled:opacity-50"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        )}

        {/* RESULT SECTIONS WITH COPY BUTTONS */}
        {result && (
          <section className="mt-6 space-y-4">
            {/* Tagline */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Tagline</h2>
                <CopyButton text={result.tagline} />
              </div>
              <p className="text-sm text-zinc-100">{result.tagline}</p>
            </div>

            {/* Brand Story */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold">Brand Story</h2>
                <CopyButton text={result.brand_story} />
              </div>
              <p className="text-sm text-zinc-100 whitespace-pre-line">
                {result.brand_story}
              </p>
            </div>

            {/* Hooks + Hashtags */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">Hooks</h2>
                  <CopyButton
                    text={(result.hooks || []).join("\n")}
                  />
                </div>
                <ul className="text-sm text-zinc-100 list-disc list-inside space-y-1">
                  {(result.hooks || []).map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">Hashtags</h2>
                  <CopyButton
                    text={(result.hashtags || []).join(" ")}
                  />
                </div>
                <p className="text-sm text-zinc-100">
                  {(result.hashtags || []).join(" ")}
                </p>
              </div>
            </div>

            {/* Captions */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold">Captions</h2>
                <CopyButton
                  text={(result.captions || [])
                    .map((c: string, i: number) => `Caption ${i + 1}:\n${c}`)
                    .join("\n\n")}
                />
              </div>
              <div className="space-y-3 text-sm text-zinc-100">
                {(result.captions || []).map((c: string, i: number) => (
                  <div key={i}>
                    <p className="font-medium mb-1">
                      Caption {i + 1}
                    </p>
                    <p className="whitespace-pre-line">{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Translations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">Hindi Caption</h2>
                  <CopyButton text={result.translated_caption_hi} />
                </div>
                <p className="text-sm text-zinc-100 whitespace-pre-line">
                  {result.translated_caption_hi}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-semibold">Kannada Caption</h2>
                  <CopyButton text={result.translated_caption_kn} />
                </div>
                <p className="text-sm text-zinc-100 whitespace-pre-line">
                  {result.translated_caption_kn}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <p className="mt-10 text-xs text-zinc-500 text-center">
          Built by Varuni Y K · AI Builder Intern Assignment
        </p>
      </div>
    </main>
  );
}

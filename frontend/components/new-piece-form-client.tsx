"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getDictionary, Locale } from "../lib/i18n";

type NewPieceFormClientProps = {
  locale: Locale;
};

type CreatedPiece = {
  id: string;
};

export function NewPieceFormClient({ locale }: NewPieceFormClientProps) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [color, setColor] = useState("#157f6f");
  const [memo, setMemo] = useState("");
  const [scoreFile, setScoreFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      setErrorMessage(dict.newPiece.apiRequired);
      return;
    }

    if (!scoreFile) {
      setErrorMessage(dict.newPiece.fileRequired);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(dict.newPiece.saving);

      const createResponse = await fetch(`${apiBaseUrl}/pieces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          composer: composer.trim(),
          color,
          memo: memo.trim() || undefined,
        }),
      });

      if (!createResponse.ok) {
        const payload = (await createResponse.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail || dict.newPiece.saveFailed);
      }

      const piece = (await createResponse.json()) as CreatedPiece;

      setStatusMessage(dict.newPiece.uploadStarting);
      const formData = new FormData();
      formData.append("file", scoreFile);

      const uploadResponse = await fetch(`${apiBaseUrl}/pieces/${piece.id}/score`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail || dict.newPiece.saveFailed);
      }

      setStatusMessage(dict.newPiece.savedReady);
      router.push(`/pieces/${piece.id}#labeled-score`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : dict.newPiece.saveFailed);
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        {dict.newPiece.pieceTitle}
        <input
          type="text"
          placeholder={dict.newPiece.placeholderTitle}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>
      <label>
        {dict.newPiece.composer}
        <input
          type="text"
          placeholder={dict.newPiece.placeholderComposer}
          value={composer}
          onChange={(event) => setComposer(event.target.value)}
          required
        />
      </label>
      <label>
        {dict.newPiece.color}
        <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        <span className="field-help">{dict.newPiece.colorHelp}</span>
      </label>
      <label>
        {dict.newPiece.scoreFile}
        <input
          type="file"
          accept=".musicxml,.xml,.pdf,image/*"
          onChange={(event) => setScoreFile(event.target.files?.[0] ?? null)}
          required
        />
        <span className="field-help">{dict.newPiece.scoreHelp}</span>
      </label>
      <label className="full-span">
        {dict.newPiece.memo}
        <textarea
          rows={4}
          placeholder={dict.newPiece.placeholderMemo}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
      </label>
      <div className="action-row full-span">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? dict.newPiece.saving : dict.newPiece.save}
        </button>
        <button
          className="ghost-button"
          type="reset"
          disabled={isSubmitting}
          onClick={() => {
            setTitle("");
            setComposer("");
            setColor("#157f6f");
            setMemo("");
            setScoreFile(null);
            setStatusMessage(null);
            setErrorMessage(null);
          }}
        >
          {dict.newPiece.draft}
        </button>
      </div>
      {statusMessage ? <p className="inline-success full-span">{statusMessage}</p> : null}
      {errorMessage ? <p className="inline-error full-span">{errorMessage}</p> : null}
      <p className="support-copy full-span">{dict.newPiece.draftHelp}</p>
    </form>
  );
}

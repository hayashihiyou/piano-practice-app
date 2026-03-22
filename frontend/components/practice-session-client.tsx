"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PracticeScreenData } from "../lib/types";

type PracticeSessionClientProps = {
  data: PracticeScreenData;
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function PracticeSessionClient({ data }: PracticeSessionClientProps) {
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(Math.floor(data.session.durationSec));
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | File | null>(null);
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "stopped">("idle");
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const strictAnalysisBlocked = data.score.measures.some((measure) => measure.lowConfidence);

  useEffect(() => {
    if (!timerActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerActive]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  async function startRecording() {
    setRecordingError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("This browser does not expose microphone capture.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const nextUrl = URL.createObjectURL(blob);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(nextUrl);
        setAudioBlob(blob);
        setAudioFileName("live-take.webm");
        setRecordingState("stopped");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };

      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
    } catch (error) {
      console.error(error);
      setRecordingError("Microphone permission was denied or unavailable.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  return (
    <section className="practice-session-layout">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Session</p>
            <h2>{data.piece.title}</h2>
          </div>
          <span className="pill">Timer linked to piece</span>
        </div>
        <div className="timer-card modern">
          <strong className="timer-display">{formatDuration(elapsedSeconds)}</strong>
          <p className="support-copy">
            Keep this session tied to the selected piece so the dashboard can color-code totals later.
          </p>
          <div className="action-row">
            <button className="primary-button" type="button" onClick={() => setTimerActive(true)} disabled={timerActive}>
              Start timer
            </button>
            <button className="ghost-button" type="button" onClick={() => setTimerActive(false)} disabled={!timerActive}>
              Pause timer
            </button>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Capture</p>
            <h2>Record or upload</h2>
          </div>
          <span className="pill secondary">Post-take analysis</span>
        </div>
        <div className="upload-card">
          <div className="action-row">
            <button
              className="primary-button"
              type="button"
              onClick={recordingState === "recording" ? stopRecording : startRecording}
            >
              {recordingState === "recording" ? "Stop recording" : "Record with mic"}
            </button>
            <label className="ghost-button file-button">
              Upload file
              <input
                type="file"
                accept="audio/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                  }

                  setAudioUrl(URL.createObjectURL(file));
                  setAudioBlob(file);
                  setAudioFileName(file.name);
                }}
              />
            </label>
          </div>
          {recordingError ? <p className="inline-error">{recordingError}</p> : null}
          <p className="support-copy">
            Recording state: <strong>{recordingState}</strong>
          </p>
          {audioFileName ? (
            <div className="audio-preview">
              <span className="pill">{audioFileName}</span>
              {audioUrl ? <audio controls src={audioUrl} className="audio-player" /> : null}
            </div>
          ) : null}
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Next step</p>
            <h2>Send for analysis</h2>
          </div>
        </div>
        <ul className="plain-list">
          <li>Score title: {data.score.title}</li>
          <li>Base tempo: {data.score.baseTempo} BPM</li>
          <li>Measures ready: {data.score.measures.length}</li>
          <li>Low-confidence measures: {data.score.measures.filter((measure) => measure.lowConfidence).length}</li>
        </ul>
        <div className="action-row">
          <button
            className="primary-button"
            type="button"
            disabled={!audioFileName || !audioBlob || strictAnalysisBlocked || submissionState === "uploading"}
            onClick={async () => {
              if (!audioBlob) {
                return;
              }

              const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
              if (!apiBaseUrl) {
                setSubmissionState("error");
                setSubmissionMessage("Set NEXT_PUBLIC_API_BASE_URL to submit analysis jobs to the backend.");
                return;
              }

              try {
                setSubmissionState("uploading");
                setSubmissionMessage(null);
                const file =
                  audioBlob instanceof File
                    ? audioBlob
                    : new File([audioBlob], audioFileName ?? "live-take.webm", { type: audioBlob.type || "audio/webm" });
                const formData = new FormData();
                formData.append("pieceId", data.piece.id);
                formData.append("sessionId", data.session.id);
                formData.append("audioFile", file);

                const response = await fetch(`${apiBaseUrl}/analysis-jobs`, {
                  method: "POST",
                  body: formData,
                });

                if (!response.ok) {
                  const errorPayload = (await response.json().catch(() => null)) as { detail?: string } | null;
                  throw new Error(errorPayload?.detail || "Failed to create analysis job.");
                }

                const payload = (await response.json()) as {
                  job: { id: string };
                  result: { id: string };
                };
                setSubmissionState("done");
                setSubmissionMessage(`Created analysis job ${payload.job.id}. Open result ${payload.result.id} from the analysis screen.`);
              } catch (error) {
                console.error(error);
                setSubmissionState("error");
                setSubmissionMessage(error instanceof Error ? error.message : "Failed to submit analysis.");
              }
            }}
          >
            Queue analysis job
          </button>
          <Link className="ghost-button inline-link-button" href="/analysis/analysis-1">
            Open sample result
          </Link>
        </div>
        {submissionMessage ? (
          <p className={submissionState === "error" ? "inline-error" : "support-copy"}>{submissionMessage}</p>
        ) : null}
        {strictAnalysisBlocked ? (
          <p className="inline-error">Resolve low-confidence score measures before running strict analysis.</p>
        ) : null}
      </article>
    </section>
  );
}

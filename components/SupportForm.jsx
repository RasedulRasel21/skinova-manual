"use client";

import { useRef, useState } from "react";

const FIELD_ERRORS = {
  name: "Enter your name.",
  email: "Enter a valid email address.",
  store_url: "Enter your store URL.",
  subject: "Enter a subject.",
  message: "Describe the problem in a few words or more.",
  files: "Attach up to 3 images or PDFs, 4 MB in total.",
};

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-accent aria-[invalid=true]:border-[#b42318]";

function Field({ id, label, hint, error, children }) {
  return (
    <div className="grid content-start gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SupportForm({ themeName, fallbackEmail }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | unavailable
  const [errors, setErrors] = useState({});
  const [sentTo, setSentTo] = useState("");
  const formRef = useRef(null);
  const statusRef = useRef(null);

  const describedBy = (id, hint) =>
    [hint && `${id}-hint`, errors[id] && `${id}-error`].filter(Boolean).join(" ") || undefined;

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/support", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSentTo(String(data.get("email") || ""));
        setStatus("sent");
        form.reset();
      } else if (res.status === 400 && json.fields) {
        const next = {};
        for (const key of Object.keys(json.fields)) next[key] = FIELD_ERRORS[key] || "Check this field.";
        setErrors(next);
        setStatus("idle");
        form.querySelector(`[name="${Object.keys(json.fields)[0]}"]`)?.focus();
        return;
      } else {
        setStatus(res.status === 503 ? "unavailable" : "error");
      }
    } catch {
      setStatus("error");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-line bg-paper p-8 outline-none">
        <p className="label text-muted">Request received</p>
        <p className="mt-3 text-2xl font-black tracking-tight">Thanks, we&apos;re on it.</p>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted-strong">
          A confirmation is on its way to {sentTo || "your inbox"}. We&apos;ll reply to that address.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full border border-foreground px-5 py-2.5 text-sm font-bold transition-colors hover:bg-tint"
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6" encType="multipart/form-data">
      {(status === "error" || status === "unavailable") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-xl border border-[#b42318] bg-paper p-4 text-[15px] outline-none">
          {status === "unavailable"
            ? "The support form isn't available right now."
            : "Your request couldn't be sent. Try again in a moment."}
          {fallbackEmail && (
            <>
              {" "}
              You can also email{" "}
              <a href={`mailto:${fallbackEmail}`} className="font-semibold underline underline-offset-4">
                {fallbackEmail}
              </a>
              .
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" name="name" type="text" autoComplete="name" required className={inputClass}
            aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass}
            aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="store_url" label="Store URL" hint="For example: http://www.storename.myshopify.com" error={errors.store_url}>
          <input id="store_url" name="store_url" type="url" inputMode="url" autoComplete="url" required
            placeholder="http://www.storename.myshopify.com" className={inputClass}
            aria-invalid={!!errors.store_url} aria-describedby={describedBy("store_url", true)} />
        </Field>
        <Field id="theme" label="Theme name">
          <select id="theme" name="theme" defaultValue={themeName} className={inputClass}>
            <option value={themeName}>{themeName}</option>
          </select>
        </Field>
      </div>

      <Field id="subject" label="Subject" hint="Used as the subject line of your email." error={errors.subject}>
        <input id="subject" name="subject" type="text" required maxLength={150} className={inputClass}
          aria-invalid={!!errors.subject} aria-describedby={describedBy("subject", true)} />
      </Field>

      <Field id="message" label="Description of the problem" hint="What happened, where, and what you expected instead." error={errors.message}>
        <textarea id="message" name="message" rows={7} required className={`${inputClass} resize-y`}
          aria-invalid={!!errors.message} aria-describedby={describedBy("message", true)} />
      </Field>

      <Field id="files" label="Screenshots (optional)" hint="Up to 3 images or PDFs, 4 MB in total." error={errors.files}>
        <input id="files" name="files" type="file" multiple accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
          className="block w-full text-sm text-muted-strong file:mr-4 file:rounded-full file:border file:border-foreground file:bg-transparent file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-foreground hover:file:bg-tint"
          aria-invalid={!!errors.files} aria-describedby={describedBy("files", true)} />
      </Field>

      {/* Spam trap: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send request"}
        </button>
        <p className="text-[13px] text-muted">You&apos;ll get an automatic confirmation by email.</p>
      </div>
    </form>
  );
}

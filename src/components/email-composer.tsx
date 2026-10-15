"use client";

import { useState } from "react";
import {
  Send,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function EmailComposer() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setStatus("");
    setError("");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to send email."
        );
      }

      setStatus("Email sent successfully!");
      setTo("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email-to"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Recipient Email
        </label>

        <input
          id="email-to"
          name="ledger-recipient"
          type="email"
          autoComplete="off"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder="recipient@example.com"
          maxLength={254}
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="email-subject"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Subject
        </label>

        <input
          id="email-subject"
          name="ledger-email-subject"
          type="text"
          autoComplete="new-password"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Enter email subject"
          maxLength={200}
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="email-message"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Message
        </label>

        <textarea
          id="email-message"
          name="ledger-email-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write your email message..."
          maxLength={10000}
          rows={6}
          required
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {status && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <CheckCircle size={18} />
          {status}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle size={18} />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Email
          </>
        )}
      </button>
    </form>
  );
}
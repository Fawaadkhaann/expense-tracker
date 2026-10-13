
import {
  BellRing,
  Check,
  Clock3,
  Mail,
  Send,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import { redirect } from "next/navigation";
import {
  createClient,
  hasSupabaseConfig,
} from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  if (!hasSupabaseConfig()) redirect("/");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <AppShell
      activePath="/notifications"
      email={user.email ?? ""}
    >
      <div className="mx-auto max-w-[1240px] space-y-7 pb-8">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted">
              <Mail size={14} />
              <span>COMMUNICATIONS</span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Email Center
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Manage email messages and prepare financial updates
              from one simple workspace.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-warm" />
            Email service not connected
          </div>
        </section>

        {/* Overview cards */}
        <section
          aria-label="Email overview"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <div className="ledger-card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Send size={19} />
            </div>

            <div>
              <p className="text-sm text-muted">Email delivery</p>
              <p className="mt-1 text-base font-semibold text-ink">
                Not configured
              </p>
              <p className="mt-1 text-xs text-muted">
                Provider setup required
              </p>
            </div>
          </div>

          <div className="ledger-card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Mail size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted">Account email</p>
              <p className="mt-1 truncate text-sm font-semibold text-ink">
                {user.email ?? "No email available"}
              </p>
              <p className="mt-1 text-xs text-muted">
                Signed-in account
              </p>
            </div>
          </div>

          <div className="ledger-card flex items-center gap-4 p-5 sm:col-span-2 xl:col-span-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-sm text-muted">Security</p>
              <p className="mt-1 text-base font-semibold text-ink">
                Server-side setup
              </p>
              <p className="mt-1 text-xs text-muted">
                Credentials must stay private
              </p>
            </div>
          </div>
        </section>

        {/* Composer and setup panel */}
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="ledger-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
                  <Mail size={19} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Compose an email
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Prepare a message for your recipient
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-warm" />
                Not sent
              </span>
            </div>

            <form className="space-y-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="recipient"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  To
                </label>

                <input
                  id="recipient"
                  name="recipient"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter recipient email address"
                  className="ledger-field"
                  disabled
                  aria-describedby="email-disabled-note"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-ink"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Enter a clear subject line"
                  className="ledger-field"
                  disabled
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-ink"
                  >
                    Message
                  </label>

                  <span className="text-xs text-muted">
                    Plain text
                  </span>
                </div>

                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  placeholder="Write your message here..."
                  className="ledger-field resize-y leading-6"
                  disabled
                />
              </div>

              <div
                id="email-disabled-note"
                className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4"
              >
                <BellRing
                  size={17}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div>
                  <p className="text-sm font-medium text-ink">
                    Email sending is not set up yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Connect an email provider and implement secure
                    server-side sending before enabling this form.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted">
                  Your message will not be sent from this page yet.
                </p>

                <button
                  type="button"
                  disabled
                  className="ledger-button w-full sm:w-auto"
                >
                  <Send size={15} />
                  Send email
                </button>
              </div>
            </form>
          </div>

          {/* Setup information */}
          <aside className="space-y-5">
            <div className="ledger-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-soft text-warm">
                  <Settings2 size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Email configuration
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Setup status
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock3
                    size={16}
                    className="mt-0.5 shrink-0 text-muted"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Provider connection
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      An email service such as Resend needs to be
                      configured.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-muted"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Secure delivery
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Store provider credentials in server-only
                      environment variables.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    Integration status
                  </span>
                  <span className="text-xs font-semibold text-warm">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-accent-soft/50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-accent">
                  <Check size={17} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Next steps
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Connect the provider, add a secure sending
                    endpoint, and test delivery before enabling
                    the composer.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Activity empty state */}
        <section className="ledger-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line px-5 py-5 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Clock3 size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">
                Email activity
              </h3>
              <p className="mt-1 text-xs text-muted">
                Review message history and delivery status
              </p>
            </div>
          </div>

          <div className="px-5 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas text-muted">
              <Mail size={20} />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-ink">
              No email activity yet
            </h4>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted">
              Sent messages and delivery records can appear here
              after email sending and activity tracking are implemented.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

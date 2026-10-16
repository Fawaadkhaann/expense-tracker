import {
  Check,
  Clock3,
  Mail,
  Send,
  ShieldCheck,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import {
  createClient,
  hasSupabaseConfig,
} from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import EmailComposer from "@/components/email-composer";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  if (!hasSupabaseConfig()) redirect("/");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load this user's email activity
  const {
    data: activities,
    error: activityError,
  } = await supabase
    .from("email_activity")
    .select("id, recipient, subject, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const emailActivities = activities ?? [];
  const totalSent = emailActivities.filter(
    (activity) => activity.status === "sent"
  ).length;

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
              Manage email messages and review your sent email history.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-success" />
            Email service connected
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
              <p className="text-sm text-muted">Emails sent</p>
              <p className="mt-1 text-base font-semibold text-ink">
                {totalSent}
              </p>
              <p className="mt-1 text-xs text-muted">
                Successfully sent and recorded
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
                Server-side sending
              </p>
              <p className="mt-1 text-xs text-muted">
                Provider credentials stay private
              </p>
            </div>
          </div>
        </section>

        {/* Email composer and setup panel */}
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="ledger-card overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
                  <Mail size={19} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-ink">
                    Compose an email
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Prepare a message for your recipient
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Ready to send
              </span>
            </div>

            <div className="p-5 sm:p-7">
              <EmailComposer />
            </div>
          </div>

          {/* Setup information */}
          <aside className="space-y-5">
            <div className="ledger-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Settings2 size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    Email configuration
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Integration status
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Provider connection
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Resend is configured and has sent a test email.
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
                      Provider credentials remain on the server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    Integration status
                  </span>
                  <span className="text-xs font-semibold text-success">
                    Configured
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
                    Email activity tracking
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted">
                    Sent email details are saved in your Supabase database.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Email activity history */}
        <section className="ledger-card overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Clock3 size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Email activity
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Your recently sent emails
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-line px-3 py-1.5 text-xs text-muted">
              {emailActivities.length}{" "}
              {emailActivities.length === 1 ? "record" : "records"}
            </span>
          </div>

          {activityError ? (
            <div className="px-5 py-10 text-center">
              <AlertCircle
                size={22}
                className="mx-auto text-danger"
              />
              <p className="mt-3 text-sm font-medium text-ink">
                Could not load email activity
              </p>
              <p className="mt-2 text-xs text-muted">
                Please refresh the page and try again.
              </p>
            </div>
          ) : emailActivities.length === 0 ? (
            <div className="px-5 py-10 text-center sm:py-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas text-muted">
                <Mail size={20} />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-ink">
                No email activity yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted">
                Send an email using the form above. Its activity will appear here when saved successfully.
              </p>
            </div>
          ) : (
            <div
              className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              role="region"
              aria-label="Email activity table"
              tabIndex={0}
            >
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/60">
                    <th className="px-5 py-3 text-xs font-medium text-muted sm:px-6">
                      Recipient
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted">
                      Subject
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-muted">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {emailActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-5 py-4 text-sm text-ink sm:px-6">
                        {activity.recipient}
                      </td>

                      <td className="max-w-[220px] truncate px-5 py-4 text-sm text-ink">
                        {activity.subject}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                          <Check size={13} />
                          {activity.status === "sent"
                            ? "Sent"
                            : activity.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">
                        {new Date(
                          activity.created_at
                        ).toLocaleString("en-PK", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
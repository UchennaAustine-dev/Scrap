"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { EmailConfig, EmailRecipient } from "@/lib/types";

export default function EmailPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([apiClient.getEmailConfig(), apiClient.listEmailRecipients()])
      .then(([cfg, recs]) => {
        setConfig(cfg);
        setRecipients(recs);
      })
      .catch((err: any) =>
        setError(err?.message || "Error fetching email data")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Email Configuration</h1>
      <p className="text-slate-400 text-sm mt-1">
        SMTP settings and alert recipients
      </p>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {config && (
        <div className="bg-slate-900 rounded-lg p-4 text-slate-300 mb-6">
          <div>
            <strong>SMTP Host:</strong> {config.smtp_host}
          </div>
          <div>
            <strong>SMTP Port:</strong> {config.smtp_port}
          </div>
          <div>
            <strong>SMTP User:</strong> {config.smtp_user}
          </div>
          <div>
            <strong>Use TLS:</strong> {config.use_tls ? "Yes" : "No"}
          </div>
          <div>
            <strong>From Email:</strong> {config.from_email}
          </div>
          {config.from_name && (
            <div>
              <strong>From Name:</strong> {config.from_name}
            </div>
          )}
        </div>
      )}
      {recipients.length > 0 ? (
        <ul className="space-y-2">
          {recipients.map((r) => (
            <li
              key={r.email}
              className="bg-slate-900 rounded-lg p-4 text-slate-300"
            >
              <div>
                <strong>Email:</strong> {r.email}
              </div>
              <div>
                <strong>Name:</strong> {r.name || "-"}
              </div>
              <div>
                <strong>Alerts Enabled:</strong>{" "}
                {r.alerts_enabled ? "Yes" : "No"}
              </div>
              <div>
                <strong>Alert Types:</strong> {r.alert_types.join(", ")}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No recipients found.</div>
      )}
    </div>
  );
}

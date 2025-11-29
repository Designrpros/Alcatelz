import fs from "fs";
import path from "path";
import React from "react";

export const metadata = {
  title: "Privacy — Mapr",
  description: "Privacy policy for Mapr: analytics-only data collection and deletion.",
};

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), "src", "app", "privacy", "analytics-data.txt");
  let analytics = "";
  try {
    analytics = fs.readFileSync(filePath, "utf8");
  } catch {
    analytics = "(analytics data not available)";
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Privacy Policy — Mapr</h1>

      <p>
        Mapr collects data solely for analytics purposes. The data we collect is used to
        improve the app, understand usage patterns, and measure performance. Collected
        analytics data is deleted from our systems — we do not use it for advertising or
        other profiling purposes.
      </p>

      <h2>Exactly what we collect</h2>
      <p>The following is the exact analytics data collected by Mapr (source code):</p>

      <div style={{ background: "#0b0b0b", color: "#e6e6e6", padding: 16, borderRadius: 6, overflowX: "auto" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          <code>{analytics}</code>
        </pre>
      </div>

      <h3 style={{ marginTop: 20 }}>Summary of collected fields</h3>
      <ul>
        <li>timestamp</li>
        <li>sessionDuration</li>
        <li>appVersion</li>
        <li>platform, deviceId (anonymous), osVersion, deviceModel</li>
        <li>locale</li>
        <li>location (if location permission granted)</li>
        <li>userId (from Sign in with Apple, if available)</li>
        <li>tabNumber, download/retention/active/behavior/print event details</li>
      </ul>

      <p>
        Deletion: collected analytics data is deleted from our systems. If you would like
        more information or want to request deletion related to your account, please contact
        us directly from the app support channels.
      </p>
    </main>
  );
}

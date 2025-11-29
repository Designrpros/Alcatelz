// src/app/page.tsx
import fs from "fs";
import path from "path";
import React from 'react';
import Hero from '../components/Hero';

const HomePage = async () => {
  const filePath = path.join(process.cwd(), 'src', 'app', 'privacy', 'analytics-data.txt');
  let analytics = '';
  try {
    analytics = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    analytics = '(analytics data not available)';
  }

  return (
    <>
      <Hero />

      <section style={{ backgroundColor: '#333', color: '#fff', padding: '2rem', overflowX: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ marginTop: 0, color: '#fff' }}>Privacy Policy — Mapr</h1>

          <p>
            Mapr collects data solely for analytics purposes. The data we collect is used to
            improve the app, understand usage patterns, and measure performance. Collected
            analytics data is deleted from our systems — we do not use it for advertising or
            other profiling purposes.
          </p>

          <h2>Exactly what we collect</h2>
          <p>The following is the exact analytics data collected by Mapr (source code):</p>

          <div style={{ background: '#0b0b0b', color: '#e6e6e6', padding: 16, borderRadius: 6, overflowX: 'auto' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
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
        </div>
      </section>
    </>
  );
};

export default HomePage;
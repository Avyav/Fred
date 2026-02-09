import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy - FRED",
  description: "Privacy policy for FRED - Mental Health Support Victoria",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 2026
        </p>

        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              1. Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              FRED (Mental Health Support Victoria) is committed to protecting your privacy. This
              policy explains what data we collect, how we store it, how long we
              keep it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              2. Data We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Account information:</strong> Email address, age, and
                general location (Victorian region). Your password is stored as a
                one-way hash and cannot be read by anyone.
              </li>
              <li>
                <strong>Conversation data:</strong> Messages between you and the
                AI assistant, including timestamps and conversation metadata.
              </li>
              <li>
                <strong>Usage data:</strong> Message counts, token usage, and
                aggregated cost data for service monitoring. This data is linked
                to your account but does not include message content.
              </li>
              <li>
                <strong>Crisis flags:</strong> If the AI detects language
                indicating a potential crisis, a flag is created with{" "}
                <strong>redacted</strong> message snippets (emails and phone
                numbers are removed). User IDs are anonymized in admin views.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                To provide AI-powered mental health support conversations
              </li>
              <li>
                To maintain conversation history for continuity across sessions
              </li>
              <li>To enforce usage limits and prevent abuse</li>
              <li>To detect and respond to potential crisis situations</li>
              <li>
                To monitor service costs and performance (aggregated data only)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              4. Data Storage and Security
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                All data is stored in a PostgreSQL database hosted in the
                Australian region.
              </li>
              <li>Data is encrypted in transit using TLS/HTTPS.</li>
              <li>
                Passwords are hashed using bcrypt with a cost factor of 12.
              </li>
              <li>
                Sessions use JWT tokens with a maximum age of 7 days.
              </li>
              <li>
                AI processing is performed via the Anthropic API. Messages are
                sent to Anthropic for processing but are not used for model
                training per Anthropic&apos;s API terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              5. Data Retention
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Conversation data is retained for as long as your account is
                active.
              </li>
              <li>
                Usage logs are retained for 90 days for cost monitoring
                purposes.
              </li>
              <li>
                Crisis flags are retained for review and may be anonymized after
                30 days.
              </li>
              <li>
                Upon account deletion, all associated data is permanently
                removed.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              6. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Access:</strong> You can view your profile and
                conversation history at any time.
              </li>
              <li>
                <strong>Export:</strong> You can download all your conversation
                data in JSON format via the Settings page.
              </li>
              <li>
                <strong>Deletion:</strong> You can delete your account and all
                associated data at any time via the Settings page.
              </li>
              <li>
                <strong>Correction:</strong> You can update your profile
                information through the Settings page.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              7. Third-Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Anthropic (Claude AI):</strong> Conversation messages
                are sent to Anthropic&apos;s API for AI processing. Anthropic&apos;s API
                data usage policies apply.
              </li>
              <li>
                <strong>Vercel:</strong> The application is hosted on Vercel&apos;s
                platform, subject to Vercel&apos;s privacy policy.
              </li>
              <li>
                <strong>Database provider:</strong> PostgreSQL database hosted in
                the Australian region.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This service is intended for adults aged 18 and over. We do not
              knowingly collect data from individuals under 18. If we discover
              that a minor has created an account, we will take steps to delete
              it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. Material
              changes will be communicated via a notice on the platform.
              Continued use of the service constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              10. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related inquiries, please contact the FRED
              Victoria team via the platform.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

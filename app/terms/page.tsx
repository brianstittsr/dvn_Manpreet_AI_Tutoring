import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | AICenter4U",
  description: "Terms of Service for AICenter4U platform and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: August 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AICenter4U (&quot;AICenter4U&quot;) platform and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p>
              AICenter4U provides business coaching, strategic planning, and leadership development services designed to help entrepreneurs and business owners build sustainable wealth, develop high-performing teams, and create lasting legacies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform&apos;s operation</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. SMS Messaging Program</h2>
            <p>
              Our messaging program includes service updates, appointment confirmations, reminders, responses to service inquiries, and marketing promotions (if you have provided marketing consent). The program is designed to ensure optimal customer support and respond to service-related inquiries.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3">Opt-Out</h3>
            <p>
              You can cancel the SMS service at any time. Just text &quot;STOP&quot; to (513) 335-1978. After you send the SMS message &quot;STOP&quot; to us, we will send you an SMS message to confirm that you have been unsubscribed.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3">Support</h3>
            <p>
              If you are experiencing issues with the messaging program, you can reply with the keyword HELP for more assistance.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3">Frequency, Rates &amp; Liability</h3>
            <p>
              Message and data rates may apply. Message frequency varies based on your interactions with our service. Carriers are not liable for delayed or undelivered messages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Age Restriction &amp; Legal Representation</h2>
            <p>
              By using this service, you represent and warrant that you are at least 18 years of age. If you are under 18 years old, you may not use or access our services or opt into our messaging program.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy Policy</h2>
            <p>
              Your use of the messaging program is also governed by our Privacy Policy. View it here:{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the AICenter4U platform are owned by AICenter4U and are protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              AICenter4U shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <p>
                <strong>AICenter4U</strong><br />
                EIN: 84-3055745<br />
                4724 Vine Street<br />
                Cincinnati, OH 45217<br />
                Phone: <a href="tel:+15133351978" className="text-primary hover:underline">(513) 335-1978</a><br />
                Email: <a href="mailto:info@aicenter4u.com" className="text-primary hover:underline">info@aicenter4u.com</a><br />
                Website: <Link href="https://aicenter4u.com" className="text-primary hover:underline">aicenter4u.com</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

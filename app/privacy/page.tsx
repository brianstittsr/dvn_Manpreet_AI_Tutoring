import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | CurioQuest",
  description: "Privacy Policy for CurioQuest platform and services.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: August 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              CurioQuest (&quot;CurioQuest&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and job title</li>
              <li><strong>Account Information:</strong> Login credentials and account preferences</li>
              <li><strong>Usage Data:</strong> Information about how you use our platform</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your requests and transactions</li>
              <li>Send appointment confirmations, reminders, and responses to service inquiries via SMS</li>
              <li>Send you important updates and communications</li>
              <li>Improve our platform and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. SMS Text Messaging</h2>
            <p>
              By opting into our SMS services, you represent that you are at least 18 years of age. We use SMS text messaging to send appointment confirmations, reminders, responses to service inquiries, and occasional marketing messages regarding seasonal specials and discounts to those who provide secondary consent. Message frequency varies based on your interactions with our service. Message and data rates may apply.
            </p>
            <p className="mt-4">
              <strong>Mandatory Non-Sharing Clause:</strong> No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Information sharing to subcontractors in support services, such as customer service, is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
            </p>
            <p className="mt-4">
              We do not sell, rent, or trade customer lists or personal data to any third parties. We do not share your data with affiliates or partners for their own marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All form submissions on our website are protected using SSL (Secure Sockets Layer) encryption to ensure the secure transmission of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Children&apos;s Privacy (COPPA)</h2>
            <p>
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected information from a child under 13, we will take steps to delete such information. By opting into our SMS services, you represent that you are at least 18 years of age.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze website traffic, and understand how you interact with our platform. These technologies may collect information such as your IP address, browser type, device information, pages visited, and referring/exit pages. You can control or disable cookies through your browser settings. Please note that disabling cookies may affect certain features of our website. We do not use cookies to track your mobile opt-in status or consent decisions for SMS messaging.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
              <li>Opt out of SMS messaging at any time by replying STOP</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-4 border rounded-lg bg-muted/30">
              <p>
                <strong>CurioQuest</strong><br />
                EIN: 84-3055745<br />
                4724 Vine Street<br />
                Cincinnati, OH 45217<br />
                Phone: <a href="tel:+15133351978" className="text-primary hover:underline">(513) 335-1978</a><br />
                Email: <a href="mailto:info@curioquest.com" className="text-primary hover:underline">info@curioquest.com</a><br />
                Website: <Link href="https://curioquest.com" className="text-primary hover:underline">curioquest.com</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "SMS Opt-In | AICenter4U",
  description: "Opt-in to receive SMS messages from AICenter4U",
};

export default function SmsOptInPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto border rounded-lg p-8 shadow-sm bg-card">
        <h1 className="text-3xl font-bold text-center mb-2">SMS Messaging Opt-In</h1>
        <p className="text-lg text-center text-muted-foreground mb-6">
          From AICenter4U
        </p>

        <p className="text-muted-foreground mb-6">
          By submitting this form, you consent to receive SMS text messages from{" "}
          <strong>AICenter4U</strong> at the phone number you provide.
          These messages may include appointment confirmations, reminders, responses
          to service inquiries, and marketing promotions about special offers,
          discounts, and service updates. Message frequency may vary. Message and
          data rates may apply. You must be at least 18 years old to opt in. Reply
          STOP to opt out at any time. Text HELP for assistance. View our{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{" "}
          and{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
        </p>

        <form action="/api/sms-opt-in" method="POST" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="sms-consent-transactional"
              name="smsConsentTransactional"
              value="on"
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="sms-consent-transactional"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              I consent to receive non-marketing text messages from AICenter4U
              Business Inc at the phone number provided. Message types include
              appointment confirmations, reminders, and responses to service
              inquiries. Message frequency may vary. Message and data rates may
              apply. I am at least 18 years of age. Reply STOP to opt out. Text
              HELP for assistance.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="sms-consent-marketing"
              name="smsConsentMarketing"
              value="on"
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="sms-consent-marketing"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              I consent to receive marketing text messages from AICenter4U
              Inc at the phone number provided. Message types include special
              offers, discounts, and service updates. Message frequency may vary.
              Message and data rates may apply. I am at least 18 years of age.
              Reply STOP to opt out. Text HELP for assistance.
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Consent is optional and not a condition of purchase or use of our
            services. You may opt out at any time by replying STOP to messages
            from AICenter4U For assistance, text HELP. View our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{" "}
            and{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>.
          </p>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit Opt-In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            <strong>AICenter4U</strong> · EIN: 84-3055745
          </p>
          <p>4724 Vine Street, Cincinnati, OH 45217</p>
          <p>
            Phone:{" "}
            <a href="tel:+15133351978" className="text-primary hover:underline">(513) 335-1978</a>
            {" · "}
            Email:{" "}
            <a href="mailto:info@aicenter4u.com" className="text-primary hover:underline">info@aicenter4u.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}

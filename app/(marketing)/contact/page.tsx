"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import { logOpportunityCreated } from "@/lib/activity-logger";

const subjects = [
  "Math (Coach Maya)",
  "Reading (Story Explorer)",
  "Life Skills (Growth & Glow)",
  "More than one subject",
  "Not sure yet - help us decide",
];

const gradeBands = [
  "Ages 5-7",
  "Ages 8-10",
  "Ages 11-13",
  "Ages 14+",
  "Not sure yet",
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    parentFirstName: "",
    parentLastName: "",
    learnerFirstName: "",
    email: "",
    phone: "",
    gradeBand: "",
    subject: "",
    message: "",
    newsletter: false,
  });
  const [bookCallOpen, setBookCallOpen] = useState(false);
  const [isBookingCall, setIsBookingCall] = useState(false);
  const [bookCallForm, setBookCallForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    learnerName: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create an Opportunity for this contact form submission
      if (db) {
        try {
          const parentName = `${contactForm.parentFirstName} ${contactForm.parentLastName}`.trim();
          const opportunityData = {
            name: `Parent Inquiry - ${parentName}`.trim(),
            organizationName: contactForm.learnerFirstName
              ? `Family of ${contactForm.learnerFirstName}`
              : "Family",
            stage: "lead",
            value: 0,
            probability: 20,
            expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
            description: `Parent/learner inquiry from the contact form.\n\nSubject of Interest: ${contactForm.subject || "Not specified"}\nLearner Age Band: ${contactForm.gradeBand || "Not specified"}`,
            notes: `Parent/Guardian: ${parentName}\nLearner: ${contactForm.learnerFirstName || "Not provided"}\nEmail: ${contactForm.email}\nPhone: ${contactForm.phone || "Not provided"}\n\nGoals & Questions:\n${contactForm.message || "No message provided"}`,
            source: "contact-form",
            affiliateId: null,
            affiliateName: parentName,
            affiliateEmail: contactForm.email,
            affiliatePhone: contactForm.phone || null,
            affiliateCompany: null,
            deliverables: [],
            isSubscription: false,
            monthlyAmount: null,
            subscriptionTermMonths: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          const oppRef = await addDoc(collection(db, COLLECTIONS.OPPORTUNITIES), opportunityData);
          await logOpportunityCreated(oppRef.id, opportunityData.name);
          console.log("Opportunity created for parent inquiry:", oppRef.id);
        } catch (oppError) {
          console.error("Error creating opportunity from contact form:", oppError);
          // Don't block the form submission if opportunity creation fails
        }
      }

      toast.success("Thanks for reaching out!", {
        description: "We'll get back to you within 24 hours.",
      });

      setContactForm({
        parentFirstName: "",
        parentLastName: "",
        learnerFirstName: "",
        email: "",
        phone: "",
        gradeBand: "",
        subject: "",
        message: "",
        newsletter: false,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Something went wrong", {
        description: "Please try again or email us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCall = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsBookingCall(true);

    try {
      if (!db) {
        throw new Error("Database not configured");
      }

      await addDoc(collection(db, COLLECTIONS.BOOK_CALL_LEADS), {
        firstName: bookCallForm.firstName,
        lastName: bookCallForm.lastName,
        email: bookCallForm.email,
        phone: bookCallForm.phone || null,
        company: bookCallForm.learnerName ? `Family of ${bookCallForm.learnerName}` : null,
        jobTitle: null,
        preferredDate: bookCallForm.preferredDate || null,
        preferredTime: bookCallForm.preferredTime || null,
        message: bookCallForm.message || null,
        source: "contact-page",
        status: "new",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create an Opportunity for this book-a-call request
      try {
        const parentName = `${bookCallForm.firstName} ${bookCallForm.lastName}`.trim();
        const opportunityData = {
          name: `Parent Call Request - ${parentName}`.trim(),
          organizationName: bookCallForm.learnerName
            ? `Family of ${bookCallForm.learnerName}`
            : "Family",
          stage: "lead",
          value: 0,
          probability: 25,
          expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          description: `A parent/guardian asked for a call.\n\nPreferred Date: ${bookCallForm.preferredDate || "Not specified"}\nPreferred Time: ${bookCallForm.preferredTime || "Not specified"}\nLearner: ${bookCallForm.learnerName || "Not provided"}`,
          notes: `Contact Info:\nEmail: ${bookCallForm.email}\nPhone: ${bookCallForm.phone || "Not provided"}\n\nMessage:\n${bookCallForm.message || "No message provided"}`,
          source: "contact-page-book-call",
          affiliateId: null,
          affiliateName: parentName,
          affiliateEmail: bookCallForm.email,
          affiliatePhone: bookCallForm.phone || null,
          affiliateCompany: null,
          deliverables: [],
          isSubscription: false,
          monthlyAmount: null,
          subscriptionTermMonths: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const oppRef = await addDoc(collection(db, COLLECTIONS.OPPORTUNITIES), opportunityData);
        await logOpportunityCreated(oppRef.id, opportunityData.name);
        console.log("Opportunity created for parent call request:", oppRef.id);
      } catch (oppError) {
        console.error("Error creating opportunity from call request:", oppError);
        // Don't block the form submission if opportunity creation fails
      }

      toast.success("Call request sent!", {
        description: "We'll contact you soon to set up a time.",
      });

      setBookCallForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        learnerName: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
      setBookCallOpen(false);
    } catch (error) {
      console.error("Error submitting call request:", error);
      toast.error("Something went wrong", {
        description: "Please try again or email us directly.",
      });
    } finally {
      setIsBookingCall(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
              Get in Touch
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Let&apos;s Help Your Child{" "}
              <span className="text-primary">Love Learning</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300">
              Have a question about AICenter4U? Tell us a little about your learner
              and we&apos;ll help you find the right fit.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Tell Us About Your Learner</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentFirstName">Your First Name *</Label>
                        <Input
                          id="parentFirstName"
                          required
                          placeholder="Jane"
                          value={contactForm.parentFirstName}
                          onChange={(e) => setContactForm({ ...contactForm, parentFirstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentLastName">Your Last Name *</Label>
                        <Input
                          id="parentLastName"
                          required
                          placeholder="Smith"
                          value={contactForm.parentLastName}
                          onChange={(e) => setContactForm({ ...contactForm, parentLastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="learnerFirstName">Learner&apos;s First Name</Label>
                        <Input
                          id="learnerFirstName"
                          placeholder="Alex"
                          value={contactForm.learnerFirstName}
                          onChange={(e) => setContactForm({ ...contactForm, learnerFirstName: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          First name only, please - we take kids&apos; privacy seriously.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gradeBand">Learner&apos;s Age Range</Label>
                        <Select
                          value={contactForm.gradeBand}
                          onValueChange={(value) => setContactForm({ ...contactForm, gradeBand: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an age range" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeBands.map((band) => (
                              <SelectItem key={band} value={band}>
                                {band}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="jane@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">What Is Your Child Interested In? *</Label>
                      <Select
                        required
                        value={contactForm.subject}
                        onValueChange={(value) => setContactForm({ ...contactForm, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Goals & Questions</Label>
                      <Textarea
                        id="message"
                        placeholder="What would you like your child to learn? Any questions for us?"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={contactForm.newsletter}
                        onCheckedChange={(checked) => setContactForm({ ...contactForm, newsletter: checked === true })}
                      />
                      <Label htmlFor="newsletter" className="text-sm font-normal">
                        Send me learning tips and AICenter4U updates
                      </Label>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <Link
                        href="mailto:info@aicenter4u.com"
                        className="text-muted-foreground hover:text-primary"
                      >
                        info@aicenter4u.com
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <Link
                        href="tel:+1-513-335-1978"
                        className="text-muted-foreground hover:text-primary"
                      >
                        (513) 335-1978
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">United States</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-muted-foreground">Mon-Fri: 8am - 6pm EST</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Call */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Talk to Our Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Prefer to talk? Request a short call and we&apos;ll help you decide if
                    AICenter4U is right for your family.
                  </p>
                  <Dialog open={bookCallOpen} onOpenChange={setBookCallOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Request a Call
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Request a Parent Call</DialogTitle>
                        <DialogDescription>
                          Tell us when works best and we&apos;ll reach out to set up a quick chat.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBookCall} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="book-firstName">Your First Name *</Label>
                            <Input
                              id="book-firstName"
                              required
                              value={bookCallForm.firstName}
                              onChange={(e) => setBookCallForm({ ...bookCallForm, firstName: e.target.value })}
                              placeholder="Jane"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="book-lastName">Your Last Name *</Label>
                            <Input
                              id="book-lastName"
                              required
                              value={bookCallForm.lastName}
                              onChange={(e) => setBookCallForm({ ...bookCallForm, lastName: e.target.value })}
                              placeholder="Smith"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="book-email">Email *</Label>
                          <Input
                            id="book-email"
                            type="email"
                            required
                            value={bookCallForm.email}
                            onChange={(e) => setBookCallForm({ ...bookCallForm, email: e.target.value })}
                            placeholder="jane@email.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="book-phone">Phone</Label>
                            <Input
                              id="book-phone"
                              type="tel"
                              value={bookCallForm.phone}
                              onChange={(e) => setBookCallForm({ ...bookCallForm, phone: e.target.value })}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="book-learner">Learner&apos;s First Name</Label>
                            <Input
                              id="book-learner"
                              value={bookCallForm.learnerName}
                              onChange={(e) => setBookCallForm({ ...bookCallForm, learnerName: e.target.value })}
                              placeholder="Alex"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="book-date">Preferred Date</Label>
                            <Input
                              id="book-date"
                              type="date"
                              value={bookCallForm.preferredDate}
                              onChange={(e) => setBookCallForm({ ...bookCallForm, preferredDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="book-time">Preferred Time</Label>
                            <Select
                              value={bookCallForm.preferredTime}
                              onValueChange={(value) => setBookCallForm({ ...bookCallForm, preferredTime: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                                <SelectItem value="evening">Evening (5pm-7pm)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="book-message">What would you like to ask?</Label>
                          <Textarea
                            id="book-message"
                            value={bookCallForm.message}
                            onChange={(e) => setBookCallForm({ ...bookCallForm, message: e.target.value })}
                            placeholder="Tell us about your learner or what you'd like to know..."
                            rows={3}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isBookingCall}>
                          {isBookingCall ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              Request Call
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Kid-Safe Promise */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Kid-Safe Promise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Parents approve access before kids start</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Coaches give hints, never just answers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">A real person can step in anytime</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">We only keep what learning needs</p>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">A reply within 24 hours</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">Friendly help picking the right coach</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">No pressure - just honest answers</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

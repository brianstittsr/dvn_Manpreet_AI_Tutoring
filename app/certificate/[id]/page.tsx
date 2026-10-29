"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Award, Loader2, Printer, ShieldCheck } from "lucide-react";

interface CertificateData {
  id: string;
  title: string;
  recipientName: string;
  courseTitle: string | null;
  certificateType: string;
  issuedAt: string | null;
  certificateNumber: string | null;
}

export default function CertificatePage() {
  const params = useParams();
  const id = params.id as string;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/certificates/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Not found");
        setCertificate(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Certificate not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const issuedLabel = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end print:hidden">
        <Button
          onClick={() => window.print()}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Certificate
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none">
        <div className="border-[14px] border-teal-600/90 p-2">
          <div className="border-2 border-teal-600/40 px-8 py-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>

            <p className="text-sm tracking-[0.3em] uppercase text-teal-700 mb-2">
              CurioQuest Academy
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-2">
              Certificate of Completion
            </h1>
            <p className="text-muted-foreground mb-10">
              This certificate is proudly presented to
            </p>

            <p className="text-3xl md:text-4xl font-serif font-bold text-teal-700 border-b-2 border-slate-300 inline-block px-12 pb-3 mb-10">
              {certificate.recipientName}
            </p>

            <p className="text-muted-foreground mb-2">
              for successfully completing
            </p>
            <p className="text-2xl font-semibold text-slate-900 mb-10">
              {certificate.courseTitle || certificate.title}
            </p>

            <div className="flex items-end justify-between mt-16 px-4 text-left">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Date Issued
                </p>
                <p className="font-medium">{issuedLabel}</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  CurioQuest
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Certificate No.
                </p>
                <p className="font-mono text-sm">
                  {certificate.certificateNumber || certificate.id}
                </p>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Verify this certificate at curioquest.com/certificate/{certificate.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

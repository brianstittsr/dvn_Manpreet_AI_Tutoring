import { AICenter4UNavbar } from "@/components/shared/aicenter4u-navbar";
import { AICenter4UFooter } from "@/components/shared/aicenter4u-footer";

export default function AICenter4UMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AICenter4UNavbar />
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>
      <AICenter4UFooter />
    </div>
  );
}

import { CurioQuestNavbar } from "@/components/shared/curioquest-navbar";
import { CurioQuestFooter } from "@/components/shared/curioquest-footer";

export default function CurioQuestMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <CurioQuestNavbar />
      <main id="main-content" className="flex-1" role="main" tabIndex={-1}>
        {children}
      </main>
      <CurioQuestFooter />
    </div>
  );
}

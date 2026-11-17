"use client";

import { OrderTicket } from "@/components/mechanix/panels/order-ticket";
import { AiGuidePanel } from "@/components/mechanix/panels/ai-guide";
import { useMechanix } from "@/components/mechanix/workspace/store";
import { DomLadder } from "@/components/mechanix/chart/orderflow";
import {
  DashboardSide, ProfileSummary, AiGuideChat, QuizSide, PublishSettings,
  InstrumentDetails, SetupExplainer, PropStatus, CopierControls,
  JournalDayDetail, TrendingRail, FeedbackComposer, CoachAccess, Leaderboard,
  SyncLogRail, CartRail,
} from "@/components/mechanix/panels/right-panels";

export function RightRail({ view }: { view: string }) {
  const journalDay = useMechanix((s) => s.journalDay);
  switch (view) {
    case "dashboard": return <DashboardSide />;
    case "onboarding": return <ProfileSummary />;
    case "lesson": return <AiGuideChat />;
    case "quiz": return <QuizSide />;
    case "quiz-builder": return <PublishSettings />;
    case "integrations": return <SyncLogRail />;
    case "practice": return <div className="h-full overflow-y-auto"><OrderTicket /><AiGuidePanel /></div>;
    case "trade": return <OrderTicket />;
    case "markets": return <InstrumentDetails symbol="EURUSD" />;
    case "scanner": return <SetupExplainer />;
    case "orderflow": return <DomLadder symbol="EURUSD" />;
    case "prop": return <PropStatus />;
    case "copier": return <CopierControls />;
    case "journal": return <JournalDayDetail day={journalDay} />;
    case "community": case "discussions": return <TrendingRail />;
    case "coach": return <div className="h-full overflow-y-auto"><FeedbackComposer /><CoachAccess /></div>;
    case "group-quiz": return <Leaderboard />;
    case "shop": return <CartRail />;
    case "admin-review": return <CoachAccess />;
    case "admin-connectors": return <SyncLogRail />;
    default: return null;
  }
}

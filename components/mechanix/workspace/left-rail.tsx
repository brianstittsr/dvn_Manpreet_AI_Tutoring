"use client";

import { getMechanixView, type MechanixSection } from "@/app/mechanix-design/views";
import { useMechanix } from "@/components/mechanix/workspace/store";
import {
  SECTION_NAV, SectionRail, StepListRail, WatchlistRail, ScannerFiltersRail,
  AccountsRail, ChannelsRail, SimpleListRail,
} from "@/components/mechanix/panels/rails";

interface LeftRailProps {
  view: string;
  section: MechanixSection;
  onNavigate: (slug: string) => void;
}

export function LeftRail({ view, section, onNavigate }: LeftRailProps) {
  const v = getMechanixView(view);
  const obStep = useMechanix((s) => s.onboarding.step);
  if (!v) return null;

  switch (view) {
    case "login":
      return <SimpleListRail title="Getting started" items={["Sign in", "Onboarding", "Account setup", "Start practicing"]} activeIdx={0} />;
    case "account-setup":
      return <SimpleListRail title="Getting started" items={["Sign in", "Onboarding", "Account setup", "Start practicing"]} activeIdx={2} />;
    case "onboarding":
      return <StepListRail steps={["Goals", "Markets", "Schedule", "Risk"]} active={obStep} />;
    case "quiz-builder":
      return <SimpleListRail title="Question bank" items={["Market structure", "Supply & Demand", "Risk & the Math", "Order flow basics", "Scenario sets"]} activeIdx={1} />;
    case "markets":
    case "orderflow":
      return <WatchlistRail />;
    case "scanner":
      return <ScannerFiltersRail />;
    case "trade": case "prop": case "copier": case "journal":
      return <AccountsRail active={view} onNavigate={onNavigate} />;
    case "community": case "discussions":
      return <ChannelsRail active={view} onNavigate={onNavigate} />;
    case "coach":
      return <SimpleListRail title="Assigned learners" items={["Alex R. — pending", "Maya P. — reviewed", "Dre W. — pending", "Priya S. — on track"]} />;
    case "group-quiz":
      return <SimpleListRail title="Teams" items={["Zone Hunters", "Candle Crew", "Risk Rangers", "Pip Scholars"]} />;
    case "admin-login":
      return <SimpleListRail title="Staff area" items={["Sign in", "Students", "Course builder", "Review queue"]} activeIdx={0} />;
    case "admin-students":
      return <SimpleListRail title="Cohorts" items={["Foundations L1", "S&D L2", "Prop-track"]} />;
    case "admin-course":
      return <SimpleListRail title="Modules" items={["Market structure", "Supply & Demand", "Risk & the Math", "Order flow basics"]} />;
    default: {
      if (section === "Learn") {
        return <SectionRail items={SECTION_NAV.Learn} active={view} onNavigate={onNavigate} showProgress />;
      }
      return <SectionRail items={SECTION_NAV[section]} active={view} onNavigate={onNavigate} showProgress={section === "Practice"} />;
    }
  }
}

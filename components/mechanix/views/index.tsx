"use client";

import { DashboardView, OnboardingView, LessonView, QuizView, QuizBuilderView } from "./learn-views";
import { PracticeView, MarketsView, ScannerView, OrderflowView } from "./practice-views";
import { TradeView, PropView, CopierView, JournalView } from "./trade-views";
import { CommunityView, DiscussionsView, CoachView, GroupQuizView } from "./community-views";
import { LoginView, AccountSetupView } from "./auth-views";
import { IntegrationsView } from "./integrations-view";
import { ShopView } from "./shop-view";
import { AdminLoginView, AdminConnectorsView, AdminArchitectureView } from "./admin-views";
import { AdminStudentsView } from "./admin-students-view";
import { AdminReviewView } from "./admin-review-view";
import { AdminCourseView } from "./admin-course-view";

interface CenterViewProps {
  view: string;
  onNavigate: (slug: string) => void;
}

export function CenterView({ view, onNavigate }: CenterViewProps) {
  switch (view) {
    case "login": return <LoginView onNavigate={onNavigate} />;
    case "account-setup": return <AccountSetupView onNavigate={onNavigate} />;
    case "dashboard": return <DashboardView />;
    case "onboarding": return <OnboardingView onNavigate={onNavigate} />;
    case "lesson": return <LessonView />;
    case "quiz": return <QuizView />;
    case "quiz-builder": return <QuizBuilderView />;
    case "integrations": return <IntegrationsView />;
    case "practice": return <PracticeView />;
    case "markets": return <MarketsView />;
    case "scanner": return <ScannerView />;
    case "orderflow": return <OrderflowView />;
    case "trade": return <TradeView />;
    case "prop": return <PropView />;
    case "copier": return <CopierView />;
    case "journal": return <JournalView />;
    case "community": return <CommunityView />;
    case "discussions": return <DiscussionsView />;
    case "coach": return <CoachView />;
    case "group-quiz": return <GroupQuizView />;
    case "shop": return <ShopView />;
    case "admin-login": return <AdminLoginView onNavigate={onNavigate} />;
    case "admin-students": return <AdminStudentsView />;
    case "admin-course": return <AdminCourseView />;
    case "admin-review": return <AdminReviewView />;
    case "admin-connectors": return <AdminConnectorsView />;
    case "admin-architecture": return <AdminArchitectureView />;
    default: return null;
  }
}

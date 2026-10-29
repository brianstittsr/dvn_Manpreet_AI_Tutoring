"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  getCourse,
  getModules,
  getLessons,
  getEnrollment,
  type CourseDoc,
  type LessonDoc,
  type EnrollmentDoc,
} from "@/lib/firebase-lms";
import {
  getCourseProgress,
  getQuizAttempts,
  type LessonProgressDoc,
  type QuizAttemptDoc,
} from "@/lib/firebase-lms-student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Printer, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

interface LessonRow {
  lesson: LessonDoc;
  moduleTitle: string;
  progress: LessonProgressDoc | null;
  bestQuiz: QuizAttemptDoc | null;
}

export default function ProgressReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProgressReportInner />
    </Suspense>
  );
}

function ProgressReportInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const { profile, isAuthenticated } = useUserProfile();

  // Admins can print a report for any learner via ?student=<teamMemberId>
  const studentId = searchParams.get("student") || profile.id;

  const [course, setCourse] = useState<CourseDoc | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentDoc | null>(null);
  const [rows, setRows] = useState<LessonRow[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !studentId || !courseId) return;

    async function load() {
      try {
        const [courseData, enrollmentData, modulesData, progressData] =
          await Promise.all([
            getCourse(courseId),
            getEnrollment(studentId, courseId),
            getModules(courseId),
            getCourseProgress(studentId, courseId),
          ]);

        if (!courseData) return;

        if (studentId === profile.id) {
          setStudentName(
            [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
              profile.email ||
              "Learner"
          );
        } else if (db) {
          const memberSnap = await getDoc(
            doc(db, COLLECTIONS.TEAM_MEMBERS, studentId)
          );
          const member = memberSnap.exists() ? memberSnap.data() : null;
          setStudentName(
            member
              ? `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                  member.emailPrimary ||
                  "Learner"
              : "Learner"
          );
        }
        setCourse(courseData);
        setEnrollment(enrollmentData);

        const progressByLesson: Record<string, LessonProgressDoc> = {};
        progressData.forEach((p) => {
          progressByLesson[p.lessonId] = p;
        });

        const lessonRows: LessonRow[] = [];
        for (const mod of modulesData) {
          const lessons = await getLessons(mod.id);
          for (const lesson of lessons) {
            let bestQuiz: QuizAttemptDoc | null = null;
            if (lesson.contentType === "quiz") {
              const attempts = await getQuizAttempts(studentId, lesson.id);
              bestQuiz =
                attempts.length > 0
                  ? attempts.reduce((a, b) => (b.score > a.score ? b : a))
                  : null;
            }
            lessonRows.push({
              lesson,
              moduleTitle: mod.title,
              progress: progressByLesson[lesson.id] || null,
              bestQuiz,
            });
          }
        }
        setRows(lessonRows);
      } catch (error) {
        console.error("Error loading report:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, studentId, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Report Not Available</h1>
        <Button asChild>
          <Link href="/portal/my-courses">Back to My Courses</Link>
        </Button>
      </div>
    );
  }

  const completedCount = rows.filter((r) => r.progress?.isCompleted).length;
  const quizRows = rows.filter((r) => r.bestQuiz);
  const avgQuiz =
    quizRows.length > 0
      ? Math.round(
          quizRows.reduce((s, r) => s + (r.bestQuiz?.score || 0), 0) /
            quizRows.length
        )
      : null;
  const fmt = (t: { toDate?: () => Date } | null | undefined) =>
    t?.toDate ? t.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) : "—";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/portal/my-courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none rounded-lg print:rounded-none p-8">
        {/* Header */}
        <div className="border-b-2 border-teal-600 pb-6 mb-6">
          <p className="text-sm tracking-[0.25em] uppercase text-teal-700 mb-1">
            AICenter4U Academy
          </p>
          <h1 className="text-3xl font-bold">Learning Progress Report</h1>
          <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Student:</span>{" "}
              <span className="font-medium">{studentName}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Course:</span>{" "}
              <span className="font-medium">{course.title}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Enrolled:</span>{" "}
              {fmt(enrollment?.enrolledAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Completed:</span>{" "}
              {enrollment?.completedAt ? fmt(enrollment.completedAt) : "In progress"}
            </p>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">
              {enrollment?.progressPercentage || 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Course Progress</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">
              {completedCount}/{rows.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Lessons Completed</div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">
              {avgQuiz !== null ? `${avgQuiz}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Avg Quiz Score</div>
          </div>
        </div>

        {/* Lesson detail */}
        <h2 className="text-lg font-semibold mb-3">Lesson Detail</h2>
        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left">
              <th className="py-2 pr-2 w-8"></th>
              <th className="py-2 pr-4">Lesson</th>
              <th className="py-2 pr-4">Module</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.lesson.id} className="border-b border-slate-100">
                <td className="py-2 pr-2">
                  {row.progress?.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                </td>
                <td className="py-2 pr-4 font-medium">{row.lesson.title}</td>
                <td className="py-2 pr-4 text-muted-foreground">{row.moduleTitle}</td>
                <td className="py-2 pr-4 capitalize text-muted-foreground">
                  {row.lesson.contentType === "gptLesson"
                    ? "AI Lesson"
                    : row.lesson.contentType === "studentInterview"
                      ? "AI Interview"
                      : row.lesson.contentType}
                </td>
                <td className="py-2 pr-4">
                  {row.bestQuiz ? (
                    <Badge
                      variant="outline"
                      className={
                        row.bestQuiz.passed
                          ? "bg-teal-500/10 text-teal-700 border-teal-500/30"
                          : "bg-amber-500/10 text-amber-700 border-amber-500/30"
                      }
                    >
                      {row.bestQuiz.score}%
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2 text-muted-foreground">
                  {fmt(row.progress?.completedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-xs text-muted-foreground border-t pt-4 flex justify-between">
          <span>Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span>AICenter4U · AI-guided learning for kids</span>
        </div>
      </div>
    </div>
  );
}

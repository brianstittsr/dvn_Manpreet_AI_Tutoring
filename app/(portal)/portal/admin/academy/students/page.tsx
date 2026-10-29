"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { EnrollmentDoc, CourseDoc } from "@/lib/firebase-lms";
import type { LessonProgressDoc, QuizAttemptDoc } from "@/lib/firebase-lms-student";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Award,
  ChevronDown,
  ChevronRight,
  Loader2,
  Printer,
  Search,
  Users,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";

interface StudentAggregate {
  userId: string;
  name: string;
  email: string;
  enrollments: EnrollmentDoc[];
  lessonsCompleted: number;
  avgQuizScore: number | null;
  certificates: { id: string; courseId?: string; title: string }[];
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentAggregate[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseDoc>>({});
  const [progressByUser, setProgressByUser] = useState<
    Record<string, LessonProgressDoc[]>
  >({});
  const [attemptsByUser, setAttemptsByUser] = useState<
    Record<string, QuizAttemptDoc[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!db) return;

    async function load() {
      try {
        const [
          enrollmentsSnap,
          coursesSnap,
          membersSnap,
          progressSnap,
          attemptsSnap,
          certsSnap,
        ] = await Promise.all([
          getDocs(collection(db!, "lms_enrollments")),
          getDocs(collection(db!, "lms_courses")),
          getDocs(collection(db!, COLLECTIONS.TEAM_MEMBERS)),
          getDocs(collection(db!, "lms_lesson_progress")),
          getDocs(collection(db!, "lms_quiz_attempts")),
          getDocs(collection(db!, "lms_certificates")),
        ]);

        const courseMap: Record<string, CourseDoc> = {};
        coursesSnap.docs.forEach((d) => {
          courseMap[d.id] = d.data() as CourseDoc;
        });
        setCourses(courseMap);

        const memberMap: Record<string, { name: string; email: string }> = {};
        membersSnap.docs.forEach((d) => {
          const m = d.data();
          memberMap[d.id] = {
            name:
              `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
              m.emailPrimary ||
              "Unknown",
            email: m.emailPrimary || "",
          };
        });

        const progressMap: Record<string, LessonProgressDoc[]> = {};
        progressSnap.docs.forEach((d) => {
          const p = d.data() as LessonProgressDoc;
          (progressMap[p.odUserId] = progressMap[p.odUserId] || []).push(p);
        });
        setProgressByUser(progressMap);

        const attemptMap: Record<string, QuizAttemptDoc[]> = {};
        attemptsSnap.docs.forEach((d) => {
          const a = d.data() as QuizAttemptDoc;
          (attemptMap[a.odUserId] = attemptMap[a.odUserId] || []).push(a);
        });
        setAttemptsByUser(attemptMap);

        const certsByUser: Record<
          string,
          { id: string; courseId?: string; title: string }[]
        > = {};
        certsSnap.docs.forEach((d) => {
          const c = d.data();
          (certsByUser[c.odUserId] = certsByUser[c.odUserId] || []).push({
            id: d.id,
            courseId: c.courseId,
            title: c.title,
          });
        });

        const enrollmentsByUser: Record<string, EnrollmentDoc[]> = {};
        enrollmentsSnap.docs.forEach((d) => {
          const e = d.data() as EnrollmentDoc;
          (enrollmentsByUser[e.userId] = enrollmentsByUser[e.userId] || []).push(
            e
          );
        });

        const aggregates: StudentAggregate[] = Object.entries(
          enrollmentsByUser
        ).map(([userId, enrollments]) => {
          const progress = progressMap[userId] || [];
          const attempts = attemptMap[userId] || [];
          const bestByLesson: Record<string, number> = {};
          attempts.forEach((a) => {
            if (!bestByLesson[a.lessonId] || a.score > bestByLesson[a.lessonId]) {
              bestByLesson[a.lessonId] = a.score;
            }
          });
          const bestScores = Object.values(bestByLesson);

          return {
            userId,
            name: memberMap[userId]?.name || "Unknown learner",
            email: memberMap[userId]?.email || "",
            enrollments,
            lessonsCompleted: progress.filter((p) => p.isCompleted).length,
            avgQuizScore:
              bestScores.length > 0
                ? Math.round(
                    bestScores.reduce((s, v) => s + v, 0) / bestScores.length
                  )
                : null,
            certificates: certsByUser[userId] || [],
          };
        });

        aggregates.sort((a, b) => a.name.localeCompare(b.name));
        setStudents(aggregates);
      } catch (error) {
        console.error("Error loading student metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
      ),
    [students, search]
  );

  const toggle = (userId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            Student Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Per-student enrollment, lesson completion, and quiz performance.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No enrolled students yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <Collapsible
              key={student.userId}
              open={expanded.has(student.userId)}
              onOpenChange={() => toggle(student.userId)}
            >
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        {expanded.has(student.userId) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {student.enrollments.length} course
                          {student.enrollments.length !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                          {student.lessonsCompleted} lessons
                        </span>
                        {student.avgQuizScore !== null && (
                          <Badge variant="outline">
                            {student.avgQuizScore}% avg quiz
                          </Badge>
                        )}
                        {student.certificates.length > 0 && (
                          <Badge className="bg-teal-600">
                            <Award className="h-3 w-3 mr-1" />
                            {student.certificates.length} cert
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-4">
                    <div className="space-y-4">
                      {student.enrollments.map((enrollment) => {
                        const course = courses[enrollment.courseId];
                        const courseProgress = (
                          progressByUser[student.userId] || []
                        ).filter((p) => p.courseId === enrollment.courseId);
                        const lessonsDone = courseProgress.filter(
                          (p) => p.isCompleted
                        ).length;
                        const courseAttempts = (
                          attemptsByUser[student.userId] || []
                        ).filter((a) => a.courseId === enrollment.courseId);
                        const cert = student.certificates.find(
                          (c) => c.courseId === enrollment.courseId
                        );

                        return (
                          <div
                            key={enrollment.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">
                                  {course?.title || enrollment.courseId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Enrolled{" "}
                                  {enrollment.enrolledAt?.toDate?.().toLocaleDateString() ||
                                    "—"}
                                  {enrollment.completedAt &&
                                    ` · Completed ${enrollment.completedAt.toDate().toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {enrollment.completedAt && (
                                  <Badge className="bg-teal-600">Complete</Badge>
                                )}
                                {cert && (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link
                                      href={`/certificate/${cert.id}`}
                                      target="_blank"
                                    >
                                      <Award className="h-3 w-3 mr-1" />
                                      Certificate
                                    </Link>
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/portal/my-courses/${enrollment.courseId}/report?student=${student.userId}`}
                                    target="_blank"
                                  >
                                    <Printer className="h-3 w-3 mr-1" />
                                    Report
                                  </Link>
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Progress
                                value={enrollment.progressPercentage}
                                className="h-2 flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-40 text-right">
                                {enrollment.progressPercentage}% · {lessonsDone}{" "}
                                lessons · {courseAttempts.length} quiz attempts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

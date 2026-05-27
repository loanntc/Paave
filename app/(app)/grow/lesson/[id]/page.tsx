import { notFound } from "next/navigation";
import { LESSONS_BY_ID } from "@/lib/learning/content";
import { LessonViewer } from "./lesson-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const lesson = LESSONS_BY_ID[id];
  return { title: lesson ? `${lesson.titleVi} — Paave` : "Bài học — Paave" };
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = LESSONS_BY_ID[id];
  if (!lesson) notFound();
  return <LessonViewer lesson={lesson} />;
}

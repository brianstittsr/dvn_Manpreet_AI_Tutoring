import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MechanixWorkspace } from "@/components/mechanix/workspace/mechanix-workspace";
import { getMechanixView, MECHANIX_VIEWS } from "@/app/mechanix-design/views";

export function generateStaticParams() {
  return MECHANIX_VIEWS.map((view) => ({ screen: view.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>;
}): Promise<Metadata> {
  const { screen: slug } = await params;
  const view = getMechanixView(slug);

  if (!view) {
    return {
      title: "MechaniX Design View Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${view.title} | MechaniX Concept`,
    description: view.description,
  };
}

export default async function MechanixDesignScreenPage({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen: slug } = await params;
  const view = getMechanixView(slug);

  if (!view) {
    notFound();
  }

  return <MechanixWorkspace />;
}

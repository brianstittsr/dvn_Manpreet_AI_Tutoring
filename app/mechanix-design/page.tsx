import type { Metadata } from "next";
import { MechanixWorkspace } from "@/components/mechanix/workspace/mechanix-workspace";

export const metadata: Metadata = {
  title: "MechaniX — Practice Workspace (Concept)",
  description:
    "Public concept prototype of the MechaniX trading education and practice platform. Concept • Illustrative data only.",
};

export default function MechanixDesignPage() {
  return <MechanixWorkspace />;
}

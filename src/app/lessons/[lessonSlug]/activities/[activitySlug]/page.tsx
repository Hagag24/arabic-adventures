import React from "react";
import { notFound } from "next/navigation";
import { getActivityPayload } from "@/server/services/activity-service";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import ActivityPlayerClient from "@/components/activity/ActivityPlayerClient";

export const dynamic = "force-dynamic";

interface ActivityPlayPageProps {
  params: Promise<{
    lessonSlug: string;
    activitySlug: string;
  }>;
}

export default async function ActivityPlayPage({
  params,
}: ActivityPlayPageProps) {
  const { lessonSlug, activitySlug } = await params;
  const sessionId = await getPlayerSessionId();

  // Retrieve safe activity payload from service layer with session checks
  const activityPayload = await getActivityPayload(
    lessonSlug,
    activitySlug,
    sessionId,
  );

  if (!activityPayload) {
    notFound();
  }

  return <ActivityPlayerClient activity={activityPayload} />;
}

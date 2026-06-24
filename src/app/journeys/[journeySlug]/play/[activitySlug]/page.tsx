import React from "react";
import { notFound } from "next/navigation";
import { getActivityPayload } from "@/server/services/activity-service";
import ActivityPlayerClient from "./ActivityPlayerClient";

export const dynamic = "force-dynamic";

interface ActivityPlayPageProps {
  params: Promise<{
    journeySlug: string;
    activitySlug: string;
  }>;
}

export default async function ActivityPlayPage({
  params,
}: ActivityPlayPageProps) {
  const { journeySlug, activitySlug } = await params;

  // Retrieve safe activity payload from service layer
  const activityPayload = await getActivityPayload(journeySlug, activitySlug);

  if (!activityPayload) {
    notFound();
  }

  return <ActivityPlayerClient activity={activityPayload} />;
}

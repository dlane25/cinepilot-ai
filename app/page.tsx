import React from "react";
import { ApplicationShell } from "../components/layout/ApplicationShell";
import { CommandCenterDashboard } from "../components/dashboard/CommandCenterDashboard";

export default function CommandCenter() {
  return (
    <ApplicationShell>
      <CommandCenterDashboard />
    </ApplicationShell>
  );
}

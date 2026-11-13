
import "fake-indexeddb/auto";

import { describe, it, expect } from "vitest";

import {
  saveReport,
  getReports,
} from "./database";

describe("FieldTrack offline database", () => {
  it("saves a report and retrieves it after reopening the database", async () => {
    const report = {
      clientId: "test-report-001",
      category: "Water",
      description: "Broken community water point",
      location: "Adama",
      priority: "High",
      status: "Draft",
      syncState: "Pending",
      reportedAt: new Date().toISOString(),
      activity: [],
    };

    await saveReport(report);

    const reports = await getReports();

    const savedReport = reports.find(
      (item) => item.clientId === "test-report-001"
    );

    expect(savedReport).toBeDefined();
    expect(savedReport.category).toBe("Water");
    expect(savedReport.syncState).toBe("Pending");
  });
});

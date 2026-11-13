
import {
  getReports,
  updateLocalReport,
} from "../db/database";

const API = "http://localhost:5000/api/reports";

let isSyncing = false;

export async function synchronizeReports() {
  if (!navigator.onLine || isSyncing) return;

  isSyncing = true;

  try {
    const reports = await getReports();

    for (const report of reports) {
      if (!navigator.onLine) break;

      if (
        report.syncState !== "Pending" &&
        report.syncState !== "Failed"
      ) {
        continue;
      }

      const now = Date.now();

      if (
        report.nextRetryAt &&
        now < report.nextRetryAt
      ) {
        continue;
      }

      try {
        const response = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: report.clientId,
            category: report.category,
            description: report.description,
            location: report.location,
            priority: report.priority,
            reportedAt: report.reportedAt,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        await updateLocalReport({
          ...report,
          syncState: "Synchronized",
          status: data.report.status,
          serverId: data.report._id,
          lastError: null,
          nextRetryAt: null,
          activity: [
            ...report.activity,
            {
              action: "SYNCHRONIZED",
              details: "Report successfully synchronized.",
              timestamp: new Date().toISOString(),
            },
          ],
        });
      } catch (error) {
        const attempts = (report.retryCount || 0) + 1;

        // Exponential backoff, capped at one minute.
        const delay = Math.min(
          1000 * 2 ** attempts,
          60000
        );

        await updateLocalReport({
          ...report,
          syncState: "Failed",
          retryCount: attempts,
          nextRetryAt: Date.now() + delay,
          lastError: error.message,
          activity: [
            ...report.activity,
            {
              action: "SYNC_FAILED",
              details: error.message,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }
    }
  } finally {
    isSyncing = false;
  }
}

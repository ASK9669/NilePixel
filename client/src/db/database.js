
import { openDB } from "idb";

const dbPromise = openDB("fieldtrack-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("reports")) {
      db.createObjectStore("reports", {
        keyPath: "clientId",
      });
    }
  },
});

export async function saveReport(report) {
  const db = await dbPromise;
  await db.put("reports", report);
}

export async function getReports() {
  const db = await dbPromise;
  return db.getAll("reports");
}

export async function updateLocalReport(report) {
  const db = await dbPromise;
  return db.put("reports", report);
}

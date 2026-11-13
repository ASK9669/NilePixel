const express = require("express");
const Report = require("../models/Report");

const router = express.Router();
const { canTransition, validRejectionReason } = require("../utils/workflow");

const categories = [
  "Water",
  "Equipment",
  "Service Interruption",
  "Safety",
  "Maintenance",
  "Other",
];

const priorities = ["Low", "Medium", "High", "Critical"];

const transitions = {
  Submitted: ["Assigned", "Rejected"],
  Assigned: ["In Progress", "Rejected"],
  "In Progress": ["Resolved"],
  Resolved: [],
  Rejected: [],
};

// CREATE REPORT
router.post("/", async (req, res) => {
  try {
    const { clientId, category, description, location, priority, reportedAt } =
      req.body;

    if (!clientId || !category || !description || !location || !reportedAt) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({
        message: "Invalid report category.",
      });
    }

    if (!priorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority.",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        message: "Description must contain at least 10 characters.",
      });
    }

    if (description.length > 2000 || location.length > 200) {
      return res.status(400).json({
        message: "Input exceeds the allowed length.",
      });
    }

    if (Number.isNaN(Date.parse(reportedAt))) {
      return res.status(400).json({
        message: "Invalid report date.",
      });
    }

    // Idempotency: retries return the existing report.
    const existing = await Report.findOne({ clientId });

    if (existing) {
      return res.status(200).json({
        message: "Report already synchronized.",
        report: existing,
        duplicate: true,
      });
    }

    const report = await Report.create({
      clientId,
      category,
      description: description.trim(),
      location: location.trim(),
      priority,
      reportedAt: new Date(reportedAt),
      status: "Submitted",
      activity: [
        {
          action: "CREATED",
          details: "Report received by the server.",
        },
        {
          action: "SYNCHRONIZED",
          details: "Offline report successfully synchronized.",
        },
      ],
    });

    res.status(201).json({
      message: "Report created successfully.",
      report,
    });
  } catch (error) {
    // Handle simultaneous retries with the same clientId.
    if (error.code === 11000) {
      const existing = await Report.findOne({
        clientId: req.body.clientId,
      });

      if (existing) {
        return res.status(200).json({
          message: "Report already synchronized.",
          report: existing,
          duplicate: true,
        });
      }
    }

    console.error("Create report error:", error);

    res.status(500).json({
      message: "Unable to create report.",
    });
  }
});

// GET ALL REPORTS
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.json({
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve reports.",
    });
  }
});

// UPDATE REPORT STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, reason } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found.",
      });
    }

    if (!canTransition(report.status, status)) {
      return res.status(400).json({
        message: `Invalid transition from ${report.status} to ${status}.`,
      });
    }

    if (status === "Rejected" && !validRejectionReason(reason)) {
      return res.status(400).json({
        message: "Please provide a rejection reason of at least 5 characters.",
      });
    }

    const previousStatus = report.status;

    report.status = status;

    report.activity.push({
      action: "STATUS_CHANGED",
      details:
        `${previousStatus} → ${status}` +
        (status === "Rejected" ? `: ${reason.trim()}` : ""),
    });

    await report.save();

    res.json({
      message: "Report status updated successfully.",
      report,
    });
  } catch (error) {
    console.error("Update status error:", error);

    res.status(500).json({
      message: "Unable to update report status.",
    });
  }
});

module.exports = router;

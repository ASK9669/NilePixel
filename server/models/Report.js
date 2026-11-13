
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Water",
        "Equipment",
        "Service Interruption",
        "Safety",
        "Maintenance",
        "Other",
      ],
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      default: "Submitted",
    },

    reportedAt: {
      type: Date,
      required: true,
    },

    activity: [activitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);


const transitions = {
  Submitted: ["Assigned", "Rejected"],
  Assigned: ["In Progress", "Rejected"],
  "In Progress": ["Resolved"],
  Resolved: [],
  Rejected: [],
};

function canTransition(current, next) {
  return transitions[current]?.includes(next) ?? false;
}

function validRejectionReason(reason) {
  return typeof reason === "string" && reason.trim().length >= 5;
}

module.exports = {
  transitions,
  canTransition,
  validRejectionReason,
};

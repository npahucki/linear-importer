function formatPriority(priority) {
  const pivotalPriorities = {
    "p1 - High": 2,
    "p2 - Medium": 3,
    "p3 - Low": 4,
  };

  return pivotalPriorities[priority] || 4;
}

export default formatPriority;

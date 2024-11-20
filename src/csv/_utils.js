export function buildParams(row) {
  const comments = joinMultipleColumns(row["Comment"]);
  const additionalPivotalData = buildAdditionalPivotalData(row);

  const params = {
    name: row["Title"],
    id: row["Id"],
    type: row["Type"],
    createdAt: row["Created at"],
    startsAt: row["Iteration Start"],
    endsAt: row["Iteration End"],
    description: row["Description"],
    iteration: row["Iteration"],
    state: row["Current State"],
    priority: row["Priority"],
    labels: row["Labels"],
    requestedBy: row["Requested By"],
    ownedBy: row["Owned By"],
    comments: [...(comments || []), additionalPivotalData],
  };

  // TODO:
  // - ESTIMATE

  return params;
}

function buildAdditionalPivotalData(row) {
  const header = ["#### Raw Pivotal Tracker Data:", ""];

  const dataRows = Object.entries(row)
    .filter(([key]) => !["Comment", "Description"].includes(key))
    .map(([key, value]) => {
      const formattedValue = Array.isArray(value)
        ? joinMultipleColumns(value)
        : value;
      return `- ${key}: ${formattedValue}`;
    });

  return [...header, ...dataRows].join("\n");
}

function joinMultipleColumns(columns) {
  if (!Array.isArray(columns)) return "";
  return columns.filter((comment) => comment !== "");
}

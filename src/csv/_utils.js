
export function buildParams(row) {
  const comments = joinMultipleColumns(row['Comment']);
  const additionalPivotalData = buildAdditionalPivotalData(row);

  const params = {
    name: row['Title'],
    id: row['Id'],
    type: row['Type'],
    createdAt: row['Created at'],
    startsAt: row['Iteration Start'],
    endsAt: row['Iteration End'],
    description: row['Description'],
    iteration: row['Iteration'],
    state: row['Current State'],
    priority: row['Priority'],
    comments: [...(comments || []), additionalPivotalData]
  }

  // TODO:
  // - ESTIMATE
  // - OWNERS

  return params;
}

function buildAdditionalPivotalData(row) {
  const additionalPivotalData = [
    '#### Additional Pivotal Data:',
    '',
    `- Pivotal Story ID: ${row['Id']}`,
    `- Pivotal Story URL: ${row['URL']}`,
    `- Current State: ${row['Current State']}`,
    `- Priority: ${row['Priority']}`,
    `- Estimate: ${row['Estimate']}`,
    `- Labels: ${row['Labels']}`,
    `- Deadline: ${row['Deadline']}`,
    `- Requested By: ${row['Requested By']}`,
    `- Owners: ${joinMultipleColumns(row['Owned By'])}`,
    `- Iteration Start: ${row['Iteration Start']}`,
    `- Iteration End: ${row['Iteration End']}`,
    `- Pull Request URL: ${joinMultipleColumns(row['Pull Request'])}`,
    `- Git Branch: ${joinMultipleColumns(row['Git Branch'])}`,
    `- Task: ${joinMultipleColumns(row['Task'])}`,
    `- Task Status: ${joinMultipleColumns(row['Task Status'])}`,
    `- Review Type: ${joinMultipleColumns(row['Review Type'])}`,
    `- Reviewer: ${joinMultipleColumns(row['Reviewer'])}`,
    `- Review Status: ${joinMultipleColumns(row['Review Status'])}`
  ].join('\n');

  return additionalPivotalData;
}

function joinMultipleColumns(columns) {
  if (!Array.isArray(columns)) return '';
  return columns.filter(comment => comment !== '');
}
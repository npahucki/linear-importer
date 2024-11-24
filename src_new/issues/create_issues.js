import linearClient from "../../config/client.mjs";
import DetailedLogger from "../../logger/detailed_logger.mjs";
import getUserMapping from "../users/get_user_mapping.mjs";
import fetchLabels from "../labels/list.mjs";
import fetchEstimatesForTeam from "../estimates/list.mjs";

const detailedLogger = new DetailedLogger();

async function createIssues({ team, payload, options }) {
  const teamLabels = await fetchLabels({ teamId: team.id });
  const issueEstimation = await fetchEstimatesForTeam({
    teamId: team.id,
  });

  const userMapping = await getUserMapping(team.name);

  detailedLogger.importantSuccess(
    `Payload: ${JSON.stringify(payload, null, 2)}`,
  );
  // detailedLogger.info(`Options: ${JSON.stringify(options, null, 2)}`);

  // detailedLogger.result(`userMapping: ${JSON.stringify(userMapping, null, 2)}`);
  // detailedLogger.result(`labels: ${JSON.stringify(labels, null, 2)}`);
  // detailedLogger.result(
  //   `issueEstimation: ${JSON.stringify(issueEstimation, null, 2)}`,
  // );

  payload.issues.map(async (formattedIssueParams) => {
    try {
      const params = {
        teamId: team.id,
        title: formattedIssueParams.name,
        description: formattedIssueParams.description,
        labelIds: options.shouldImportLabels
          ? teamLabels.filter((label) =>
              formattedIssueParams.labels.includes(label.name),
            )
          : [],
        // estimate: options.shouldImportEstimates
        //   ? findClosestEstimate(formattedIssueParams.estimate, issueEstimation)
        //   : undefined,
      };

      await linearClient.createIssue(params);
    } catch (error) {
      detailedLogger.error(`Failed to create issue: ${error.message}`);
      throw error;
    }
  });
}

export default createIssues;

// ✨ Payload: {
//   "issues": [
//     {
//       "name": "Mass Update Client Contacts TESTING",
//       "id": "187555145",
//       "type": "feature",
//       "createdAt": "May 6, 2024",
//       "startsAt": "May 13, 2024",
//       "endsAt": "May 19, 2024",
//       "description": "Fields:\n\nStatus\nAxis Access\nIndividual Axis Access permissions\nDepartment\nAxis Onboarding Complete\nDelete?",
//       "iteration": "291",
//       "state": "accepted",
//       "priority": "p3 - Low",
//       "labels": "",
//       "requestedBy": "Nick Verges",
//       "ownedBy": [
//         "Jacobs88",
//         "Savanah Lundskow",
//         "Nick Verges",
//         "vladylenapohorila",
//         "Oleksii Dmytrenko"
//       ],
//       "estimate": "3",
//       "comments": [
//         "(Nick Verges - May 6, 2024)",
//         "@Oleksii_Dmytrenko @vladylenapohorila could you guys build out the frontend for this new mass action modal? I'll set up the backend, because there will be some special things needed to make this work as intended. \n\nyou can send the params in our usual way to a route `api/clients/mass-update.json` (this doesn't exist yet, but i'll make it)\n\n```\n{\n  status: String, \n  axis_access: Boolean,\n  aging_report_notification: Boolean,\n  placement_notification: Boolean,\n  employee_phone_access: Boolean,\n  invoice_access: Boolean,\n  receive_invoices: Boolean,\n  time_notification: Boolean,\n  bill_rate_access: Boolean,\n  bill_rate_notifications: Boolean,\n  default_populated: Boolean,\n  axis_onboarding_complete: Boolean,\n  department: String,\n}\n``` (Nick Verges - May 7, 2024)",
//         "**Test (QA)** review set to **pass** (Savanah Lundskow - May 15, 2024)",
//         "#### Raw Pivotal Tracker Data:\n\n- Id: 187555145\n- Title: Mass Update Client Contacts TESTING\n- Labels: \n- Iteration: 291\n- Iteration Start: May 13, 2024\n- Iteration End: May 19, 2024\n- Type: feature\n- Estimate: 3\n- Priority: p3 - Low\n- Current State: accepted\n- Created at: May 6, 2024\n- Accepted at: May 17, 2024\n- Deadline: \n- Requested By: Nick Verges\n- URL: https://www.pivotaltracker.com/story/show/187555145\n- Owned By: Jacobs88,Savanah Lundskow,Nick Verges,vladylenapohorila,Oleksii Dmytrenko\n- Blocker: \n- Blocker Status: \n- Task: \n- Task Status: \n- Review Type: Test (QA)\n- Reviewer: Savanah Lundskow\n- Review Status: pass\n- Pull Request: https://github.com/RADDevelopment/three-sixty-industrial/pull/1198\n- Git Branch: "
//       ],
//       "dueDate": "May 17, 2024"
//     }
//   ],
//   "aggregatedData": {
//     "userNames": [
//       "Jacobs88",
//       "Savanah Lundskow",
//       "Nick Verges",
//       "vladylenapohorila",
//       "Oleksii Dmytrenko"
//     ],
//     "labels": [],
//     "statusTypes": [
//       "feature"
//     ],
//     "estimates": [
//       3
//     ]
//   }
// }

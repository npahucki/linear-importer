# Pivotal Tracker to Linear Converter

A command-line tool that migrates your Pivotal Tracker projects to Linear. Using Pivotal's CSV export feature, this tool converts:
- Pivotal Stories → Linear Issues
- Pivotal Releases → Linear Parent Issues (with associated stories as sub-issues)
- Preserves attachments, comments, labels, assignees, priorities, and dates

Built with the [Linear SDK](https://github.com/linear/linear/tree/master/packages/sdk).

## Key Features
- File Attachments
- Comments
- Labels
- Assignee
- Statuses
- Priority
- Created Date
- Due Date
- Story Types
- Preserve Pivotal Releases
  - Pivotal Releases are converted to Linear parent issues
  - Stories within a Pivotal Release become sub-issues in Linear
  - Maintains release cycle organization and relationships
- Safe to retry - skips already imported stories to prevent duplicates
- Generates log files

## Setup
### Installation
1. Create `.env` file and add your Linear API key as `API_KEY`
2. `yarn install`
3. Unzip Pivotal Tracker export and move entire unzipped folder into `src/csv/assets`

### Usage
1. `cd src`
2. `node import.mjs`

![alt text](image.png)

## Details
### File Attachments
- File attachments can be optionally imported via the provided prompt

### Comments
- Comments are imported with original author, timestamp, and content preserved.

### Labels
- The following Labels will be created in the selected Team. This allows each Team to modify labels at their own pace without affecting other Teams, and will avoid any naming conflicts with existing labels.
  - `pivotal - epic`
  - `pivotal - release`
  - `pivotal - feature`
  - `pivotal - bug`
  - `pivotal - chore`

- Additionally, you will be prompted with the option to import labels created in Pivotal Tracker. These will be added to the imported Linear Issues.

### Statuses
- The following Workflow Statuses will be created in the selected Team. This allows each Team to modify statuses at their own pace without affecting other Teams, and will avoid any naming conflicts with existing statuses.
  - `pivotal - accepted`
  - `pivotal - unscheduled`
  - `pivotal - finished`
  - `pivotal - planned`
  - `pivotal - started`

### Priority
- Priority levels are mapped from Pivotal to Linear as follows:
  - P1 (Pivotal) → High (Linear)
  - P2 → Medium
  - P3 → Low

### Created Date
- ⏰ Created Date of Pivotal Story will be preserved on the imported Linear Issue
- 📅 Original timestamps are maintained for historical accuracy

### Due Date
- ✅ Due dates from Pivotal Tracker are copied exactly to Linear
- ❌ Stories without due dates in Pivotal will have no due date in Linear

### Story Types
- Configure your import by selecting specific story types via the CLI prompt:

![alt text](image-1.png)

### Preserve Pivotal Releases
- Linear does not allow for Cycles to be created with dates in the past. Instead, we'll use `Issues` and `Sub-Issues` to mimic this behavior.
  - Pivotal Tracker stories with type `release` will be created with the label `pivotal - release`
  - Any Pivotal Tracker story that belong to this release iteration will be added as a sub-issue

### Assignee / Smart User Mapping:
  - Automatic name matching between Pivotal and Linear users
  - Manual user association option for:
    - Mapping specific Pivotal users to Linear users
    - Skipping users who are no longer with the organization
    - Handling username mismatches or edge cases

### Logger
- Unique Team data is stored in team-specific folders (`log/<team-name>`). Each folder contains:
  - `output_<timestamp>`: Complete console output for each import attempt
  - `successful_imports.csv` - Logs successfully imported Pivotal Stories. These will be skipped on subsequent import attempts, preventing duplicates.
    - ***Warning**: Deleting this file will cause the importer to lose track of previously imported stories, which could result in duplicate issues being created in Linear*
  - `user-mapping.json` - Maps Pivotal Tracker usernames to Linear user accounts
    - Auto-generated during the first import attempt using Levenshtein Distance to find the closest matching Linear usernames
    - Can be forcibly re-generated on subsequent import attempts
    - Ability to manually resolve users for which a match cannot be found automatically
      ```json
      {
        "generated": "2024-01-01T00:00:00.000Z",
        "mapping": {
          "johndoe42": {
            "linearId": "a1b2c3d4-e5f6-4321-9876-543210fedcba",
            "linearName": "John Doe",
            "linearEmail": "john.doe@acme.com"
          },
          "Jane Smith": {
            "linearId": "b2c3d4e5-f6a1-8765-4321-987654321abc",
            "linearName": "Jane Smith",
            "linearEmail": "jane.smith@acme.com"
          },
          "robotcoder99": {
            "linearId": null,
            "linearName": null,
            "linearEmail": null,
            "note": "No matching Linear user found (manual skip)"
          }
        }
      }
      ```

#### ENV Options
- `REQUESTS_PER_SECOND` = 5
  - (varies based on API endpoint)
- `ENABLE_IMPORTING` = true
  - `false` to halt execution before any requests; allows testing CLI
- `ENABLE_DETAILED_LOGGING` = false
  - `true` to show additional logging output for user mapping and file attachments

#### API Rate Limits
- Linear sets rate limits on their API usage, which you will probably reach. The Linear team was helpful in increasing my rate limits temporarily. https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting.
- The `REQUESTS_PER_SECOND` ENV var can be adjusted to throttle request frequency


#### Other Notes
- It is not possible to override the "Creator" on a Linear Issue. This information will be preserved in the `Raw Pivotal Data` comment on each Issue.
- Add members to desired teams before beginning import
- Be mindful of notification preferences for members. This can get noisy while importing 😬
- Deleting the Team folder in the `log` directory is acceptable, but doing so will eliminate 

## TODO
- Pivotal Estimate -> Linear Estimate. https://github.com/nverges/pivotal-linear-importer/issues/4

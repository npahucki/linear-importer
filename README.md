# Pivotal Tracker to Linear Converter

A command-line tool that migrates your Pivotal Tracker projects to Linear. Using Pivotal's CSV export feature, this tool converts:

- Pivotal Stories → Linear Issues
- Pivotal Releases → Linear Parent Issues (with associated stories as sub-issues)
- Preserves attachments, comments, labels, assignees, priorities, and dates

Built with the [Linear SDK](https://github.com/linear/linear/tree/master/packages/sdk).

## Key Features

- [File Attachments](#file-attachments)
- [Comments](#comments)
- [Labels](#labels)
- [Statuses](#statuses)
- [Story Types](#story-types)
- [Priority](#priority)
- [Created Date](#created-date)
- [Due Date](#due-date)
- [Assignee](#assignee--smart-user-mapping) (Automatically matches Pivotal users to Linear accounts)
- [Releases](#releases) (Pivotal Releases → Linear parent issues with associated stories as sub-issues)
- [Safe to retry](#logger) (Skips already imported stories to prevent duplicates)
- [Logger](#logger)


#### Other
- [API Rate Limits](#api-rate-limits)
- [Considerations](#considerations)
- [Issues](#issues)
- [TODO](#todo)


## Setup

### Installation

1. Create `.env` file and add your Linear API key as `API_KEY`
2. `yarn install`
3. Unzip Pivotal Tracker export and move entire unzipped folder into `src/csv/assets`

### Usage

1. `cd src`
2. `node import.mjs`

![alt text](image.png)

#### ENV Options

- `REQUESTS_PER_SECOND` = 5
  - (varies based on API endpoint)
- `ENABLE_IMPORTING` = true
  - `false` to halt execution before any requests; allows testing CLI
- `ENABLE_DETAILED_LOGGING` = false
  - `true` to show additional logging output for user mapping and file attachments

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

### Story Types

- Configure your import by selecting specific story types via the CLI prompt:

![alt text](image-1.png)

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

### Assignee / Smart User Mapping

- Users are automatically mapped between Pivotal and Linear using Levenshtein Distance matching
 *Multiple Owners Handling:*
  - When a Pivotal Story has multiple owners:
    - Only the first owner will be assigned in Linear (sorted alphabetically)
    - Other owners will be added as subscribers to the issue
  - When a Pivotal Story has no owner:
    - The story creator becomes the assignee
    - This maintains contextual ownership rather than defaulting to the import user
- Options for handling user mapping:
  - Auto-generated on first import (can be regenerated if needed)
  - Manual mapping for specific users
  - Skip mapping for inactive/departed users
  - Handle username mismatches
- User Map data is stored in `log/<team>/user-mapping.json`:
  ```json
  {
    "generated": "2024-01-01T00:00:00.000Z",
    "mapping": {
      "johndoe42": {
        "linearId": "a1b2c3d4-e5f6-4321-9876-543210fedcba",
        "linearName": "John Doe",
        "linearEmail": "john.doe@acme.com"
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

### Releases

- Linear does not allow for Cycles to be created with dates in the past. Instead, we use a parent-child issue structure:
  - Each Pivotal Release becomes a parent issue in Linear with:
    - Label: `pivotal - release`
    - Original release date preserved in description
    - Release notes and details maintained
  - Stories within the release are imported as sub-issues:
    - Automatically linked to parent release issue
    - Maintain all original story attributes
    - Preserve story relationships and dependencies
  - This structure provides:
    - Historical release tracking
    - Grouped view of release-related work
    - Ability to track completion status

### Logger

- Unique Team data is stored in team-specific folders (`log/<team-name>`). Each folder contains:
  - `output_<timestamp>`: Complete console output for each import attempt
  - `successful_imports.csv` - Logs successfully imported Pivotal Stories. These will be skipped on subsequent import attempts, preventing duplicates.
    - **\*Warning**: Deleting this file will cause the importer to lose track of previously imported stories, which could result in duplicate issues being created in Linear\*
  - `user-mapping.json` - Maps Pivotal Tracker usernames to Linear user accounts (see [Assignee / Smart User Mapping](#assignee--smart-user-mapping))

## Other

#### Considerations

- It is not possible to override the "Creator" on a Linear Issue. This information will be preserved in the `Raw Pivotal Data` comment on each Issue.
- Add Team Members in Linear before beginning import to take advantage of Smart User matching. However, users can be manually mapped.
- Be mindful of notification preferences for members. This can get noisy while importing 😬

#### API Rate Limits

- Linear sets rate limits on their API usage, which you will probably reach. The Linear team was helpful in increasing my rate limits temporarily. https://developers.linear.app/docs/graphql/working-with-the-graphql-api/rate-limiting.
- The `REQUESTS_PER_SECOND` ENV var can be adjusted to throttle request frequency

#### Issues
- Label creation can only be run 1 time https://github.com/nverges/pivotal-linear-importer/issues/13

#### TODO
- Pivotal Estimate -> Linear Estimate. https://github.com/nverges/pivotal-linear-importer/issues/4

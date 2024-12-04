import inquirer from "inquirer";
import { detailedLogger } from "../../../logger/logger_instance.js";
import { STATUS_OPTIONS } from "./constants.js";

async function selectStatusTypes() {
  const { selectedStatusTypes } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedStatusTypes",
      message: "Select the Pivotal story types to include:",
      choices: STATUS_OPTIONS.map((status) => ({
        name: status.value,
        value: status.value,
        checked: true,
      })),
      validate: (answer) => {
        if (answer.length < 1) {
          return "You must choose at least one status type.";
        }
        return true;
      },
    },
  ]);

  detailedLogger.info(`Selected Status Types: ${selectedStatusTypes}`);

  return selectedStatusTypes;
}

export default selectStatusTypes;

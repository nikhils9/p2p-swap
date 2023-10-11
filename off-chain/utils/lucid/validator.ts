import { APPLIED_VALIDATOR_PATH } from "../../common/constants.ts";
import { AppliedValidator } from "../../common/types.ts";
import {
  applyDoubleCborEncoding,
  applyParamsToScript,
  Data,
  Script,
} from "lucid";
import { bigIntReplacer, lucid } from "./utils.ts";

// Validator related utilities

export function parseValidator(validators: any, title: string): Script {
  const validator = validators.find((e: any) => e.title === title);

  if (!validator) {
    throw new Error(title + " validator not found!");
  }

  return {
    type: "PlutusV2",
    script: validator.compiledCode,
  };
}

export async function getAppliedValidator(
  validatorName: string,
  filePath?: string,
): Promise<AppliedValidator> {
  const validatorPath = filePath ? filePath : APPLIED_VALIDATOR_PATH;
  return JSON.parse(await Deno.readTextFile(validatorPath + validatorName));
}

export function parseValidatorAndApplyParameters(
  validators: any,
  params: Data[],
  title: string,
): AppliedValidator {
  const validator = parseValidator(validators, title);
  return applyValidatorParameters(validator, params, title);
}

export function applyValidatorParameters(
  rawValidator: Script,
  params: Data[],
  title: string,
): AppliedValidator {
  const compiledCode = applyParamsToScript(rawValidator.script, params);
  const validator: Script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(compiledCode),
  };

  const policyId = lucid.utils.validatorToScriptHash(validator);

  const lockAddress = lucid.utils.validatorToAddress(validator);

  const appliedValidator: AppliedValidator = {
    validator: validator,
    policyId: policyId,
    lockAddress: lockAddress,
    params: params,
  };

  const appliedValidatorString = JSON.stringify(
    appliedValidator,
    bigIntReplacer,
  );

  Deno.writeTextFile(
    APPLIED_VALIDATOR_PATH + title + ".json",
    appliedValidatorString,
  );

  return appliedValidator;
}

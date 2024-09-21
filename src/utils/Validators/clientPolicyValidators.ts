import Joi from "joi";

const statusEnum = [
  "Published",
  "Approved",
  "Pending",
  "Rejected",
  "Draft",
  "Archived",
];

export default class ClientPolicyValidator {
  checkPolicyExistance = Joi.object({
    client_email: Joi.required(),
    policy_id: Joi.required(),
  });

  uploadClientPolicy = Joi.object({
    client_email: Joi.required(),
    client_policy_id: Joi.required(),
    file_name: Joi.required()
  });
}

import Joi from "joi";

const statusEnum = [
  "Draft",
  "Pending_Review",
  "Under_Review",
  "Approved",
  "Rejected",
];

export default class ClientPolicyValidator {
  checkPolicyExistance = Joi.object({
    client_email: Joi.required(),
    policy_id: Joi.required(),
  });

  uploadClientPolicy = Joi.object({
    client_email: Joi.required(),
    client_policy_id: Joi.required(),
    file_name: Joi.required(),
  });

  toggleStaus = Joi.object({
    client_policy_id: Joi.required(),
    status: Joi.string()
      .valid(...statusEnum)
      .required(),
  });

  rejectPolicy = Joi.object({
    client_policy_id: Joi.required(),
    rejection_policy: Joi.string().required(),
  });

  confirmPolicy = Joi.object({
    client_policy_id: Joi.required(),
  });
}

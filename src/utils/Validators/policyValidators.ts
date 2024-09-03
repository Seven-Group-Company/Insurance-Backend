import Joi from "joi";

const statusEnum = [
  "Published",
  "Approved",
  "Pending",
  "Rejected",
  "Draft",
  "Archived",
];

export class PolicyValidator {
  checkPolicyId = Joi.object({
    id: Joi.required(),
  });
  duplicatePolicy = Joi.object({
    id: Joi.required(),
    name: Joi.string().required(),
  });

  updatePolicy = Joi.object({
    id: Joi.required(),
    name: Joi.string(),
    description: Joi.string(),
    eligibility_criteria: Joi.string(),
    coverage_details: Joi.string(),
    documents_required: Joi.array(),
    features: Joi.array(),
    cover_image: Joi.string(),
    policy_category_id: Joi.number(),
  });

  listPolicy = Joi.object({
    status: Joi.string().valid(...statusEnum),
  });

  toggleStaus = Joi.object({
    id: Joi.required(),
    status: Joi.string()
      .valid(...statusEnum)
      .required(),
  });
}

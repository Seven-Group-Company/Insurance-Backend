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
  duplicatePolicy = Joi.object({
    id: Joi.required(),
    name: Joi.string().required(),
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

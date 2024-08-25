import { Request, Response } from "express";
import fs from "fs";
import { prisma } from "../utils/context";
import { SendResponse } from "../utils/responseUtil";
import { PolicyNumberGenerator } from "../utils/idGenerator";
import { PolicyValidator } from "../utils/Validators/policyValidators";
import { createObject } from "../utils/objectCreator";
import uploadPolicyFiles from "../utils/uploadPolicyFiles";
const sendResponse = new SendResponse();
const validator = new PolicyValidator();

export class PolicyManagenetService {
  createPolicy = async (req: any, res: Response) => {
    try {
      const { name } = req.body;
      //   Check Policy Existance
      if (await this.checkPolicyExistenceByName(name)) {
        return sendResponse[404](res, "Policy name already exists");
      }

      const policy = await prisma.policy.create({
        data: {
          name,
          created_by: Number(req?.user.id),
        },
      });
      const policyGenerator = new PolicyNumberGenerator("POL", policy.id);
      const policyUpdate = await prisma.policy.update({
        where: {
          id: policy.id,
        },
        data: {
          code: policyGenerator.generatePolicyNumber(),
        },
      });
      sendResponse[200](res, policyUpdate);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  duplicatePolicy = async (req: any, res: Response) => {
    try {
      const { id, name } = req.body;
      const validateInput = validator.duplicatePolicy.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }
      //   Check Policy Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not found");
      }

      if (await this.checkPolicyExistenceByName(name)) {
        return sendResponse[404](res, "Policy name already exists");
      }

      const policy = await prisma.policy.create({
        data: {
          name,
          description: existance.description,
          eligibility_criteria: existance.eligibility_criteria,
          coverage_details: existance.coverage_details,
          documents_required: existance.documents_required,
          policy_category_id: existance.policy_category_id,
          created_by: Number(req?.user.id),
        },
      });

      // Generate Policy Number
      const policyGenerator = new PolicyNumberGenerator("POL", policy.id);

      const policyUpdate = await prisma.policy.update({
        where: {
          id: policy.id,
        },
        data: {
          code: policyGenerator.generatePolicyNumber(),
        },
      });

      sendResponse[200](res, policyUpdate);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  updatePolicy = async (req: any, res: Response) => {
    try {
      const { id, name } = req.body;

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not Found");
      }

      const name_existance = await this.checkPolicyExistenceByName(name);
      if (name_existance && name_existance.id != id) {
        return sendResponse[404](res, "Policy name already exists");
      }

      // Generate Object for Update
      let newDataObject = createObject(req.body);
      newDataObject["updated_by"] = Number(req?.user.id);
      newDataObject["updated_at"] = new Date();

      const policy = await prisma.policy.update({
        where: {
          id: Number(id),
        },
        data: newDataObject,
      });
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  deletePolicy = async (req: any, res: Response) => {
    try {
      const { id } = req.query;

      // Check Existance
      const checkExistance = await this.checkPolicyExistenceByyId(id);

      if (!checkExistance) {
        return sendResponse[404](res, "Policy Not Found");
      }

      const policy = await prisma.policy.update({
        where: {
          id: Number(id),
        },
        data: {
          active: false,
        },
      });
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  listPolicy = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      const validateInput = validator.listPolicy.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const policy = await prisma.policy.findMany({
        where: {
          status,
        },
        include: {
          policy_category: {
            select: {
              id: true,
              name: true,
            },
          },
          policy_files: {
            select: {
              attachment: true,
            },
          },
        },
      });
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  getPolicy = async (req: Request, res: Response) => {
    try {
      const { id } = req.query;
      const policy = await prisma.policy.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          policy_category: {
            select: {
              id: true,
              name: true,
            },
          },
          policy_files: {
            select: {
              attachment: true,
            },
          },
        },
      });

      if (!policy) {
        return sendResponse[404](res, "Policy ID not Found");
      }
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  toggleStatus = async (req: Request, res: Response) => {
    try {
      const { id, status } = req.body;
      const validateInput = validator.toggleStaus.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }
      const policy = await prisma.policy.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!policy) {
        return sendResponse[404](res, "Policy ID not Found");
      }

      await prisma.policy.update({
        where: {
          id: Number(id),
        },
        data: {
          status,
        },
      });
      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  uploadFiles = async (req: any, res: Response) => {
    try {
      const files: any = req?.files;
      const { id } = req.query;

      files.map(async (file) => {
        try {
          const url = await uploadPolicyFiles(file.path, "policy-docs");
          await prisma.attachments.create({
            data: {
              name: file?.originalname,
              size: `${file?.size}`,
              type: file?.mimetype,
              url,
              created_by: Number(req?.user.id),
              policy_files: {
                create: {
                  policy_id: +id,
                },
              },
            },
          });
          // Delete local files after upload to Cloudinary
          await files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
        } catch (error) {
          return sendResponse[500](res, error.message);
        }
      });

      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  private checkPolicyExistenceByName = async (name: string) => {
    try {
      const policy = await prisma.policy.findUnique({
        where: { name },
      });
      return policy;
    } catch (error) {
      return false;
    }
  };
  private checkPolicyExistenceByyId = async (id: string | number) => {
    try {
      const policy = await prisma.policy.findUnique({
        where: { id: Number(id) },
      });
      return policy;
    } catch (error) {
      return false;
    }
  };
}

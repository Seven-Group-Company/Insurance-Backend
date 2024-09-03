import { Request, Response } from "express";
import fs from "fs";
import { prisma } from "../utils/context";
import { SendResponse } from "../utils/responseUtil";
import { PolicyNumberGenerator } from "../utils/idGenerator";
import { PolicyValidator } from "../utils/Validators/policyValidators";
import { createObject } from "../utils/objectCreator";
import uploadPolicyFiles from "../utils/uploadPolicyFiles";
import uploadFile from "../utils/upload";
const sendResponse = new SendResponse();
const validator = new PolicyValidator();

export class PolicyManagenetService {
  createPolicy = async (req: any, res: Response) => {
    try {
      const { name, policy_category_id } = req.body;
      //   Check Policy Existance
      if (await this.checkPolicyExistenceByName(name)) {
        return sendResponse[404](res, "Policy name already exists");
      }

      const policy = await prisma.policy.create({
        data: {
          name,
          policy_category_id: +policy_category_id,
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

      // Validator
      const validateInput = validator.updatePolicy.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not Found");
      }
      // Check Policy Category id
      if (req.body.policy_category_id) {
        const existanceCatrgory = await prisma.policy_category.findUnique({
          where: {
            id: +req.body.policy_category_id,
          },
        });
        if (!existanceCatrgory) {
          return sendResponse[404](res, "Policy Catrgoty ID not Found");
        }
      }

      const name_existance = await this.checkPolicyExistenceByName(name);
      if (name_existance && name_existance.id != id) {
        return sendResponse[404](res, "Policy name already exists");
      }

      // Generate Object for Update
      let newDataObject = createObject(validateInput.value);
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

      // Validations
      const validateInput = validator.checkPolicyId.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

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
      const { status }: any = req.query;

      const validateInput = validator.listPolicy.validate(req.query);
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
          created_user: {
            select: {
              name: true,
              photo: true,
              email: true,
            },
          },
          updated_user: {
            select: {
              name: true,
              photo: true,
              email: true,
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

      // Validations
      const validateInput = validator.checkPolicyId.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

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
          created_user: {
            select: {
              name: true,
              photo: true,
              email: true,
            },
          },
          updated_user: {
            select: {
              name: true,
              photo: true,
              email: true,
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
          id: +id,
        },
      });

      if (!policy) {
        return sendResponse[404](res, "Policy ID not Found");
      }

      await prisma.policy.update({
        where: {
          id: +id,
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

  policyStats = async (req: any, res: Response) => {
    try {
      const data = await prisma.policy.findMany({
        select: {
          id: true,
          status: true,
        },
      });

      const statusStats = data.reduce(
        (acc, policy) => {
          const status = policy.status;
          if (acc[status]) {
            acc[status]++;
          } else {
            acc[status] = 1;
          }
          return acc;
        },
        {
          Published: 0,
          Approved: 0,
          Pending: 0,
          Rejected: 0,
          Draft: 0,
          Archived: 0,
        }
      );
      sendResponse[200](res, statusStats);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  uploadFiles = async (req: any, res: Response) => {
    try {
      const files: any = req?.files;
      const { id } = req.query;

      // Validations
      const validateInput = validator.checkPolicyId.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not Found");
      }

      const response = await Promise.all(
        files.map(async (file) => {
          try {
            const url = await uploadPolicyFiles(file.path, "policy-docs");
            const res = await prisma.attachments.create({
              data: {
                name: file?.originalname,
                size: `${file?.size}`,
                type: `${file?.originalname.split(".")[1]}`,
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
            fs.unlinkSync(file.path);
            return res; // Return the created attachment
          } catch (error) {
            return sendResponse[500](res, error.message);
          }
        })
      );

      return sendResponse[200](res, response);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  uploadCoverPhoto = async (req: any, res: Response) => {
    try {
      const file: any = req?.file;
      const { id } = req.query;

      // Validations
      const validateInput = validator.checkPolicyId.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not Found");
      }
      try {
        const url = await uploadFile(file.path, "policy-docs");
        await prisma.policy.update({
          where: {
            id: +id,
          },
          data: {
            cover_image: url,
          },
        });
        await prisma.attachments.create({
          data: {
            name: file?.originalname,
            size: `${file?.size}`,
            type: `${file?.originalname.split(".")[1]}`,
            url,
            created_by: Number(req?.user.id),
          },
        });
        // Delete local files after upload to Cloudinary
        await fs.unlinkSync(file.path);
      } catch (error) {
        return sendResponse[500](res, error.message);
      }

      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  deletePolicyAttachment = async (req: Request, res: Response) => {
    try {
      const { attachchment_id } = req.query;
      const validateInput = validator.deleteAttachment.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }
      const policy = await prisma.attachments.findUnique({
        where: {
          id: +attachchment_id,
        },
      });

      if (!policy) {
        return sendResponse[404](res, "attachment ID not Found");
      }

      const response = await prisma.attachments.delete({
        where: {
          id: +attachchment_id,
        },
      });
      sendResponse[200](res, response);
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

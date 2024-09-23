import { Request, Response } from "express";
import fs from "fs";
import { prisma } from "../utils/context";
import { SendResponse } from "../utils/responseUtil";
import uploadPolicyFiles from "../utils/uploadPolicyFiles";
import ClientPolicyValidator from "../utils/Validators/clientPolicyValidators";
import { findPolicyWithLeastObjects } from "../utils/findAvailableAgent";
const sendResponse = new SendResponse();
const validator = new ClientPolicyValidator();

export class ClientPolicyManagenetService {
  viewClientPolicy = async (req: any, res: Response) => {
    try {
      const { client_email, policy_id } = req.query;

      const validateInput = validator.checkPolicyExistance.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const data = await prisma.client_policy.findFirst({
        where: {
          AND: {
            client_email,
            policy_id: Number(policy_id),
          },
        },
      });

      if (data) return sendResponse[200](res, data);
      return sendResponse[404](res, "Client not subscribed to a Policy");
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  createClientPolicy = async (req: any, res: Response) => {
    try {
      const { client_email, policy_id } = req.body;

      const validateInput = validator.checkPolicyExistance.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const checkExistance = await prisma.users.findFirst({
        where: {
          email: client_email,
        },
      });

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            policy_id: Number(policy_id),
            client_email,
          },
        },
      });

      if (!checkExistance) {
        return sendResponse[404](res, "No User Found");
      }

      if (!checkPolicyExistance) {
        return sendResponse[404](res, "Policy Does not exit");
      }

      if (checkExistance && checkPolicyExistance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Client Already Subscribed to Policy",
          data: checkPolicyExistance,
        });
      }

      const data = await prisma.client_policy.create({
        data: {
          client_email,
          policy_id: Number(policy_id),
          agent_id: await findPolicyWithLeastObjects(),
        },
      });

      return sendResponse[200](res, data);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  uploadFile = async (req: any, res: Response) => {
    try {
      const file: any = req?.file;
      const { client_policy_id, client_email, file_name } = req.query;

      // Validations
      const validateInput = validator.uploadClientPolicy.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      //   Check Existance
      const existance = await prisma.client_policy.findFirst({
        where: {
          id: Number(client_policy_id),
        },
      });
      if (!existance) {
        return sendResponse[404](res, "Client Policy record not Found");
      }

      try {
        const url = await uploadPolicyFiles(file.path, "client-policy-docs");
        const response = await prisma.attachments.create({
          data: {
            name: file_name,
            size: `${file?.size}`,
            type: `${file?.originalname.split(".")[1]}`,
            url,
            created_by: 1,
            client_files: {
              create: {
                client_email,
                client_policy_id: Number(client_policy_id),
              },
            },
          },
          include: {
            client_files: true,
          },
        });
        // Delete local file after upload to Cloudinary
        fs.unlinkSync(file.path);
        sendResponse[200](res, response); // Return the created attachment
      } catch (error) {
        return sendResponse[500](res, error.message);
      }
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  deleteFile = async (req: any, res: Response) => {
    try {
      const { client_file_id } = req.body;

      //   Check Existance
      const existance = await prisma.client_files.findFirst({
        where: {
          id: Number(client_file_id),
        },
      });
      if (!existance) {
        return sendResponse[404](res, "Client Policy file record not Found");
      }

      await prisma.client_files.delete({
        where: {
          id: Number(client_file_id),
        },
      });

      await prisma.attachments.delete({
        where: {
          id: Number(existance.attachment_id),
        },
      });

      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  agentDashboard = async (req: any, res: Response) => {
    try {
      const agent_id = req?.user.id;
      const { status } = req.query;

      if (req?.user.userType === "admin")
        return sendResponse[200](res, await this.listClientPolicy(status));

      const data = await this.listClientPolicy(status, agent_id);

      return sendResponse[200](res, data);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  clientDashboard = async (req: any, res: Response) => {
    try {
      const { email } = req?.user;
      const { status } = req.query;
      const data = await prisma.client_policy.findMany({
        where: {
          AND: {
            client_email: email,
            status,
          },
        },
        include: {
          policy: true,
          agent: true,
          client_files: {
            select: {
              attachment: {
                select: {
                  url: true,
                  name: true,
                  size: true,
                  type: true,
                },
              },
            },
          },
        },
      });
      sendResponse[200](res, data);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  reassignAgent = async (req: any, res: Response) => {
    try {
      const { client_policy_id, agent_id } = req.body;
      await prisma.client_policy.update({
        where: {
          id: Number(client_policy_id),
        },
        data: {
          agent_id: Number(agent_id),
        },
      });
      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  toggleStatus = async (req: any, res: Response) => {
    try {
      const { client_policy_id, status } = req.body;

      // Validations
      const validateInput = validator.toggleStaus.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            id: Number(client_policy_id),
          },
        },
      });

      if (!checkPolicyExistance) {
        return sendResponse[404](res, "Policy Does not exit");
      }

      await prisma.client_policy.update({
        where: {
          id: Number(client_policy_id),
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

  rejectPolicy = async (req: any, res: Response) => {
    try {
      const { client_policy_id, rejection_reason } = req.body;

      // Validations
      const validateInput = validator.rejectPolicy.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            id: Number(client_policy_id),
          },
        },
      });

      if (!checkPolicyExistance) {
        return sendResponse[404](res, "Policy Does not exit");
      }

      await prisma.client_policy.update({
        where: {
          id: Number(client_policy_id),
        },
        data: {
          rejection_reason,
          status: "Rejected",
        },
      });
      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  confirmPolicy = async (req: any, res: Response) => {
    try {
      const { client_policy_id } = req.body;

      // Validations
      const validateInput = validator.confirmPolicy.validate(req.body);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            id: Number(client_policy_id),
          },
        },
      });

      if (!checkPolicyExistance) {
        return sendResponse[404](res, "Policy Does not exit");
      }

      await prisma.client_policy.update({
        where: {
          id: Number(client_policy_id),
        },
        data: {
          status: "Pending_Review",
        },
      });
      sendResponse[200](res, null);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  getPolicyDetails = async (req: any, res: Response) => {
    try {
      const { client_policy_id } = req.query;

      // Validations
      const validateInput = validator.confirmPolicy.validate(req.query);
      if (validateInput.error) {
        return sendResponse[400](res, `${validateInput.error.message}`);
      }

      const checkPolicyExistance = await prisma.client_policy.findFirst({
        where: {
          AND: {
            id: Number(client_policy_id),
          },
        },
        include: {
          agent: true,
          client_files: {
            select: {
              attachment: {
                select: {
                  url: true,
                  name: true,
                  size: true,
                  type: true,
                },
              },
            },
          },
          policy: true,
        },
      });

      if (!checkPolicyExistance) {
        return sendResponse[404](res, "Policy Does not exit");
      }

      sendResponse[200](res, checkPolicyExistance);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  private listClientPolicy = async (status, agent_id = undefined) => {
    return await prisma.client_policy.findMany({
      where: {
        AND: {
          agent_id: agent_id ? Number(agent_id) : undefined,
          status,
        },
      },
      include: {
        policy: true,
        client_files: {
          select: {
            attachment: {
              select: {
                url: true,
                name: true,
                size: true,
                type: true,
              },
            },
          },
        },
        client_details: true,
      },
    });
  };
}

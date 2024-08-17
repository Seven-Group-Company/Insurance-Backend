import { Request, Response } from "express";
import { prisma } from "../utils/context";
import { SendResponse } from "../utils/responseUtil";
const sendResponse = new SendResponse();

export class PolicyCategoryService {
  createPolicyCategory = async (req: any, res: Response) => {
    try {
      const { name, description } = req.body;

      //   Check Policy Existance
      if (await this.checkPolicyExistenceByName(name)) {
        return sendResponse[404](res, "Policy category name already exists");
      }

      const policyCategory = await prisma.policy_category.create({
        data: {
          name,
          description,
          created_by: Number(req?.user.id),
        },
      });
      sendResponse[200](res, policyCategory);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  updatePolicyCategory = async (req: any, res: Response) => {
    try {
      const { id, name, description } = req.body;

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy category ID not Found");
      }

      const name_existance = await this.checkPolicyExistenceByName(name);
      if (name_existance && name_existance.id != id) {
        return sendResponse[404](res, "Policy category name already exists");
      }

      const policyCategory = await prisma.policy_category.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description,
          updated_by: Number(req?.user.id),
          updated_at: new Date(),
        },
      });
      sendResponse[200](res, policyCategory);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  deletePolicyCategory = async (req: any, res: Response) => {
    try {
      const { id } = req.query;

      // Check Existance
      const checkExistance = await this.checkPolicyExistenceByyId(id);

      if (!checkExistance) {
        return sendResponse[404](res, "Policy category Not Found");
      }

      const policyCategory = await prisma.policy_category.delete({
        where: {
          id: Number(id),
        },
      });
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Policy Category deleted Succesfully",
        data: policyCategory,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Policy Category failed to delete",
        data: null,
        error: error.message,
      });
    }
  };
  listPolicyCategory = async (req: Request, res: Response) => {
    try {
      const policyCategory = await prisma.policy_category.findMany();
      sendResponse[200](res, policyCategory);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };

  private checkPolicyExistenceByName = async (name: string) => {
    try {
      const policy = await prisma.policy_category.findUnique({
        where: { name },
      });
      return policy;
    } catch (error) {
      return false;
    }
  };
  private checkPolicyExistenceByyId = async (id: string | number) => {
    try {
      const policy = await prisma.policy_category.findUnique({
        where: { id: Number(id) },
      });
      return policy;
    } catch (error) {
      return false;
    }
  };
}

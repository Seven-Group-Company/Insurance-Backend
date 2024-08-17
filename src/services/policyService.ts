import { Request, Response } from "express";
import { prisma } from "../utils/context";
import { SendResponse } from "../utils/responseUtil";
const sendResponse = new SendResponse();

export class PolicyManagenetService {
  createPolicy = async (req: any, res: Response) => {
    try {
      const {
        name,
        description,
        code,
        eligibility_criteria,
        coverage_details,
        documents_required,
        policy_category_id,
      } = req.body;
      //   Check Policy Existance
      if (await this.checkPolicyExistenceByName(name)) {
        return sendResponse[404](res, "Policy name already exists");
      }

      const policy = await prisma.policy.create({
        data: {
          name,
          description,
          code,
          eligibility_criteria,
          coverage_details,
          documents_required,
          policy_category_id: Number(policy_category_id),
          created_by: Number(req?.user.id),
        },
      });
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  duplicatePolicy = async (req: any, res: Response) => {
    try {
      const { id, name } = req.body;
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
          code: existance.code,
          eligibility_criteria: existance.eligibility_criteria,
          coverage_details: existance.coverage_details,
          documents_required: existance.documents_required,
          policy_category_id: existance.policy_category_id,
          created_by: Number(req?.user.id),
        },
      });
      sendResponse[200](res, policy);
    } catch (error) {
      return sendResponse[500](res, error.message);
    }
  };
  updatePolicy = async (req: any, res: Response) => {
    try {
      const {
        id,
        name,
        description,
        code,
        eligibility_criteria,
        coverage_details,
        documents_required,
        policy_category_id,
      } = req.body;

      //   Check Existance
      const existance = await this.checkPolicyExistenceByyId(id);
      if (!existance) {
        return sendResponse[404](res, "Policy ID not Found");
      }

      const name_existance = await this.checkPolicyExistenceByName(name);
      if (name_existance && name_existance.id != id) {
        return sendResponse[404](res, "Policy name already exists");
      }

      const policy = await prisma.policy.update({
        where: {
          id: Number(id),
        },
        data: {
          name: name === existance.name ? undefined : name,
          description,
          code,
          eligibility_criteria,
          coverage_details,
          documents_required,
          policy_category_id: +policy_category_id,
          updated_by: Number(req?.user.id),
          updated_at: new Date(),
        },
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
      const policy = await prisma.policy.findMany();
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
      });

      if (!policy) {
        return sendResponse[404](res, "Policy ID not Found");
      }
      sendResponse[200](res, policy);
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

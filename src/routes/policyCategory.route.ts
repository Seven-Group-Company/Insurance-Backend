import { Router } from "express";
import { Permissions } from "../middlewares/authorization";
import { PolicyCategoryService } from "../services/policyCategoryService";
const permission = new Permissions();

export const policyCategoryRouter = Router();

const policyCatService = new PolicyCategoryService();

policyCategoryRouter.post(
  "/create",
  [permission.protect],
  policyCatService.createPolicyCategory
);
policyCategoryRouter.put(
  "/update",
  [permission.protect],
  policyCatService.updatePolicyCategory
);
policyCategoryRouter.delete(
  "/delete",
  [permission.protect],
  policyCatService.deletePolicyCategory
);
policyCategoryRouter.get(
  "/list",
  [permission.protect],
  policyCatService.listPolicyCategory
);
policyCategoryRouter.get(
  "/list-homepage",
  policyCatService.listPolicyCategoryForHome
);

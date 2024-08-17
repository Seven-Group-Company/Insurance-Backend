import { Router } from "express";
import { Permissions } from "../middlewares/authorization";
import { PolicyManagenetService } from "../services/policyService";
const permission = new Permissions();

export const policyRouter = Router();

const policy = new PolicyManagenetService();

policyRouter.post("/create", [permission.protect], policy.createPolicy);
policyRouter.post("/duplicate", [permission.protect], policy.duplicatePolicy);
policyRouter.put("/update", [permission.protect], policy.updatePolicy);
policyRouter.delete("/delete", [permission.protect], policy.deletePolicy);
policyRouter.get("/list", [permission.protect], policy.listPolicy);
policyRouter.get("/get", [permission.protect], policy.getPolicy);

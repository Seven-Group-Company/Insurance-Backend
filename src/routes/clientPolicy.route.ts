import { Router } from "express";
import multer from "multer";
import path from "path";
import { Permissions } from "../middlewares/authorization";
import { ClientPolicyManagenetService } from "../services/clientPolicyService";
const permission = new Permissions();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/policy",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
}).array("files", 10);
const upload1 = multer({
  storage: storage,
}).single("file");

export const clientPolicyRouter = Router();

const clientPolicy = new ClientPolicyManagenetService();

clientPolicyRouter.get("/view-client-policy", clientPolicy.viewClientPolicy);

clientPolicyRouter.get(
  "/get-client-policy-details",
  [permission.protect],
  clientPolicy.getPolicyDetails
);

clientPolicyRouter.post(
  "/create-client-policy",
  clientPolicy.createClientPolicy
);

clientPolicyRouter.get(
  "/agent-dashboard",
  [permission.protect, permission.verifyAgent],
  clientPolicy.agentDashboard
);

clientPolicyRouter.get(
  "/client-dashboard",
  [permission.protect],
  clientPolicy.clientDashboard
);

clientPolicyRouter.put(
  "/assign-agent",
  [permission.protect],
  clientPolicy.reassignAgent
);

clientPolicyRouter.put(
  "/toggle-status",
  [permission.protect],
  clientPolicy.toggleStatus
);

clientPolicyRouter.put(
  "/reject-policy",
  [permission.protect],
  clientPolicy.rejectPolicy
);

clientPolicyRouter.put(
  "/confirm-policy",
  [permission.protect],
  clientPolicy.confirmPolicy
);

clientPolicyRouter.delete(
  "/delete-policy-file",
  [permission.protect],
  clientPolicy.deleteFile
);

clientPolicyRouter.post("/upload-file", [upload1], clientPolicy.uploadFile);

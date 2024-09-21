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

clientPolicyRouter.post(
  "/create-client-policy",
  clientPolicy.createClientPolicy
);

clientPolicyRouter.get(
  "/agent-dashboard",
  [permission.protect],
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

clientPolicyRouter.post("/upload-file", [upload1], clientPolicy.uploadFile);

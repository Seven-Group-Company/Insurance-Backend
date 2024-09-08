import { Router } from "express";
import multer from "multer";
import path from "path";
import { Permissions } from "../middlewares/authorization";
import { PolicyManagenetService } from "../services/policyService";
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
}).array("files", 10); // Accept up to 10 files
const upload1 = multer({
  storage: storage,
}).single("file"); // Accept up to 10 files

export const policyRouter = Router();

const policy = new PolicyManagenetService();

policyRouter.post("/create", [permission.protect], policy.createPolicy);
policyRouter.post("/duplicate", [permission.protect], policy.duplicatePolicy);
policyRouter.put("/update", [permission.protect], policy.updatePolicy);
policyRouter.put("/toggle-status", [permission.protect], policy.toggleStatus);
policyRouter.delete("/delete", [permission.protect], policy.deletePolicy);
policyRouter.delete(
  "/delete-attachment",
  [permission.protect],
  policy.deletePolicyAttachment
);
policyRouter.get("/list", [permission.protect], policy.listPolicy);
policyRouter.get("/list-homepage", policy.listPolicyHomePage);
policyRouter.get("/get", [permission.protect], policy.getPolicy);
policyRouter.get("/get-homepage", policy.getPolicy);
policyRouter.get("/stats", [permission.protect], policy.policyStats);
policyRouter.post(
  "/upload-files",
  [permission.protect, upload],
  policy.uploadFiles
);
policyRouter.post(
  "/upload-cover-photo",
  [permission.protect, upload1],
  policy.uploadCoverPhoto
);

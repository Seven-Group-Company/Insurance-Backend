import express from "express";
import * as dotenv from "dotenv";
import { landingRouter } from "./routes/landingPage.route";
import { usersRouter } from "./routes/users.route";
import { accessRouter } from "./routes/accessLevel.route";
import cors from "cors";
import { positionRouter } from "./routes/position.route";
import { policyCategoryRouter } from "./routes/policyCategory.route";
import { policyRouter } from "./routes/policy.routes";

dotenv.config();
const app = express();
const port = process.env.port || 8000;
app.use(express.json());

app.use(cors());
app.use("/", landingRouter);
app.use("/user", usersRouter);
app.use("/access-level", accessRouter);
app.use("/position", positionRouter);
app.use("/policy-category", policyCategoryRouter);
app.use("/policy", policyRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

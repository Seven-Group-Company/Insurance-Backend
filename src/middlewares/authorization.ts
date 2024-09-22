import { Request, Response, NextFunction } from "express";

import JWT from "jsonwebtoken";
import { SendResponse } from "../utils/responseUtil";

export class Permissions {
  protect = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Not authorized. Token not found", data: null });

    try {
      const decoded = JWT.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Session Expired", data: "Session Expired" });
    }
  };

  verifyAgent = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Not authorized. Token not found", data: null });

    try {
      const decoded = JWT.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      if (decoded?.isAgent || decoded?.userType === "admin") {
        next();
      } else {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Not authorized to view client policy",
          data: null,
          error: null,
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Not authorized to view client policy",
        data: null,
        error: null,
      });
    }
  };
}

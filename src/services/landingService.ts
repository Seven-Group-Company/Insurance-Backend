import { Request, Response } from "express";

export class LandingPage {
  getPage = async (req: Request, res: Response) => {
    res.status(200).json({
      message: "Welcome to the SGC - landing",
    });
  };
}

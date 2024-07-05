import { Request, Response } from "express";
import { prisma } from "../utils/context";

export class AccessLevelService {
  createAccessLevel = async (req: Request, res: Response) => {
    const { name, description, permissions, createdBy, assignedUsers } =
      req.body;
    try {
      const response = await prisma.accessLevel.create({
        data: {
          name,
          description,
          createdBy,
          permissions,
        },
      });

      if (assignedUsers) {
        const assignUsers = await prisma.users.updateMany({
          where: {
            id: {
              in: assignedUsers,
            },
          },
          data: {
            accessLevelId: response.id,
          },
        });
      }

      const data = await prisma.accessLevel.findMany({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      res
        .status(200)
        .json({ message: "Access Level Created Succesfully", data: data });
    } catch (error: any) {
      return res.status(500).json({
        message: "Access Level failed to create",
        data: error.message,
      });
    }
  };

  updateAccessLevel = async (req: Request, res: Response) => {
    const { id, name, description, permissions, createdBy, assignedUsers } =
      req.body;
    try {
      const response = await prisma.accessLevel.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          createdBy,
          permissions,
        },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (assignedUsers) {
        await prisma.users.updateMany({
          where: {
            id: {
              in: assignedUsers,
            },
          },
          data: {
            accessLevelId: response.id,
          },
        });
      }
      res
        .status(200)
        .json({ message: "Access Level updated Succesfully", data: response });
    } catch (error: any) {
      return res.status(500).json({
        message: "Access Level failed to create",
        data: error.message,
      });
    }
  };

  listAllAccessLevel = async (req: Request, res: Response) => {
    try {
      const data = await prisma.accessLevel.findMany({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
          name: true,
          description: true,
          permissions: true,
          users: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      res.status(200).json({ message: "Operation successful", data: data });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Operation Failed", data: error.message });
    }
  };

  assignAccessLevelToUser = async (req: Request, res: Response) => {
    const { user_id, access_level_id } = req.body;
    try {
      const assign = await prisma.users.update({
        where: {
          id: user_id,
        },
        data: {
          accessLevel: access_level_id,
        },
      });
      if (!assign) {
        res.status(500).json({ message: "Invalid User Id" });
      }
      res.status(200).json({ message: "Operation successful" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Operation Failed", data: error.message });
    }
  };

  deleteAccessLevel = async (req: Request, res: Response) => {
    const { id } = req.body;
    try {
      const unAssign = await prisma.users.updateMany({
        where: {
          accessLevelId: id,
        },
        data: {
          accessLevelId: null,
        },
      });
      const deleteAccess = await prisma.accessLevel.delete({ where: { id } });
      if (!deleteAccess) {
        res.status(500).json({ message: "Invalid Access Level Id" });
      }
      this.listAllAccessLevel(req, res);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Operation Failed", data: error.message });
    }
  };
}

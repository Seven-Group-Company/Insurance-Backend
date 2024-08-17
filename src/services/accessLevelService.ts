import { Request, Response } from "express";
import { prisma } from "../utils/context";

export class AccessLevelService {
  createAccessLevel = async (req: any, res: Response) => {
    const { name, description, permissions, createdBy, assignedUsers } =
      req.body;
    try {
      const checkExistance = await prisma.accessLevel.findUnique({
        where: {
          name,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (checkExistance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Access Level name already exists",
          data: null,
        });
      }

      const response = await prisma.accessLevel.create({
        data: {
          name,
          description,
          createdBy: Number(req?.user.id),
          permissions,
        },
      });

      if (assignedUsers) {
        await prisma.users.updateMany({
          where: {
            email: {
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
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Access Level Created Succesfully",
        data: data,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Access Level failed to create",
        data: null,
        error: error.message,
      });
    }
  };

  updateAccessLevel = async (req: any, res: Response) => {
    const { id, name, description, permissions, updatedBy, assignedUsers } =
      req.body;
    try {
      const response = await prisma.accessLevel.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          description,
          permissions,
          updatedBy: Number(req?.user.id),
          updatedAt: new Date(),
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
      await prisma.users.updateMany({
        where: {
          accessLevelId: Number(id),
        },
        data: {
          accessLevelId: null,
        },
      });
      if (assignedUsers.length > 0) {
        await prisma.users.updateMany({
          where: {
            email: {
              in: assignedUsers,
            },
          },
          data: {
            accessLevelId: response.id,
          },
        });
      } else if (assignedUsers.length == 0) {
        await prisma.users.updateMany({
          where: {
            accessLevelId: Number(id),
          },
          data: {
            accessLevelId: null,
          },
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Access Level updated Succesfully",
        data: response,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Access Level failed to update",
        data: null,
        error: error.message,
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
              email: true,
              photo: true,
            },
          },
        },
      });
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Access Level failed to fetch",
        data: null,
        error: error.message,
      });
    }
  };
  getAccessLevel = async (req: Request, res: Response) => {
    try {
      const { id } = req.query;
      const data = await prisma.accessLevel.findUnique({
        where: {
          id: Number(id),
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
              email: true,
              photo: true,
            },
          },
        },
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Access Level Id not found",
          data: data,
        });
      }
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Access Level failed to fetch",
        data: null,
        error: error.message,
      });
    }
  };

  assignAccessLevelToUser = async (req: Request, res: Response) => {
    const { email, access_level_id } = req.body;
    try {
      const checkExistance = await prisma.users.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
        },
      });
      if (!checkExistance) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "User Not found",
          data: null,
        });
      }
      const assign = await prisma.users.update({
        where: {
          email,
        },
        data: {
          accessLevelId: Number(access_level_id),
        },
      });
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Operation Successful",
        data: assign,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to assign access level to Users",
        data: null,
        error: error.message,
      });
    }
  };

  deleteAccessLevel = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
      const unAssign = await prisma.users.updateMany({
        where: {
          accessLevelId: Number(id),
        },
        data: {
          accessLevelId: null,
        },
      });
      const deleteAccess = await prisma.accessLevel.delete({
        where: { id: Number(id) },
      });
      if (!deleteAccess) {
        res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Invalid Access Level Id",
          data: null,
        });
      }
      this.listAllAccessLevel(req, res);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "Failed to delete Access Level",
        data: null,
        error: error.message,
      });
    }
  };
}

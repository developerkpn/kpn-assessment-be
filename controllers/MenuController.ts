import { getAdminMenu, getAllMenu } from "@/models/MenuModel.js";
import { NextFunction, Request, Response } from "express";
import { Validation } from "@/validation/Validation.js";
import { MenuValidation } from "@/validation/MenuValidation.js";

export const handleGetAdminMenu = async (req: Request, res: Response, next: NextFunction) => {
  const roleId = String(req.userDecode?.role_id);
  try {
    const validatedRoleId = Validation.validate(MenuValidation.ID, roleId);
    let result = await getAdminMenu(validatedRoleId);
    const groupedData = result.reduce((acc: any, item: any) => {
      const key = item.subheader || "Others"; // Use "Others" for null subheaders
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        name: item.name,
        path: item.path,
        icon: item.icon,
        is_active: item.is_active,
        position: item.position,
        fcreate: item.fcreate,
        fread: item.fread,
        fupdate: item.fupdate,
        fdelete: item.fdelete,
      });
      return acc;
    }, {});

    const sortedEntries = Object.entries(groupedData).sort(([aKey], [bKey]) => {
      if (aKey === "Others") return -1;
      if (bKey === "Others") return 1;
      return 0;
    });

    const formattedResult = sortedEntries.map(([subheader, items]) => {
      const group: { items: unknown; subheader?: string } = { items };
      if (subheader !== "Others") {
        group.subheader = subheader;
      }
      return group;
    });

    // ADD DASHBOARD
    formattedResult.unshift({
      items: [{ name: "Dashboard", path: "/admin", icon: "Home" }],
    });

    res.status(200).send({
      message: `Success get menu`,
      data: formattedResult,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAllMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllMenu();

    res.status(200).send({
      message: `Success get all menu`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

import {
  createUniversalLink,
  deleteUniversalLink,
  getUniversalLinkBySlug,
  getUniversalLinks,
  updateUniversalLink,
} from "@/models/UniversalLinkModel.js";
import { ResponseError } from "@/error/response-error.js";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const validateSlug = (slug: unknown): string => {
  const value = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!value || value.length > 100 || !SLUG_PATTERN.test(value)) {
    throw new ResponseError(400, "Slug must be lowercase letters, numbers, and dashes (e.g. cg-july-2026)");
  }
  return value;
};

export const handleGetUniversalLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getUniversalLinks();
    res.status(200).send({
      message: "Success get universal links",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleCreateUniversalLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const link_name = String(req.body.link_name ?? "").trim();
    if (!link_name) {
      throw new ResponseError(400, "Link name is required");
    }
    const slug = validateSlug(req.body.slug);

    const existing = await getUniversalLinkBySlug(slug);
    if (existing) {
      throw new ResponseError(400, "Slug is already used");
    }

    const payload = {
      id: uuidv4(),
      link_name,
      slug,
      is_active: req.body.is_active ?? true,
      created_by: req.userDecode?.user_id ?? null,
      created_at: new Date(),
    };

    const result = await createUniversalLink(payload);
    res.status(201).send({
      message: "Success create universal link",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateUniversalLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const payload: any = {
      updated_by: req.userDecode?.user_id ?? null,
      updated_at: new Date(),
    };

    if (req.body.link_name !== undefined) {
      const link_name = String(req.body.link_name).trim();
      if (!link_name) {
        throw new ResponseError(400, "Link name is required");
      }
      payload.link_name = link_name;
    }
    if (req.body.slug !== undefined) {
      const slug = validateSlug(req.body.slug);
      const existing = await getUniversalLinkBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ResponseError(400, "Slug is already used");
      }
      payload.slug = slug;
    }
    if (req.body.is_active !== undefined) {
      payload.is_active = Boolean(req.body.is_active);
    }

    const updated = await updateUniversalLink(id, payload);
    if (!updated) {
      throw new ResponseError(404, "Universal link not found");
    }
    res.status(200).send({
      message: "Success update universal link",
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteUniversalLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteUniversalLink(req.params.id);
    res.status(200).send({
      message: "Success delete universal link",
    });
  } catch (e) {
    next(e);
  }
};

// Public endpoint (no auth) — used by the /join/:slug client page
export const handleGetPublicUniversalLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug ?? "")
      .trim()
      .toLowerCase();
    const link = await getUniversalLinkBySlug(slug);
    if (!link || !link.is_active) {
      res.status(404).send({
        message: "This link is not available",
      });
      return;
    }
    res.status(200).send({
      message: "Success!",
      data: { link_name: link.link_name, slug: link.slug },
    });
  } catch (e) {
    next(e);
  }
};

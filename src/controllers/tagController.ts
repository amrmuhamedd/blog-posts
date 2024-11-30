import { Request, Response } from "express";
import { prisma } from "../prisma";
import { BasResponse } from "../types/responses/baseResponse";
import { CreateTagDto, UpdateTagDto } from "../dto/tag.dto";

export const createTag = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const data = req.body as CreateTagDto;
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return res.status(201).json({ data: tag });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    console.error("Error creating tag:", error);
    return res.status(500).json({ error: "Failed to create tag" });
  }
};

export const listTags = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const { page = 1, pageSize = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where = search ? {
      name: {
        contains: String(search),
        mode: 'insensitive'
      }
    } : {};

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        skip,
        take: Number(pageSize),
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.tag.count({ where })
    ]);

    return res.status(200).json({
      data: {
        items: tags,
        page: Number(page),
        pageSize: Number(pageSize),
        total
      }
    });
  } catch (error) {
    console.error("Error listing tags:", error);
    return res.status(500).json({ error: "Failed to retrieve tags" });
  }
};

export const updateTag = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateTagDto;

    const tag = await prisma.tag.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description,
        updated_at: new Date()
      }
    });

    return res.status(200).json({ data: tag });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    console.error("Error updating tag:", error);
    return res.status(500).json({ error: "Failed to update tag" });
  }
};

export const deleteTag = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id: Number(id) }
    });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting tag:", error);
    return res.status(500).json({ error: "Failed to delete tag" });
  }
};

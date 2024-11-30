import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BasResponse } from "../types/responses/baseResponse";
import { CreateTagDto, UpdateTagDto } from "../dto/tag.dto";

const prisma = new PrismaClient();

export const createTag = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const data = req.body as CreateTagDto;
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
      },
    });
    return res.status(201).json({ data: tag });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tag name already exists" });
    }
    return res.status(500).json({ error: "Failed to create tag" });
  }
};

export const listTags = async (
  req: Request,
  res: Response
): Promise<BasResponse<any>> => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });
    return res.status(200).json({ data: tags });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tags" });
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
      },
    });
    return res.status(200).json({ data: tag });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Tag name already exists" });
    }
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
      where: { id: Number(id) },
    });
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete tag" });
  }
};

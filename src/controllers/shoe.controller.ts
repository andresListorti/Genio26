import { Request, Response, NextFunction } from 'express';
import { shoeService } from '../services/shoe.service';

export const shoeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const shoes = await shoeService.findAll();
      res.json({ data: shoes });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const shoe = await shoeService.findById(String(req.params.id));
      if (!shoe) {
        return res.status(404).json({ error: 'Shoe not found' });
      }
      res.json({ data: shoe });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { brand, model, price, description, variants } = req.body ?? {};
      if (!brand || !model || typeof price !== 'number' || !description) {
        return res
          .status(400)
          .json({ error: 'brand, model, price, description are required' });
      }
      const shoe = await shoeService.create({
        brand,
        model,
        price,
        description,
        currency: req.body.currency,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
        variants: Array.isArray(variants) ? variants : [],
      });
      res.status(201).json({ data: shoe });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await shoeService.update(String(req.params.id), req.body ?? {});
      if (!updated) {
        return res.status(404).json({ error: 'Shoe not found' });
      }
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const ok = await shoeService.remove(String(req.params.id));
      if (!ok) {
        return res.status(404).json({ error: 'Shoe not found' });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

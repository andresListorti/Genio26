import { Request, Response, NextFunction } from 'express';
import { shoeService } from '../services/shoe.service';

export const shoeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const genderParam = String(req.query.gender ?? '').toLowerCase();
      const gender =
        genderParam === 'men' || genderParam === 'women'
          ? (genderParam as 'men' | 'women')
          : undefined;
      const shoes = await shoeService.findAll(gender ? { gender } : undefined);
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
      const { brand, model, price, description, variants, gender } =
        req.body ?? {};
      if (!brand || !model || typeof price !== 'number' || !description) {
        return res
          .status(400)
          .json({ error: 'brand, model, price, description are required' });
      }
      if (gender !== 'men' && gender !== 'women') {
        return res
          .status(400)
          .json({ error: "gender is required and must be 'men' or 'women'" });
      }
      const shoe = await shoeService.create({
        brand,
        model,
        price,
        description,
        currency: req.body.currency,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
        gender,
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

import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service';

export const cartController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.create(req.body?.userId);
      res.status(201).json({ data: cart });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.findById(String(req.params.id));
      if (!cart) return res.status(404).json({ error: 'Cart not found' });
      res.json({ data: cart });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { shoeId, size, color, quantity } = req.body ?? {};
      if (!shoeId || typeof size !== 'number' || !color || !quantity) {
        return res
          .status(400)
          .json({ error: 'shoeId, size, color, quantity are required' });
      }
      const cart = await cartService.addItem(String(req.params.id), {
        shoeId,
        size,
        color,
        quantity,
      });
      res.json({ data: cart });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { shoeId, size, color } = req.body ?? {};
      if (!shoeId || typeof size !== 'number' || !color) {
        return res
          .status(400)
          .json({ error: 'shoeId, size, color are required' });
      }
      const cart = await cartService.removeItem(
        String(req.params.id),
        shoeId,
        size,
        color,
      );
      res.json({ data: cart });
    } catch (err) {
      next(err);
    }
  },

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clear(String(req.params.id));
      res.json({ data: cart });
    } catch (err) {
      next(err);
    }
  },
};

import express from 'express';

import { ResponseCodes } from '../../common/constants/responsecodes.enum';
import userService from '../services/users.service';

class UsersMiddleware {
  private static instance: UsersMiddleware;

  static getInstance() {
    if (!UsersMiddleware.instance) {
      UsersMiddleware.instance = new UsersMiddleware();
    }
    return UsersMiddleware.instance;
  }

  async validateRequiredUserBodyFields(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.email && req.body.password) {
      next();
    } else {
      res
        .status(ResponseCodes.BAD_REQUEST)
        .send({ error: `Missing required fields: email and/or password` });
    }
  }

  async validateUniqueEmail(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
      res.status(ResponseCodes.BAD_REQUEST).send({ error: 'User email already exists' });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);
    if (user && user.id === req.params.userId) {
      next();
    } else {
      res.status(ResponseCodes.BAD_REQUEST).send({ error: `Invalid email` });
    }
  }

  async userCantChangePermission(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (res.locals.user.permissionLevel !== req.body.permissionLevel) {
      res.status(400).send({
        errors: ['User cannot change permission level']
      });
    } else {
      next();
    }
  }

  async validatePatchEmail(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body.email) {
      UsersMiddleware.getInstance().validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  }

  async validateUserExists(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.readById(req.params.userId);
    if (user) {
      next();
    } else {
      res.status(ResponseCodes.NOT_FOUND).send({ error: `User ${req.params.userId} not found` });
    }
  }

  async extractUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.body.id = req.params.userId;
    next();
  }
}

export default UsersMiddleware.getInstance();

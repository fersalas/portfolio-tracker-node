import express from 'express';
import * as argon2 from 'argon2';

import usersService from '../../users/services/users.service';
import { ResponseCodes } from '../../common/constants/responsecodes.enum';
class AuthMiddleware {
  async validateBodyRequest(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.email && req.body.password) {
      next();
    } else {
      res.status(ResponseCodes.BAD_REQUEST).send({
        errors: ['Missing required fields: email and password']
      });
    }
  }

  async verifyUserPassword(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user: any = await usersService.getUserByEmailWithPassword(req.body.email);
    if (user) {
      const passwordHash = user.password;
      if (await argon2.verify(passwordHash, req.body.password)) {
        req.body = {
          userId: user._id,
          email: user.email,
          provider: 'email',
          permissionLevel: user.permissionLevel
        };
        return next();
      } else {
        res.status(ResponseCodes.BAD_REQUEST).send({
          errors: ['Invalid email and/or password']
        });
      }
    } else {
      res.status(ResponseCodes.BAD_REQUEST).send({ errors: ['Invalid email and/or password'] });
    }
  }
}

export default new AuthMiddleware();

import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ResponseCodes } from '../../common/constants/responsecodes.enum';
import { Jwt } from '../../common/types/jwt';
import usersService from '../../users/services/users.service';

// @ts-expect-error Env variable
const jwtSecret: string = process.env.JWT_SECRET;

class JwtMiddleware {
  verifyRefreshBodyField(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(ResponseCodes.BAD_REQUEST)
        .send({ errors: ['Missing required field: refreshToken'] });
    }
  }

  async validRefreshNeeded(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user: any = await usersService.getUserByEmailWithPassword(res.locals.jwt.email);
    const salt = crypto.createSecretKey(Buffer.from(res.locals.jwt.refreshKey.data));
    const hash = crypto
      .createHmac('sha512', salt)
      .update(res.locals.jwt.userId + jwtSecret)
      .digest('base64');
    if (hash === req.body.refreshToken) {
      req.body = {
        userId: user._id,
        email: user.email,
        provider: 'email',
        permissionLevel: user.permissionLevel
      };
      return next();
    } else {
      return res.status(ResponseCodes.BAD_REQUEST).send({ errors: ['Invalid refresh token'] });
    }
  }

  validJWTNeeded(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(ResponseCodes.UNAUTHORIZED).send();
        } else {
          res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as Jwt;
          next();
        }
      } catch (err) {
        return res.status(ResponseCodes.FORBIDDEN).send({ errors: ['Access Forbidden'] });
      }
    } else {
      return res.status(ResponseCodes.UNAUTHORIZED).send({ errors: ['User not authorized'] });
    }
  }
}

export default new JwtMiddleware();

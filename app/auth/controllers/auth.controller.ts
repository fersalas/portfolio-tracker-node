import express from 'express';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ResponseCodes } from '../../common/constants/responsecodes.enum';

const log: debug.IDebugger = debug('app:auth-controller');

// @ts-expect-error Env variable
const jwtSecret: string = process.env.JWT_SECRET;
const tokenExpirationInSeconds = 36000;

class AuthController {
  async createJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto.createHmac('sha512', salt).update(refreshId).digest('base64');
      req.body.refreshKey = salt.export();
      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds
      });
      return res.status(ResponseCodes.CREATED).send({ accessToken: token, refreshToken: hash });
    } catch (err) {
      log('createJWT error: %O', err);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).send();
    }
  }
}

export default new AuthController();

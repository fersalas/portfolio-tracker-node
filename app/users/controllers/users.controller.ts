import * as express from 'express';
import argon2 from 'argon2';
import debug from 'debug';

import { ResponseCodes } from '../../common/constants/responsecodes.enum';
import usersService from '../services/users.service';
import { PatchUserDto } from '../dto/patch.user.dto';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {
  private static instance: UsersController;

  static getInstance(): UsersController {
    if (!UsersController.instance) {
      UsersController.instance = new UsersController();
    }

    return UsersController.instance;
  }

  async listUsers(req: express.Request, res: express.Response) {
    const users = await usersService.list(100, 0);
    res.status(ResponseCodes.SUCCESS).send(users);
  }

  async getUserById(req: express.Request, res: express.Response) {
    const user = await usersService.readById(req.params.userId);
    res.status(ResponseCodes.SUCCESS).send(user);
  }

  async createUser(req: express.Request, res: express.Response) {
    const newUser = {
      ...req.body,
      password: await argon2.hash(req.body.password)
    };
    const userId = await usersService.create(newUser);
    res.status(ResponseCodes.CREATED).send({ id: userId });
  }

  async patch(req: express.Request, res: express.Response) {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password);
    }

    log(await usersService.patchById(req.params.userId, req.body));
    res.status(ResponseCodes.NO_CONTENT).send('');
  }

  async put(req: express.Request, res: express.Response) {
    req.body.password = await argon2.hash(req.body.password);
    log(await usersService.putById(req.params.userId, req.body));
    res.status(ResponseCodes.NO_CONTENT).send('');
  }

  async removeUser(req: express.Request, res: express.Response) {
    log(await usersService.deleteById(req.params.userId));
    res.status(ResponseCodes.NO_CONTENT).send(``);
  }

  async updatePermissionLevel(req: express.Request, res: express.Response) {
    const patchUserDto: PatchUserDto = {
      permissionLevel: parseInt(req.params.permissionLevel)
    };
    log(await usersService.patchById(req.params.userId, patchUserDto));
    res.status(204).send();
  }
}

export default UsersController.getInstance();

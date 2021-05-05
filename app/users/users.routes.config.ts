import * as express from 'express';
import { body } from 'express-validator';

import { CommonRoutesConfig } from '../common/common.routes.config';
import { PermissionLevel } from '../common/constants/permissionlevel.enum';
import PermissionMiddleware from '../common/middleware/permission.middleware';
import BodyValidationMiddleware from '../common/middleware/body.validation.middleware';
import JwtMiddleware from '../auth/middleware/jwt.middleware';
import UsersMiddleware from './middleware/users.middleware';
import UsersController from './controllers/users.controller';

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'UserRoutes');
  }

  configureRoutes(): express.Application {
    this.app
      .route('/users')
      .get(
        JwtMiddleware.validJWTNeeded,
        PermissionMiddleware.onlyAdminCanDoThisAction,
        UsersController.listUsers
      )
      .post(
        body('email').isEmail(),
        body('password').isLength({ min: 5 }).withMessage('Must include password (5+ characters)'),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        UsersMiddleware.validateUniqueEmail,
        UsersController.createUser
      );

    this.app.param('userId', UsersMiddleware.extractUserId);
    this.app
      .route(`/users/:userId`)
      .all(
        UsersMiddleware.validateUserExists,
        JwtMiddleware.validJWTNeeded,
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put(`/users/:userId`, [
      JwtMiddleware.validJWTNeeded,
      // check fields
      body('email').isEmail(),
      body('password').isLength({ min: 5 }).withMessage('Must include password (5+ characters)'),
      body('firstName').isString(),
      body('lastName').isString(),
      body('permissionLevel').isInt(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersMiddleware.userCantChangePermission,
      PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
      PermissionMiddleware.minimumPermissionLevelRequired(PermissionLevel.ADMIN_PERMISSION),
      UsersController.put
    ]);

    this.app.patch(`/users/:userId`, [
      JwtMiddleware.validJWTNeeded,
      body('email').isEmail().optional(),
      body('password')
        .isLength({ min: 5 })
        .withMessage('Password must be 5+ characters')
        .optional(),
      body('firstName').isString().optional(),
      body('lastName').isString().optional(),
      body('permissionLevel').isInt().optional(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validatePatchEmail,
      PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
      PermissionMiddleware.minimumPermissionLevelRequired(PermissionLevel.ADMIN_PERMISSION),
      UsersController.patch
    ]);

    return this.app;
  }
}

import { CRUD } from '../../common/interfaces/crud.interface';
import UsersDao from '../daos/users.dao';
import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import { PutUserDto } from '../dto/put.user.dto';

class UsersService implements CRUD {
  private static instance: UsersService;

  static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }

    return UsersService.instance;
  }

  async create(resource: CreateUserDto) {
    return await UsersDao.addUser(resource);
  }

  async deleteById(id: string) {
    //return await UsersDao.removeUserById(id);
    return await 'ok';
  }

  async list(limit: number, page: number) {
    // limit and page are ignored until we upgrade our DAO
    return await UsersDao.getUsers(limit, page);
  }

  async readById(resourceId: string) {
    return await UsersDao.getUserById(resourceId);
  }

  async patchById(userId: string, resource: PatchUserDto): Promise<any> {
    return UsersDao.updateUserById(userId, resource);
  }

  async putById(userId: string, resource: PutUserDto): Promise<any> {
    return await UsersDao.updateUserById(userId, resource);
  }

  async getUserByEmail(email: string) {
    return UsersDao.getUserByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return UsersDao.getUserByEmailWithPassword(email);
  }
}

export default UsersService.getInstance();

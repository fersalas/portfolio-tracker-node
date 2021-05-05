import shortUUID from 'shortid';
import debug from 'debug';

import mongooseService from '../../common/services/mongoose.service';
import { ModificationNote } from '../../common/types/modificationNote';
import { CreateUserDto } from '../dto/create.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import { PutUserDto } from '../dto/put.user.dto';

const log: debug.IDebugger = debug('app:users-dao');

class UsersDao {
  private static instance: UsersDao;

  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema({
    _id: String,
    email: String,
    password: { type: String, select: false },
    firstName: String,
    lastName: String,
    permissionLevel: Number,
    modification_notes: [ModificationNote]
  });

  User = mongooseService.getMongoose().model('Users', this.userSchema);

  constructor() {
    log('Created new instance of UsersDao');
  }

  public static getInstance(): UsersDao {
    if (!this.instance) {
      this.instance = new UsersDao();
    }
    return this.instance;
  }

  private createModificationNote(modification_note: string): ModificationNote {
    return {
      modified_by: null,
      modified_on: new Date(Date.now()),
      modification_note
    };
  }

  async addUser(userFields: CreateUserDto) {
    const userId = shortUUID.generate();
    userFields.modification_notes = [
      UsersDao.getInstance().createModificationNote('New User Created')
    ];
    const user = new this.User({
      _id: userId,
      permissionLevel: 1,
      ...userFields
    });
    await user.save();

    return userId;
  }

  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).populate('User', '-password');
  }

  async getUserByEmail(email: string) {
    return this.User.findOne({ email: email });
  }

  async getUserByEmailWithPassword(email: string) {
    const query = '_id email permissionLevel +password';
    return this.User.findOne({ email: email }).select(query).exec();
  }

  async updateUserById(userId: string, userFields: PatchUserDto | PutUserDto) {
    userFields.modification_notes = [UsersDao.getInstance().createModificationNote('User Updated')];
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId },
      { $set: userFields },
      { new: true }
    ).exec();

    if (!existingUser) {
      throw new Error(`User not id: ${userId}found`);
    }
    return existingUser;
  }

  async removeUserById(userId: string) {
    return this.User.deleteOne({ _id: userId });
  }
}

export default UsersDao.getInstance();

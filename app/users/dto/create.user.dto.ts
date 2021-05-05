import { ModificationNote } from '../../common/types/modificationNote';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  permissionLevel?: number;
  modification_notes: ModificationNote[];
}

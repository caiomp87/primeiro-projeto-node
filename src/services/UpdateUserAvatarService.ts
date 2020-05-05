import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import User from '../models/User';
import uploadConfig from '../config/upload';

interface Request {
  user_id: string;
  avatarFileName: string;
}

class UpdateUserAvatarService {
  public async execute({ user_id, avatarFileName }: Request): Promise<User> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne(user_id);

    if (!user) {
      throw Error('Only authenticated users can change avatar.');
    }

    if (user.avatar) {
      // Deletando o avatar antigo para não ocupar espaço a toa
      const avatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const avatarFileExists = await fs.promises.stat(avatarFilePath);

      if (avatarFileExists) {
        await fs.promises.unlink(avatarFilePath);
      }

      // Atualizando o novo avatar
      user.avatar = avatarFileName;

      await userRepository.save(user);
    }

    return user;
  }
}

export default UpdateUserAvatarService;

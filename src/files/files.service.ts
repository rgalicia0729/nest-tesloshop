import { join } from 'path';
import { existsSync } from 'fs';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/files', imageName);

    if (!existsSync(path)) {
      throw new NotFoundException(`The file ${imageName} not found`);
    }

    return path;
  }
}

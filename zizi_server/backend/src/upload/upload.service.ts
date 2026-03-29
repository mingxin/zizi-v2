import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

@Injectable()
export class UploadService {
  /**
   * 将 Buffer 保存为本地文件，返回可访问的 URL 路径
   * @param buffer 文件内容
   * @param subdir 子目录，如 'images' 或 'audio'
   * @param ext 扩展名，如 'jpg' 或 'mp3'
   * @param prefix 文件名前缀（可选）
   */
  async saveFile(buffer: Buffer, subdir: string, ext: string, prefix?: string): Promise<string> {
    const dir = path.join(UPLOAD_DIR, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const cleanExt = ext.replace(/^\./, ''); // 去掉前导点
    const tag = prefix ? `${prefix}_` : '';
    const filename = `${tag}${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${cleanExt}`;
    fs.writeFileSync(path.join(dir, filename), buffer);
    return `/api/static/${subdir}/${filename}`;
  }
}

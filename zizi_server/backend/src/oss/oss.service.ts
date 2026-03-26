import { Injectable, InternalServerErrorException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const STS = require('@alicloud/pop-core');

@Injectable()
export class OssService {
  async getStsToken() {
    const client = new STS({
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
      endpoint: 'https://sts.aliyuncs.com',
      apiVersion: '2015-04-01',
    });
    try {
      const result = await client.request(
        'AssumeRole',
        {
          RoleArn: process.env.ALIYUN_STS_ROLE_ARN,
          RoleSessionName: 'zizi-upload',
          DurationSeconds: 3600,
        },
        { method: 'POST' },
      );
      const creds = result.Credentials;
      return {
        accessKeyId: creds.AccessKeyId,
        accessKeySecret: creds.AccessKeySecret,
        securityToken: creds.SecurityToken,
        bucket: process.env.ALIYUN_OSS_BUCKET,
        region: process.env.ALIYUN_OSS_REGION,
        prefix: 'uploads/',
      };
    } catch (e) {
      throw new InternalServerErrorException('Failed to get STS token');
    }
  }
}

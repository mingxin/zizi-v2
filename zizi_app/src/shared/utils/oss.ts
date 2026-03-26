import http from '@/core/http'

export interface StsToken {
  accessKeyId:     string
  accessKeySecret: string
  securityToken:   string
  bucket:          string
  region:          string
  prefix:          string
}

/**
 * 向后端请求 OSS STS Token，然后直传文件，返回公开 URL
 */
export async function uploadToOss(file: File): Promise<string> {
  // Step 1: 获取 STS Token
  const { data: sts } = await http.get<StsToken>('/oss/sts-token')

  // Step 2: 构造文件名
  const ext      = file.name.split('.').pop() ?? 'jpg'
  const filename = `${sts.prefix}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  // Step 3: 直传 OSS（使用 FormData + STS 签名）
  const formData = new FormData()
  formData.append('key',              filename)
  formData.append('OSSAccessKeyId',   sts.accessKeyId)
  formData.append('x-oss-security-token', sts.securityToken)
  formData.append('policy',           btoa(JSON.stringify({
    expiration: new Date(Date.now() + 60000).toISOString(),
    conditions: [['starts-with', '$key', sts.prefix]]
  })))
  formData.append('signature',        '') // 后端应返回预签名 signature
  formData.append('success_action_status', '200')
  formData.append('file', file)

  const ossEndpoint = `https://${sts.bucket}.oss-${sts.region}.aliyuncs.com`
  const uploadRes = await fetch(ossEndpoint, { method: 'POST', body: formData })
  if (!uploadRes.ok) throw new Error('OSS upload failed')

  return `${ossEndpoint}/${filename}`
}

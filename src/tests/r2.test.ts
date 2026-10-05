import { describe, expect, it } from 'vitest'

import { signV4 } from '@/lib/r2'

/**
 * Exemple officiel AWS « GET Object » de la documentation SigV4 pour S3
 * (Authenticating Requests: Using the Authorization Header). Si la signature
 * calculée correspond, l'implémentation maison signe exactement comme le SDK.
 */
describe('signature SigV4 (R2 / S3)', () => {
  it("reproduit la signature de l'exemple officiel AWS", () => {
    const emptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    const authorization = signV4({
      method: 'GET',
      host: 'examplebucket.s3.amazonaws.com',
      path: '/test.txt',
      headers: { range: 'bytes=0-9', 'x-amz-content-sha256': emptyHash, 'x-amz-date': '20130524T000000Z' },
      payloadHash: emptyHash,
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      region: 'us-east-1',
      amzDate: '20130524T000000Z',
    })
    expect(authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, ' +
        'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, ' +
        'Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'
    )
  })
})

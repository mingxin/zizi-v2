import { describe, it, expect } from 'vitest'
import { getBookNfcUrl } from './api'

describe('getBookNfcUrl', () => {
  const originalOrigin = window.location.origin

  it('应生成包含 autoplay 参数的 URL', () => {
    const url = getBookNfcUrl(42)

    expect(url).toContain('/books/42')
    expect(url).toContain('autoplay=1')
  })

  it('应包含当前域名', () => {
    const url = getBookNfcUrl(1)

    expect(url).toContain(originalOrigin)
  })

  it('不同 ID 应生成不同 URL', () => {
    const url1 = getBookNfcUrl(1)
    const url2 = getBookNfcUrl(2)

    expect(url1).not.toBe(url2)
    expect(url1).toContain('/books/1')
    expect(url2).toContain('/books/2')
  })
})

import http from '@/core/http'

export interface BookPage {
  id:       number
  pageNum:  number
  imageUrl: string
  audioUrl: string
  story:    string
}

export interface Book {
  id:        number
  title:     string
  coverUrl:  string
  pageCount: number
  createdAt: string
  pages?:    BookPage[]
}

/** 获取绘本列表 */
export async function fetchBooks(): Promise<Book[]> {
  const { data } = await http.get<Book[]>('/picture-book')
  return data
}

/** 获取单本绘本（含分页） */
export async function fetchBook(id: number): Promise<Book> {
  const { data } = await http.get<Book>(`/picture-book/${id}`)
  return data
}

/** 批量上传页面图片并生成故事 */
export async function createBook(imageUrls: string[]): Promise<Book> {
  const { data } = await http.post<Book>('/picture-book', { imageUrls })
  return data
}

/** 获取绘本的专用分享 URL（用于写入 NFC） */
export function getBookNfcUrl(bookId: number): string {
  return `${window.location.origin}/books/${bookId}?autoplay=1`
}

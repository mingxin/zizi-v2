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

/** Fetch picture-book list */
export async function fetchBooks(): Promise<Book[]> {
  const { data } = await http.get<Book[]>('/picture-book')
  return data
}

/** Fetch single book with pages */
export async function fetchBook(id: number): Promise<Book> {
  const { data } = await http.get<Book>(`/picture-book/${id}`)
  return data
}

/** Batch-upload page images and generate story */
export async function createBook(imageUrls: string[]): Promise<Book> {
  const { data } = await http.post<Book>('/picture-book', { imageUrls })
  return data
}

/** Update book title */
export async function updateBookTitle(id: number, title: string): Promise<Book> {
  const { data } = await http.patch<Book>(`/picture-book/${id}`, { title })
  return data
}

/** Get dedicated NFC share URL for a book */
export function getBookNfcUrl(bookId: number): string {
  return `${window.location.origin}/books/${bookId}?autoplay=1`
}

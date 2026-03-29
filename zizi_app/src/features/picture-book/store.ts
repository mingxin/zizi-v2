import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchBooks, createBook, fetchBook, updateBookTitle, type Book } from './api'
import { uploadImage } from '@/shared/utils/tts'

export const useBookStore = defineStore('picture-book', () => {
  const books       = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const loading     = ref(false)

  // ── Capture state ──────────────────────────────────────────
  const capturedFiles   = ref<File[]>([])
  const captureCount    = ref(0)

  function addCapture(file: File) {
    capturedFiles.value.push(file)
    captureCount.value++
  }

  function resetCapture() {
    capturedFiles.value = []
    captureCount.value  = 0
  }

  // ── Book list ─────────────────────────────────────────────
  async function loadBooks() {
    const data = await fetchBooks()
    books.value = data
  }

  // ── Create book (upload images -> AI generate story) ──────
  async function submitBook(): Promise<Book> {
    // Upload all page images in parallel
    const imageUrls = await Promise.all(
      capturedFiles.value.map((f) => uploadImage(f)),
    )
    // Call backend AI story generation
    const book = await createBook(imageUrls)
    books.value.unshift(book)
    resetCapture()
    return book
  }

  // ── Load single book ──────────────────────────────────────
  async function loadBook(id: number) {
    const data = await fetchBook(id)
    currentBook.value = data
  }

  // ── Update book title ─────────────────────────────────────
  async function editBookTitle(id: number, newTitle: string) {
    const updated = await updateBookTitle(id, newTitle)
    // Update current book if viewing
    if (currentBook.value?.id === id) {
      currentBook.value = { ...currentBook.value, title: updated.title }
    }
    // Update in list
    const idx = books.value.findIndex((b) => b.id === id)
    if (idx >= 0) {
      books.value[idx] = { ...books.value[idx], title: updated.title }
    }
    return updated
  }

  return {
    books,
    currentBook,
    loading,
    capturedFiles,
    captureCount,
    addCapture,
    resetCapture,
    loadBooks,
    submitBook,
    loadBook,
    editBookTitle,
  }
})

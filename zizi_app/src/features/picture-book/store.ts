import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchBooks, createBook, fetchBook, type Book } from './api'
import { uploadToOss } from '@/shared/utils/oss'
import { useLoadingStore } from '@/core/stores'

export const useBookStore = defineStore('picture-book', () => {
  const books       = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const loading     = ref(false)

  // ── 连拍状态 ────────────────────────────────────────────
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

  // ── 书列表 ───────────────────────────────────────────────
  async function loadBooks() {
    const loadingStore = useLoadingStore()
    loading.value = true
    loadingStore.show('加载绘本中...')
    try {
      books.value = await fetchBooks()
    } finally {
      loading.value = false
      loadingStore.hide()
    }
  }

  // ── 创建绘本（批量上传 + 后端生成故事） ─────────────────
  async function submitBook(): Promise<Book> {
    const loadingStore = useLoadingStore()
    loading.value = true
    loadingStore.show(`上传 ${capturedFiles.value.length} 页中...`)
    try {
      // 并发上传所有页面图片
      const imageUrls = await Promise.all(
        capturedFiles.value.map((f) => uploadToOss(f))
      )
      loadingStore.show('AI 生成故事中...')
      const book = await createBook(imageUrls)
      books.value.unshift(book)
      resetCapture()
      return book
    } finally {
      loading.value = false
      loadingStore.hide()
    }
  }

  // ── 加载单本绘本 ─────────────────────────────────────────
  async function loadBook(id: number) {
    const loadingStore = useLoadingStore()
    loading.value = true
    loadingStore.show('加载绘本中...')
    try {
      currentBook.value = await fetchBook(id)
    } finally {
      loading.value = false
      loadingStore.hide()
    }
  }

  return {
    books, currentBook, loading,
    capturedFiles, captureCount,
    addCapture, resetCapture,
    loadBooks, submitBook, loadBook,
  }
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookStore } from './store'

// Mock API 模块
vi.mock('./api', () => ({
  fetchBooks: vi.fn(),
  createBook: vi.fn(),
  fetchBook: vi.fn(),
  updateBookTitle: vi.fn(),
}))

vi.mock('@/shared/utils/tts', () => ({
  uploadImage: vi.fn(),
}))

import { fetchBooks, createBook, fetchBook, updateBookTitle } from './api'
import { uploadImage } from '@/shared/utils/tts'

describe('PictureBookStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('拍摄状态管理', () => {
    it('addCapture 应添加文件并增加计数', () => {
      const store = useBookStore()
      const file = new File([''], 'photo1.jpg', { type: 'image/jpeg' })

      store.addCapture(file)

      expect(store.capturedFiles).toHaveLength(1)
      expect(store.captureCount).toBe(1)
    })

    it('多次 addCapture 应累积', () => {
      const store = useBookStore()
      store.addCapture(new File([''], 'a.jpg'))
      store.addCapture(new File([''], 'b.jpg'))

      expect(store.capturedFiles).toHaveLength(2)
      expect(store.captureCount).toBe(2)
    })

    it('resetCapture 应清空所有拍摄状态', () => {
      const store = useBookStore()
      store.addCapture(new File([''], 'a.jpg'))
      store.addCapture(new File([''], 'b.jpg'))

      store.resetCapture()

      expect(store.capturedFiles).toHaveLength(0)
      expect(store.captureCount).toBe(0)
    })
  })

  describe('loadBooks', () => {
    it('应加载绘本列表', async () => {
      const mockBooks = [
        { id: 1, title: '绘本1', coverUrl: 'url1', pageCount: 3, createdAt: '2024-01-01' },
        { id: 2, title: '绘本2', coverUrl: 'url2', pageCount: 5, createdAt: '2024-01-02' },
      ]
      vi.mocked(fetchBooks).mockResolvedValue(mockBooks as any)

      const store = useBookStore()
      await store.loadBooks()

      expect(store.books).toHaveLength(2)
      expect(store.books[0].title).toBe('绘本1')
    })
  })

  describe('submitBook', () => {
    it('应上传所有图片并创建绘本', async () => {
      const store = useBookStore()
      store.addCapture(new File([''], 'a.jpg'))
      store.addCapture(new File([''], 'b.jpg'))

      vi.mocked(uploadImage)
        .mockResolvedValueOnce('/url/a.jpg')
        .mockResolvedValueOnce('/url/b.jpg')

      const newBook = { id: 1, title: '新绘本', coverUrl: '/url/a.jpg', pageCount: 2, createdAt: '2024-01-01' }
      vi.mocked(createBook).mockResolvedValue(newBook as any)

      const result = await store.submitBook()

      expect(uploadImage).toHaveBeenCalledTimes(2)
      expect(createBook).toHaveBeenCalledWith(['/url/a.jpg', '/url/b.jpg'])
      expect(result.id).toBe(1)
      expect(store.books[0]).toEqual(newBook)
    })

    it('创建完成后应重置拍摄状态', async () => {
      const store = useBookStore()
      store.addCapture(new File([''], 'a.jpg'))

      vi.mocked(uploadImage).mockResolvedValue('/url/a.jpg')
      vi.mocked(createBook).mockResolvedValue({ id: 1, title: 'test', coverUrl: '', pageCount: 1, createdAt: '' })

      await store.submitBook()

      expect(store.capturedFiles).toHaveLength(0)
      expect(store.captureCount).toBe(0)
    })
  })

  describe('loadBook', () => {
    it('应加载单个绘本详情', async () => {
      const mockBook = {
        id: 1,
        title: '绘本详情',
        pages: [
          { pageNum: 1, story: '故事1', audioUrl: 'audio1' },
        ],
      }
      vi.mocked(fetchBook).mockResolvedValue(mockBook as any)

      const store = useBookStore()
      await store.loadBook(1)

      expect(store.currentBook?.title).toBe('绘本详情')
      expect(store.currentBook?.pages).toHaveLength(1)
    })
  })

  describe('editBookTitle', () => {
    it('应更新当前查看的绘本标题', async () => {
      const store = useBookStore()
      store.currentBook = { id: 1, title: '旧标题' } as any

      vi.mocked(updateBookTitle).mockResolvedValue({ id: 1, title: '新标题' } as any)

      await store.editBookTitle(1, '新标题')

      expect(store.currentBook?.title).toBe('新标题')
    })

    it('应同步更新列表中的绘本标题', async () => {
      const store = useBookStore()
      store.books = [
        { id: 1, title: '旧标题', coverUrl: '', pageCount: 1, createdAt: '' },
        { id: 2, title: '其他', coverUrl: '', pageCount: 1, createdAt: '' },
      ]

      vi.mocked(updateBookTitle).mockResolvedValue({ id: 1, title: '新标题' } as any)

      await store.editBookTitle(1, '新标题')

      expect(store.books[0].title).toBe('新标题')
      expect(store.books[1].title).toBe('其他') // 未变更
    })
  })
})

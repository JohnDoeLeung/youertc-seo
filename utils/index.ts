/**
 * 通用工具函数
 */

/**
 * 防抖函数（替代原项目中未防抖的 resize 监听）
 * @param fn 要防抖的函数
 * @param delay 延迟毫秒数（默认 200ms）
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 200): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }) as T
}

/**
 * 节流函数（用于滚动等高频事件）
 */
export function throttle<T extends (...args: any[]) => void>(fn: T, delay = 100): T {
  let last = 0
  return ((...args: any[]) => {
    const now = Date.now()
    if (now - last >= delay) {
      fn(...args)
      last = now
    }
  }) as T
}

/**
 * 格式化日期（YYYY-MM-DD）
 */
export function formatDate(date?: string): string {
  if (!date) return ''
  return date.substring(0, 10)
}

/**
 * 从 URL 提取文件名
 */
export function getFileName(url: string, length = 25): string {
  if (!url) return ''
  return url.substring(url.length - length)
}

/**
 * 通用工具函数
 */
import type { Category } from '~/stores/site'

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

export interface CategoryCrumb {
  id: string | number
  name: string
}

/**
 * 在两级分类树中按 cateId 反查「一级分类 → 二级分类」层级路径
 *
 * 背景：后端 /article/common/item/{id}（文章详情）只返回 cateId，
 * 不返回 cateName / cateInfo，因此详情页无法直接拿到分类名称，
 * 必须借助全局分类树（store.cateList）反查。
 * （列表接口 /article/common/page 返回的是 { cateInfo, article } 嵌套结构，
 *   详情页接口则没有这层 cateInfo，两者结构不一致。）
 *
 * @param tree 分类树，来自 store.cateList
 * @param cateId 文章所属分类 ID，通常为二级分类
 * @returns 层级路径（一级在前）；父子同名时只保留一级，避免出现
 *          「招标信息 > 招标信息」这类重复面包屑；未命中时返回空数组
 */
export function findCategoryPath(
  tree: Category[],
  cateId?: string | number
): CategoryCrumb[] {
  if (!tree?.length || cateId === undefined || cateId === null || cateId === '') {
    return []
  }

  const target = String(cateId)

  for (const parent of tree) {
    // 命中一级分类
    if (String(parent.id) === target) {
      return [{ id: parent.id, name: parent.name }]
    }

    // 命中二级分类
    const child = (parent.childs || []).find(c => String(c.id) === target)
    if (child) {
      // 父子同名（如 招标信息 → 招标信息、党建工作 → 党建工作）只展示一级
      if (parent.name === child.name) {
        return [{ id: parent.id, name: parent.name }]
      }
      return [
        { id: parent.id, name: parent.name },
        { id: child.id, name: child.name }
      ]
    }
  }

  return []
}

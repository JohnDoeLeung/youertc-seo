/**
 * HTML 消毒工具（SSR 兼容版）
 *
 * 改造点：
 * 1. 客户端：使用 dompurify（原生 DOM API）
 * 2. 服务端：基于正则的轻量消毒，移除危险标签与属性（无需 jsdom 重依赖）
 * 3. 保留同样的 API 签名，调用方无感知
 */
import DOMPurify from 'dompurify'

const defaultOptions = {
  ALLOWED_TAGS: null,
  ALLOWED_ATTR: null,
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'base'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
}

/**
 * 消毒 HTML 字符串
 * - 客户端：使用 DOMPurify 完整消毒
 * - 服务端：基于正则的轻量消毒，移除危险标签与事件属性
 */
export function sanitize(html: string, options: Record<string, unknown> = {}): string {
  if (!html || typeof html !== 'string') return ''

  // 服务端：基于正则的轻量消毒（defense-in-depth，后端应已消毒）
  if (import.meta.server) {
    return sanitizeServer(html)
  }

  // 客户端：使用 DOMPurify
  return DOMPurify.sanitize(html, { ...defaultOptions, ...options })
}

/**
 * 服务端轻量 HTML 消毒
 *
 * 移除以下危险内容：
 * 1. <script>...</script> 标签及内容
 * 2. <style>...</style> 标签及内容
 * 3. <iframe>, <object>, <embed>, <form>, <base> 等危险标签
 * 4. 所有 on* 事件属性（onclick, onerror, onload 等）
 * 5. javascript: 协议的链接
 * 6. data: 协议的链接（防止 data:text/html 执行脚本）
 */
function sanitizeServer(html: string): string {
  let result = html

  // 1. 移除 <script>...</script> 及内容（含变异大小写、属性）
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // 2. 移除 <style>...</style> 及内容
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // 3. 移除危险自闭合/非自闭合标签（保留内容）
  // iframe / object / embed / form / base / link / meta
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'base', 'link', 'meta']
  for (const tag of dangerousTags) {
    // 非自闭合：<tag ...>...</tag>
    const openRegex = new RegExp(`<${tag}\\b[^>]*>`, 'gi')
    const closeRegex = new RegExp(`</${tag}\\s*>`, 'gi')
    result = result.replace(openRegex, '').replace(closeRegex, '')
  }
  // 自闭合形式：<tag ... />
  const selfClosingRegex = /<(iframe|object|embed|base|link|meta)\b[^>]*\/>/gi
  result = result.replace(selfClosingRegex, '')

  // 4. 移除所有 on* 事件属性（onclick, onerror, onload, onmouseover 等）
  // 匹配 onXXX= 单引号、双引号或无引号的属性值
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // 5. 移除 javascript: 协议的 href / src
  result = result.replace(
    /(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi,
    '$1="#"'
  )

  // 6. 移除 data: 协议的 src（防止 data:text/html;base64, 执行脚本）
  // 仅针对非图片类型的 data: 协议
  result = result.replace(
    /src\s*=\s*(?:"data:(?!image\/)[^"]*"|'data:(?!image\/)[^']*')/gi,
    'src="#"'
  )

  return result
}

export default sanitize

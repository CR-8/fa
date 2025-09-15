"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Ensure content is properly formatted
  const formattedContent = content
    // Fix common markdown issues
    .replace(/\*\*\s+/g, '**') // Remove spaces after bold markers
    .replace(/\s+\*\*/g, '**') // Remove spaces before bold markers
    .replace(/\*\s+\*/g, '**') // Fix broken bold formatting
    // Ensure proper list formatting
    .replace(/^\*\s+/gm, '* ') // Ensure single space after list markers
    .replace(/^-\s+/gm, '- ') // Ensure single space after dash markers
    // Clean up headers
    .replace(/^#+\s*/gm, (match) => match.trim() + ' ') // Ensure space after header markers
    // Fix line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace excessive newlines

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2 mt-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-50 mb-2 mt-3">
              {children}
            </h3>
          ),
          // Customize paragraphs
          p: ({ children }) => (
            <p className="text-neutral-700 dark:text-neutral-300 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          // Customize lists
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-neutral-700 dark:text-neutral-300">
              {children}
            </li>
          ),
          // Customize emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900 dark:text-neutral-50">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-800 dark:text-neutral-200">
              {children}
            </em>
          ),
          // Customize code
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-3 rounded text-sm font-mono overflow-x-auto">
                {children}
              </code>
            )
          },
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-neutral-600 dark:text-neutral-400 my-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  )
}
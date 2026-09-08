import { Check, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'

export function CommandBox({ command, label = 'Install with DSH' }: { readonly command: string; readonly label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="command-block">
      <div className="command-label"><Terminal aria-hidden="true" />{label}</div>
      <code><span aria-hidden="true">$</span>{command}</code>
      <button type="button" onClick={() => void copy()} aria-label="Copy install command">
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
    </div>
  )
}

import type { ReactNode } from "react"

export default function Template({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="animate-splasher-enter flex min-w-0 flex-1 flex-col">
      {children}
    </div>
  )
}

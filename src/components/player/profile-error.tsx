import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProfileError({ message }: { message: string }) {
  return (
    <div className="animate-splasher-enter mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Could not load profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {message}
          </p>
          <Link
            href="/"
            className="text-primary text-sm font-medium underline-offset-4 transition-[color,opacity] duration-200 ease-[var(--ease-micro)] hover:underline"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

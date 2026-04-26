"use client"

import type { ReactNode } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileTabs({
  overview,
  matches,
}: {
  overview: ReactNode
  matches: ReactNode
}) {
  return (
    <Tabs defaultValue="overview" className="w-full gap-6">
      <TabsList variant="line" className="w-full max-w-md">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="matches">Match history</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="min-h-[240px]">
        {overview}
      </TabsContent>
      <TabsContent value="matches" className="min-h-[240px]">
        {matches}
      </TabsContent>
    </Tabs>
  )
}

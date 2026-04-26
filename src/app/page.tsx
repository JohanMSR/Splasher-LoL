import Link from "next/link"
import { Crosshair, LineChart, Sparkles } from "lucide-react"

import { SummonerSearchForm } from "@/components/summoner-search-form"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="flex min-w-0 w-full flex-col">
      <section className="from-muted/30 border-b bg-gradient-to-b to-transparent">
        <div className="mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-10 px-4 py-16 md:py-24">
          <div className="max-w-2xl space-y-4">
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              League of Legends · companion
            </p>
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
              Scout summoners, review matches, and read runes—without clutter.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Splasher is a minimal, shadcn-styled take on an all-in-one LoL
              profile inspired by tools like{" "}
              <a
                href="https://mobalytics.gg/"
                className="text-foreground underline underline-offset-4 transition-[color,text-decoration-color,opacity] duration-200 ease-[var(--ease-micro)] hover:no-underline"
              >
                Mobalytics
              </a>
              . Search any Riot ID, open ranked context, browse recent games,
              and inspect full rune pages per match.
            </p>
          </div>
          <Card className="max-w-xl min-w-0 border bg-card/80 shadow-sm backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle>Find a summoner</CardTitle>
              <CardDescription>
                Select your game server, then enter{" "}
                <span className="text-foreground font-medium">
                  GameName#TAG
                </span>{" "}
                (for example{" "}
                <span className="font-mono text-xs">Faker#KR1</span> on Korea).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SummonerSearchForm />
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                Requires a developer API key in{" "}
                <code className="text-foreground">.env</code>. See{" "}
                <Link
                  href="https://developer.riotgames.com/"
                  className="underline underline-offset-2 transition-[color,opacity] duration-200 ease-[var(--ease-micro)] hover:text-foreground"
                >
                  Riot Developer Portal
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid min-w-0 w-full max-w-6xl grid-cols-1 gap-6 px-4 py-16 md:grid-cols-3">
        <Card className="min-w-0 hover:-translate-y-0.5 hover:shadow-md" size="sm">
          <CardHeader>
            <Sparkles className="text-muted-foreground mb-2 size-8 transition-colors duration-200 ease-[var(--ease-micro)] group-hover/card:text-foreground" />
            <CardTitle>Before your game</CardTitle>
            <CardDescription>
              Look up a Riot ID, confirm rank and top champions, and skim recent
              trends before you queue.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="min-w-0 hover:-translate-y-0.5 hover:shadow-md" size="sm">
          <CardHeader>
            <Crosshair className="text-muted-foreground mb-2 size-8 transition-colors duration-200 ease-[var(--ease-micro)] group-hover/card:text-foreground" />
            <CardTitle>Match breakdown</CardTitle>
            <CardDescription>
              K/D/A, CS, vision, items, and summoner spells for each match pulled
              straight from the official match service.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="min-w-0 hover:-translate-y-0.5 hover:shadow-md" size="sm">
          <CardHeader>
            <LineChart className="text-muted-foreground mb-2 size-8 transition-colors duration-200 ease-[var(--ease-micro)] group-hover/card:text-foreground" />
            <CardTitle>Runes & builds</CardTitle>
            <CardDescription>
              Primary and secondary trees with Data Dragon icons, plus item
              blocks so you can mirror builds quickly.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto flex min-w-0 w-full max-w-6xl flex-col items-start gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Ready when your API key is
            </h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm">
              Copy <code className="text-foreground">.env.example</code> to{" "}
              <code className="text-foreground">.env</code>, paste{" "}
              <code className="text-foreground">RIOT_API_KEY</code>, restart the
              dev server or container.
            </p>
          </div>
          <Link
            href="https://developer.riotgames.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Get a Riot API key
          </Link>
        </div>
      </section>
    </div>
  )
}

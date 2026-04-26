export function SiteFooter() {
  return (
    <footer className="border-t py-10 text-center text-xs text-muted-foreground transition-[border-color] duration-200 ease-[var(--ease-micro)]">
      <p className="mx-auto max-w-2xl px-4 leading-relaxed">
        Splasher isn’t endorsed by Riot Games and doesn’t reflect the views or
        opinions of Riot Games or anyone officially involved in producing or
        managing League of Legends. League of Legends and Riot Games are
        trademarks or registered trademarks of Riot Games, Inc.
      </p>
      <p className="mt-4">
        Data from the{" "}
        <a
          className="underline underline-offset-2 transition-colors duration-200 ease-[var(--ease-micro)] hover:text-foreground"
          href="https://developer.riotgames.com/"
        >
          Riot Games API
        </a>
        .
      </p>
    </footer>
  )
}

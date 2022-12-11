export function Header() {
  return (
    <header
      class="h-[110px] sm:!h-[144px] w-full bg-cover bg-no-repeat relative"
      style={{
        backgroundImage: "url(/header_bg.svg)",
      }}
    >
      <div class="rainfall w-full h-full absolute" />
      <nav class="w-11/12 h-24 max-w-5xl mx-auto flex items-center justify-between relative">
        <a href="/">
          {/* <img src="/logo.svg" alt="Deno Logo" class="h-14 w-14" /> */}
          🏈🏈🏈🏈🏈🏈🏈
        </a>
        <h1>Rewatchable Games</h1>
        <h2>Choose the best games to rewatch</h2>
      </nav>
    </header>
  );
}

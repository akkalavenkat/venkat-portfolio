import BentoHero from "./hero/BentoHero";
import EditorialHero from "./hero/EditorialHero";
import BrutalistHero from "./hero/BrutalistHero";
import TerminalHero from "./hero/TerminalHero";

/**
 * All four design variants are rendered server-side; CSS shows only the one
 * matching html[data-design]. This keeps SSR/hydration consistent and makes
 * design switching instant with no layout JS.
 */
export default function Hero() {
  return (
    <section id="hero" className="ds-section ds-section--flush">
      <div data-hero="bento" className="hero-variant">
        <BentoHero />
      </div>
      <div data-hero="peacock" className="hero-variant">
        <BentoHero />
      </div>
      <div data-hero="editorial" className="hero-variant">
        <EditorialHero />
      </div>
      <div data-hero="brutalist" className="hero-variant">
        <BrutalistHero />
      </div>
      <div data-hero="terminal" className="hero-variant">
        <TerminalHero />
      </div>
    </section>
  );
}

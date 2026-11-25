export function formatFibreText(text: string): string {
  return text.replace(/https?:\/\/[^\s<>]+|\bfiber\s+(?:&(?:amp;)?|and)\s+electric\b|\bfibers?\b/gi, match => {
    if (!/^fibers?$/i.test(match)) return match;
    const replacement = match.length === 6 ? "fibres" : "fibre";
    if (match === match.toUpperCase()) return replacement.toUpperCase();
    return match[0] === "F" ? "F" + replacement.slice(1) : replacement;
  });
}

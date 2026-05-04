import fs from "node:fs";
import path from "node:path";

// Next.js static export writes opengraph-image files without a .png extension.
// GitHub Pages serves unknown extensions as text/plain, which breaks social
// crawlers. Copy each to <name>.png and rewrite HTML references.

const out = path.join(process.cwd(), "out");

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

let renamed = 0;
walk(out, (file) => {
  if (path.basename(file) === "opengraph-image") {
    fs.copyFileSync(file, file + ".png");
    renamed++;
  }
});

let rewritten = 0;
walk(out, (file) => {
  if (!file.endsWith(".html")) return;
  const before = fs.readFileSync(file, "utf8");
  // Match /opengraph-image followed by ? or " or end-of-attribute
  const after = before.replace(
    /(\/opengraph-image)(\?|"|<)/g,
    "$1.png$2"
  );
  if (after !== before) {
    fs.writeFileSync(file, after);
    rewritten++;
  }
});

console.log(
  `[postbuild] Renamed ${renamed} opengraph-image files, rewrote ${rewritten} HTML files`
);

import { chromium, devices } from "playwright";

const BASE = process.env.SITE_URL ?? "https://taskgo.pl";
const ROUTES = ["/", "/conseguir-personal", "/publicar", "/mapa", "/preguntas", "/regulamin", "/polityka-prywatnosci", "/login", "/mensajes", "/perfil"];
const LANGS = ["es", "pl", "en"];

const report = [];

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["iPhone 13"] });

for (const lang of LANGS) {
  await context.addCookies([{ name: "lang", value: lang, url: BASE }]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`JS: ${e.message}`));

  for (const route of ROUTES) {
    errors.length = 0;
    let status = "ERROR";
    try {
      const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = res ? `${res.status()} → ${new URL(page.url()).pathname}` : "SIN RESPUESTA";
    } catch (e) {
      status = `ERROR ${e.message.slice(0, 60)}`;
    }
    report.push({ lang, route, status, errors: [...errors] });
  }

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const navLinks = await page.locator("nav[aria-label='Menu'] a").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  for (const href of navLinks) {
    if (!href) continue;
    let status = "ERROR";
    try {
      const res = await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = res ? `${res.status()} → ${new URL(page.url()).pathname}` : "SIN RESPUESTA";
    } catch (e) {
      status = `ERROR ${e.message.slice(0, 60)}`;
    }
    report.push({ lang, route: `barra ${href}`, status, errors: [] });
  }

  await page.close();
}

await browser.close();

const bad = report.filter((r) => !String(r.status).startsWith("200") || r.errors.length > 0).filter((r) => r.route !== "/perfil" && r.route !== "barra /login");
console.table(report.map((r) => ({ idioma: r.lang, ruta: r.route, estado: r.status, errores: r.errors.length })));
console.log(`\nTotal: ${report.length} comprobaciones, con problemas: ${bad.length}`);
if (bad.length) console.log("Revisar:", JSON.stringify(bad, null, 2));
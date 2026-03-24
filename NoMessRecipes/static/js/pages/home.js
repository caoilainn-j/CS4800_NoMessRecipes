import { el } from "../utils/dom.js";
import { showToast } from "../ui/components.js";

export async function renderHome() {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  const hero = el("section", { className: "panel", style: "padding:24px; margin-bottom:24px;" },
    el("div", { className: "grid", style: "align-items:center;" },
      el("div", { className: "col-8" },
        el("div", {
          style: "display:inline-flex; align-items:center; gap:8px; margin-bottom:12px; padding:6px 10px; border:1px solid var(--border); border-radius:999px; color:var(--muted); font-size:.92rem;"
        }, "Welcome to No Mess Recipes"),
        el("h1", { style: "margin:0 0 12px 0; font-size:clamp(2rem, 4vw, 3.4rem);" }, "Bake With Less Mess!"),
        el("p", {
          style: "margin:0 0 18px 0; color:var(--muted); max-width:62ch; line-height:1.6;"
        }, "Find recipes with clear-cut ingredients lists and instructions, no lengthy storytimes necessary! Based in the belief that recipes should be easy, not hard to follow."),
        el("div", { style: "display:flex; gap:12px; flex-wrap:wrap;" },
          el("a", { className: "btn btn--primary", href: "#/browse" }, "Browse recipes"),
          el("a", { className: "btn", href: "#/create" }, "Share a recipe")
        )
      ),
      el("aside", { className: "col-4" },
        el("div", { className: "panel", style: "padding:16px;" },
          el("h3", { style: "margin:0 0 10px 0;" }, "What you can do"),
          el("div", { style: "display:grid; gap:10px; color:var(--muted);" },
            el("div", {}, "• Explore easy-to-read recipe ideas"),
            el("div", {}, "• Save recipes to try later"),
            el("div", {}, "• Publish your own favorites")
          )
        )
      )
    )
  );

  const sections = el("section", {},
    el("div", {
      className: "grid"
    },
      featureCard("Browse", "Search recipe ideas when in need of inspiration."),
      featureCard("Share", "Post a recipe with ingredients and steps, no extra fluff!"),
      featureCard("Profile", "Keep space for future saved recipes and account features.")
    )
  );

  app.append(hero, sections);
}

function featureCard(title, copy) {
  return el("article", { className: "col-4 panel", style: "padding:16px;" },
    el("h3", { style: "margin:0 0 8px 0;" }, title),
    el("p", { style: "margin:0; color:var(--muted); line-height:1.5;" }, copy)
  );
}
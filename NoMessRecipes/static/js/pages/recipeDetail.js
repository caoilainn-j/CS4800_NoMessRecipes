import { fetchRecipeById } from "../api.js";
import { el } from "../utils/dom.js";
import { showToast, renderSaveButton } from "../ui/components.js";

const FALLBACK_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f6edb5"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial, sans-serif" font-size="32" fill="#7e5e22">
      No image
    </text>
  </svg>
`);

export async function renderRecipeDetail(id) {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  let recipe;
  try {
    recipe = await fetchRecipeById(id);
  } catch {
    app.append(el("div", { className: "panel", style: "padding:14px" }, `Not found: ${id}`));
    return;
  }

  app.append(
    el("div", { className: "panel", style: "padding:18px" },
      el("a", { className: "btn", href: "#/browse" }, "← Back"),
      el("h1", { style: "margin:14px 0 6px 0" }, recipe.title),
      el("div", { style: "color:var(--muted)" }, `By ${recipe.author} • ${recipe.minutes} min`),
      el("img", {
        src: recipe.image || FALLBACK_IMAGE,
        alt: recipe.title,
        style: "display:block; width:100%; max-width:720px; aspect-ratio:16/9; object-fit:cover; border-radius:14px; border:1px solid var(--border); margin:16px auto 0 auto;"
      }),
      el("div", { style: "margin-top:14px; display:flex; gap:10px; flex-wrap:wrap" },
        ...(recipe.tags || []).map(t => el("span", { className: "panel", style: "padding:6px 10px; border-radius:999px; box-shadow:none;" }, t))
      ),
      el("h2", { style: "margin-top:18px" }, "Ingredients"),
      el("ul", {}, ...(recipe.ingredients || []).map(i => el("li", {}, i))),
      el("h2", { style: "margin-top:18px" }, "Steps"),
      el("ol", {}, ...(recipe.steps || []).map(s => el("li", {}, s))),
      el("div", { style: "margin-top:18px; display:flex; gap:10px" },
        renderSaveButton(recipe.id)
      )
    )
  );
}



import { fetchRecipes } from "../api.js";
import { store } from "../store.js";
import { el } from "../utils/dom.js";
import { recipeCard, showToast } from "../ui/components.js";

export async function renderBrowse() {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  const header = el("div", { className: "grid" },
    el("section", { className: "col-8" },
      el("h1", {}, "Browse recipes"),
      el("p", { style: "color:var(--muted)" }, "Search, save, and share your favorites.")
    )
  );

  const list = el("div", { className: "grid", style: "margin-top:18px" });
  app.append(header, list);

  async function load() {
    const { query } = store.get();
    const recipes = await fetchRecipes({ query });
    list.innerHTML = "";

    if (!recipes.length) {
      list.append(
        el("div", { className: "panel", style: "padding:18px; grid-column:1 / -1;" },
          el("h3", { style: "margin:0 0 8px 0;" }, "No recipes found"),
          el("p", { style: "margin:0; color:var(--muted);" }, "Try another search or share a new recipe.")
        )
      );
      return;
    }

    recipes.forEach((r) => list.append(recipeCard(r)));
  }

  window.addEventListener("app:search", load);
  await load();
}
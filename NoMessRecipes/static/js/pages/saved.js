import { fetchSavedRecipes } from "../api.js";
import { el } from "../utils/dom.js";
import { store } from "../store.js";
import { recipeCard, showToast } from "../ui/components.js";

export async function renderSaved() {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  const { user } = store.get();

  if (!user) {
    app.append(
      el("div", { className: "panel", style: "padding:18px" },
        el("h1", { style: "margin:0 0 8px 0" }, "Saved posts"),
        el("p", { style: "margin:0 0 14px 0; color:var(--muted)" }, "You need to be logged in to view saved posts."),
        el("a", { className: "btn btn--primary", href: "#/profile" }, "Log in")
      )
    );
    return;
  }

  const header = el("div", { className: "grid" },
    el("section", { className: "col-8" },
      el("h1", {}, "Saved posts"),
      el("p", { style: "color:var(--muted)" }, "Recipes you saved for later.")
    )
  );

  const list = el("div", { className: "grid", style: "margin-top:18px" });
  app.append(header, list);

  try {
    const recipes = await fetchSavedRecipes();
    store.set({ savedRecipes: recipes });
    list.innerHTML = "";

    if (!recipes.length) {
      list.append(
        el("div", { className: "panel", style: "padding:18px; grid-column:1 / -1;" },
          el("h3", { style: "margin:0 0 8px 0;" }, "No saved posts yet"),
          el("p", { style: "margin:0; color:var(--muted);" }, "Browse recipes and click Save to keep them here.")
        )
      );
      return;
    }

    recipes.forEach((r) => list.append(recipeCard(r)));
  } catch (error) {
    showToast(error.message || "Could not load saved posts.");
  }
}
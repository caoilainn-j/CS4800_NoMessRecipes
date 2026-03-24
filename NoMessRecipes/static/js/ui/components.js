import { el } from "../utils/dom.js";
import { store } from "../store.js";
import { saveRecipe, unsaveRecipe } from "../api.js";

const FALLBACK_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="#f6edb5"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial, sans-serif" font-size="32" fill="#7e5e22">
      No image
    </text>
  </svg>
`);

function isSaved(recipeId) {
  const { user } = store.get();
  return !!user && Array.isArray(user.saved_recipe_ids) && user.saved_recipe_ids.includes(recipeId);
}

function makeSaveButton(recipeId) {
  const button = el("button", { className: "btn", type: "button" }, "Save");

  async function onToggle() {
    const { user } = store.get();

    if (!user) {
      showToast("Please log in to save posts.");
      window.location.hash = "#/profile";
      return;
    }

    try {
      const wasSaved = isSaved(recipeId);
      const updatedUser = wasSaved
        ? await unsaveRecipe(recipeId)
        : await saveRecipe(recipeId);

      store.set({ user: updatedUser });

      const nowSaved = isSaved(recipeId);
      button.textContent = nowSaved ? "Unsave" : "Save";

      if (wasSaved && !nowSaved) {
        showToast("Removed from saved posts.");

        // Redirect to browse after unsaving
        window.location.hash = "#/browse";
      } else {
        showToast("Saved.");
      }
    } catch (error) {
      showToast(error.message || "Could not update saved posts.");
    }
  }

  button.textContent = isSaved(recipeId) ? "Unsave" : "Save";
  button.addEventListener("click", onToggle);
  return button;
}

export function recipeCard(r) {
  return el("article", { className: "card", style: "grid-column: span 4;" },
    el("img", {
      src: r.image || FALLBACK_IMAGE,
      alt: r.title,
      className: "card__image"
    }),
    el("div", { className: "card__body" },
      el("h3", { style: "margin:0 0 8px 0" }, r.title),
      el("div", { className: "card__meta" },
        el("span", {}, `By ${r.author}`),
        el("span", {}, `${r.minutes} min`),
        el("span", {}, (r.tags || []).join(" • "))
      ),
      el("div", { style: "margin-top:12px; display:flex; gap:10px;" },
        el("a", { className: "btn", href: `#/recipe/${r.id}` }, "View"),
        makeSaveButton(r.id)
      )
    )
  );
}

export function renderSaveButton(recipeId) {
  return makeSaveButton(recipeId);
}

export function showToast(message) {
  const root = document.querySelector("#toastRoot");
  const node = el("div", { className: "toast" }, message);
  root.append(node);
  window.setTimeout(() => node.remove(), 2600);
}
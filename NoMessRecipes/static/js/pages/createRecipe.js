import { createRecipe } from "../api.js";
import { el } from "../utils/dom.js";
import { showToast } from "../ui/components.js";
import { store } from "../store.js";

export function renderCreateRecipe() {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  const { user } = store.get();
  if (!user) {
    app.append(
      el("div", { className: "panel", style: "padding:18px" },
        el("h1", { style: "margin:0 0 8px 0" }, "Share a recipe"),
        el("p", { style: "margin:0 0 14px 0; color:var(--muted)" }, "You need an account to publish recipes."),
        el("div", { style: "display:flex; gap:10px; flex-wrap:wrap;" },
          el("a", { className: "btn btn--primary", href: "#/profile" }, "Log in or register"),
          el("a", { className: "btn", href: "#/" }, "Go home")
        )
      )
    );
    return;
  }

  let imageData = "";

  const title = el("input", { className: "input", placeholder: "Recipe title", required: "true" });
  const minutes = el("input", { className: "input", placeholder: "Minutes (e.g., 30)", inputmode: "numeric" });
  const tags = el("input", { className: "input", placeholder: "Tags (comma-separated)" });
  const ingredients = el("textarea", { className: "input textarea", placeholder: "One ingredient per line" });
  const steps = el("textarea", { className: "input textarea", placeholder: "One step per line" });

  const imageInput = el("input", {
    className: "input",
    type: "file",
    accept: "image/*"
  });

  const imagePreview = el("img", {
    style: "display:none; width:100%; max-width:320px; border-radius:12px; border:1px solid var(--border); margin:8px auto 0 auto; object-fit:cover;"
  });

  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];

    if (!file) {
      imageData = "";
      imagePreview.setAttribute("src", "");
      imagePreview.style.display = "none";
      return;
    }

    if (!file.type.startsWith("image/")) {
      imageInput.value = "";
      imageData = "";
      imagePreview.setAttribute("src", "");
      imagePreview.style.display = "none";
      showToast("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      imageInput.value = "";
      imageData = "";
      imagePreview.setAttribute("src", "");
      imagePreview.style.display = "none";
      showToast("Image must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      imageData = typeof reader.result === "string" ? reader.result : "";
      if (imageData) {
        imagePreview.setAttribute("src", imageData);
        imagePreview.style.display = "block";
      }
    };
    reader.onerror = () => {
      imageInput.value = "";
      imageData = "";
      imagePreview.setAttribute("src", "");
      imagePreview.style.display = "none";
      showToast("Could not read that image.");
    };
    reader.readAsDataURL(file);
  });

  const form = el("form", { className: "form panel", style: "padding:18px" },
    el("h1", { style: "margin:0 0 6px 0" }, "Share a recipe"),
    el("p", { style: "margin:0 0 14px 0; color:var(--muted)" }, `Posting as ${user.name}.`),

    el("div", { className: "label" }, "Title", title),
    el("div", { className: "label" }, "Minutes", minutes),
    el("div", { className: "label" }, "Tags", tags),
    el("div", { className: "label" }, "Ingredients", ingredients),
    el("div", { className: "label" }, "Steps", steps),
    el("div", { className: "label" },
      "Food image",
      imageInput,
      imagePreview
    ),

    el("div", { style: "display:flex; gap:10px; margin-top:8px" },
      el("button", { className: "btn btn--primary", type: "submit" }, "Publish"),
      el("a", { className: "btn", href: "#/" }, "Cancel")
    )
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mins = Number(minutes.value || 0);
    const payload = {
      title: title.value.trim(),
      minutes: Number.isFinite(mins) && mins > 0 ? mins : 0,
      tags: tags.value.split(",").map((s) => s.trim()).filter(Boolean),
      ingredients: ingredients.value.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: steps.value.split("\n").map((s) => s.trim()).filter(Boolean),
      image: imageData
    };

    if (!payload.title) {
      showToast("Title is required.");
      return;
    }

    try {
      const created = await createRecipe(payload);
      showToast("Published.");
      window.location.hash = `#/recipe/${created.id}`;
    } catch (error) {
      showToast(error.message || "Could not publish recipe.");
      if ((error.message || "").toLowerCase().includes("authentication")) {
        store.set({ user: null });
        window.location.hash = "#/profile";
      }
    }
  });

  app.append(form);
}
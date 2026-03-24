import { el } from "../utils/dom.js";
import { store } from "../store.js";
import { login, register } from "../api.js";
import { showToast } from "../ui/components.js";

function renderLoggedInView(app, user) {
  const savedCount = Array.isArray(user.saved_recipe_ids) ? user.saved_recipe_ids.length : 0;

  app.append(
    el("div", { className: "panel", style: "padding:18px" },
      el("h1", { style: "margin:0 0 8px 0" }, "Profile"),
      el("p", { style: "margin:0 0 16px 0; color:var(--muted)" }, "You are signed in."),
      el("div", { style: "display:grid; gap:10px;" },
        el("div", {}, `Name: ${user.name}`),
        el("div", {}, `Email: ${user.email}`),
        el("div", {}, `Saved posts: ${savedCount}`)
      ),
      el("div", { style: "display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;" },
        el("a", { className: "btn btn--primary", href: "#/create" }, "Share a recipe"),
        el("a", { className: "btn", href: "#/saved" }, "Saved posts"),
        el("button", {
          className: "btn",
          onClick: () => window.dispatchEvent(new CustomEvent("app:logout"))
        }, "Log out")
      )
    )
  );
}

function authFormTitle(mode) {
  return mode === "login" ? "Log in" : "Create account";
}

function authButtonLabel(mode) {
  return mode === "login" ? "Log in" : "Register";
}

export function renderProfile() {
  const app = document.querySelector("#app");
  app.innerHTML = "";

  const { user } = store.get();
  if (user) {
    renderLoggedInView(app, user);
    return;
  }

  let mode = "login";

  const title = el("h1", { style: "margin:0 0 8px 0" }, authFormTitle(mode));
  const subtitle = el(
    "p",
    { style: "margin:0 0 14px 0; color:var(--muted)" },
    "Use a simple email/password account for this app."
  );

  const name = el("input", {
    className: "input",
    placeholder: "Name"
  });

  const email = el("input", {
    className: "input",
    placeholder: "Email",
    type: "email",
    autocomplete: "email"
  });

  const password = el("input", {
    className: "input",
    placeholder: "Password",
    type: "password",
    autocomplete: mode === "login" ? "current-password" : "new-password"
  });

  const submitButton = el("button", {
    className: "btn btn--primary",
    type: "submit"
  }, authButtonLabel(mode));

  const switchButton = el("button", {
    className: "btn",
    type: "button"
  }, "Need an account? Register");

  const nameRow = el("div", { className: "label" }, "Name", name);

  function syncMode() {
    title.textContent = authFormTitle(mode);
    submitButton.textContent = authButtonLabel(mode);
    switchButton.textContent = mode === "login"
      ? "Need an account? Register"
      : "Already have an account? Log in";
    nameRow.style.display = mode === "register" ? "grid" : "none";
    password.setAttribute("autocomplete", mode === "login" ? "current-password" : "new-password");
  }

  switchButton.addEventListener("click", () => {
    mode = mode === "login" ? "register" : "login";
    syncMode();
  });

  const form = el("form", { className: "form panel", style: "padding:18px; max-width:560px;" },
    title,
    subtitle,
    nameRow,
    el("div", { className: "label" }, "Email", email),
    el("div", { className: "label" }, "Password", password),
    el("div", { style: "display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;" },
      submitButton,
      switchButton
    )
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    };

    try {
      let result;
      if (mode === "login") {
        result = await login({
          email: payload.email,
          password: payload.password
        });
        showToast("Logged in.");
      } else {
        result = await register(payload);
        showToast("Account created.");
      }

      store.set({ user: result, savedRecipes: [] });
      window.location.hash = "#/home";
    } catch (error) {
      showToast(error.message || "Authentication failed.");
    }
  });

  syncMode();
  app.append(form);
}
async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    ...options
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export async function fetchRecipes({ query = "" } = {}) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("query", query.trim());
  }

  const url = params.toString()
    ? `/api/recipes?${params.toString()}`
    : "/api/recipes";

  return jsonFetch(url);
}

export async function fetchRecipeById(id) {
  return jsonFetch(`/api/recipes/${encodeURIComponent(id)}`);
}

export async function createRecipe(input) {
  return jsonFetch("/api/recipes", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function register(input) {
  return jsonFetch("/api/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function login(input) {
  return jsonFetch("/api/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function logout() {
  return jsonFetch("/api/logout", {
    method: "POST"
  });
}

export async function fetchMe() {
  return jsonFetch("/api/me");
}

export async function fetchSavedRecipes() {
  return jsonFetch("/api/saved");
}

export async function saveRecipe(id) {
  return jsonFetch(`/api/saved/${encodeURIComponent(id)}`, {
    method: "POST"
  });
}

export async function unsaveRecipe(id) {
  return jsonFetch(`/api/saved/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
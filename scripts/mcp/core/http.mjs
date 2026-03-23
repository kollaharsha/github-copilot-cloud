import { truncate } from "./utils.mjs";

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${truncate(body, 400)}`);
  }

  return body ? JSON.parse(body) : {};
}

export async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${truncate(body, 400)}`);
  }

  return body;
}

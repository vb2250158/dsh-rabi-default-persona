// src/index.ts
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

// src/persona-settings.ts
import z from "@deepseek-ai/schemastery";
var RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE = "rabi-default-persona";
var DEFAULT_RABI_PERSONA_ENABLED = false;
var DEFAULT_RABI_MANAGER_BASE_URL = "http://127.0.0.1:8790";
var DEFAULT_RABI_PERSONA_ID = "";
var RabiDefaultPersonaSettingsSchema = z.object({
  enabled: z.boolean().default(DEFAULT_RABI_PERSONA_ENABLED),
  managerBaseUrl: z.string().default(DEFAULT_RABI_MANAGER_BASE_URL),
  roleId: z.string().default(DEFAULT_RABI_PERSONA_ID)
});
var Config = z.object({
  enabled: z.boolean().default(DEFAULT_RABI_PERSONA_ENABLED),
  managerBaseUrl: z.string().default(DEFAULT_RABI_MANAGER_BASE_URL),
  roleId: z.string().default(DEFAULT_RABI_PERSONA_ID)
});

// src/index.ts
var SETTINGS_NAMESPACE = settingsNamespace(RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE);
var PROMPT_SECTION_NAME = "rabi:global-default-persona";
var PROMPT_SECTION_ORDER = 10;
var REQUEST_TIMEOUT_MS = 1e4;
function defaultSettings() {
  return { enabled: DEFAULT_RABI_PERSONA_ENABLED, managerBaseUrl: DEFAULT_RABI_MANAGER_BASE_URL, roleId: DEFAULT_RABI_PERSONA_ID };
}
function settingsKey(settings) {
  return `${settings.managerBaseUrl}\0${settings.roleId}`;
}
function normalizeManagerBaseUrl(value) {
  const text = String(value ?? "").trim().replace(/\/+$/, "");
  if (text === "") throw new Error("Rabi Manager address is required.");
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error("Rabi Manager address must be an HTTP or HTTPS URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Rabi Manager address must be an HTTP or HTTPS URL.");
  return parsed.toString().replace(/\/$/, "");
}
function normalizeSettings(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Rabi persona settings are invalid.");
  const source = value;
  if (typeof source.enabled !== "boolean" || typeof source.managerBaseUrl !== "string" || typeof source.roleId !== "string") {
    throw new TypeError("Rabi persona settings are invalid.");
  }
  const roleId = source.roleId.trim();
  if (roleId === "." || roleId === ".." || /[\\/]/.test(roleId)) throw new Error("Rabi persona identifier is invalid.");
  if (source.enabled && roleId === "") throw new Error("Select a Rabi persona before enabling it.");
  return { enabled: source.enabled, managerBaseUrl: normalizeManagerBaseUrl(source.managerBaseUrl), roleId };
}
async function managerFetch(baseUrl, pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${normalizeManagerBaseUrl(baseUrl)}${pathname}`, {
      headers: { accept: "application/json, text/markdown;q=0.9" },
      signal: controller.signal
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Rabi Manager is unavailable: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}
async function listManagerPersonas(managerBaseUrl) {
  const response = await managerFetch(managerBaseUrl, "/api/personas");
  const body = await response.text();
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${body}`);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("Rabi Manager returned an invalid persona catalog.");
  }
  if (parsed === null || typeof parsed !== "object" || parsed.code !== 0 || !Array.isArray(parsed.personas)) {
    throw new Error("Rabi Manager returned an invalid persona catalog.");
  }
  return parsed.personas.map((persona) => {
    if (persona === null || typeof persona !== "object") throw new Error("Rabi Manager returned an invalid persona.");
    const item = persona;
    if (typeof item.personaId !== "string" || item.personaId.trim() === "") throw new Error("Rabi Manager returned an invalid persona.");
    return { id: item.personaId, label: typeof item.name === "string" && item.name.trim() !== "" ? item.name : typeof item.title === "string" && item.title.trim() !== "" ? item.title : item.personaId };
  });
}
async function readManagerPersona(settings) {
  const response = await managerFetch(settings.managerBaseUrl, `/api/roles/${encodeURIComponent(settings.roleId)}/persona-document`);
  const text = (await response.text()).trim();
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${text}`);
  if (text === "") throw new Error("Rabi Manager returned an empty persona document.");
  return text;
}
async function listManagerPlans(settings) {
  if (settings.roleId === "") throw new Error("Select a Rabi persona before reading plans.");
  const response = await managerFetch(settings.managerBaseUrl, `/api/roles/${encodeURIComponent(settings.roleId)}/plans`);
  const body = await response.text();
  if (!response.ok) throw new Error(`Rabi Manager HTTP ${response.status}: ${body}`);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("Rabi Manager returned an invalid plan list.");
  }
  if (parsed === null || typeof parsed !== "object" || parsed.code !== 0 || !Array.isArray(parsed.data)) {
    throw new Error("Rabi Manager returned an invalid plan list.");
  }
  const plans = parsed.data.map((plan) => {
    if (plan === null || typeof plan !== "object") throw new Error("Rabi Manager returned an invalid plan.");
    const item = plan;
    if (typeof item.id !== "string" || typeof item.title !== "string") throw new Error("Rabi Manager returned an invalid plan.");
    return {
      id: item.id,
      title: item.title,
      focus: typeof item.focus === "string" ? item.focus : "",
      status: typeof item.status === "string" ? item.status : "",
      priority: typeof item.priority === "string" ? item.priority : "",
      currentStep: typeof item.currentStep === "string" ? item.currentStep : "",
      nextAction: typeof item.nextAction === "string" ? item.nextAction : "",
      waitingFor: typeof item.waitingFor === "string" ? item.waitingFor : "",
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : ""
    };
  });
  return { roleId: settings.roleId, plans };
}
function createRabiPersonaCatalogClass(protocol) {
  const initializers = [];
  class RabiPersonaCatalog extends protocol.TypertRemoteService {
    scope;
    cachedKey = "";
    cachedPrompt = "";
    constructor(ctx, scope) {
      super(ctx, "rabiPersonaCatalog");
      this.scope = scope;
      for (const initialize of initializers) initialize.call(this);
    }
    async status() {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings());
      try {
        return { online: true, message: "", personas: await listManagerPersonas(settings.managerBaseUrl), settings };
      } catch (error) {
        return { online: false, message: error instanceof Error ? error.message : String(error), personas: [], settings };
      }
    }
    async configure(request) {
      const settings = normalizeSettings(request);
      if (!settings.enabled) {
        this.setCachedPrompt(settings, "");
        await this.scope.update(settings);
        return await this.status();
      }
      const [prompt, personas] = await Promise.all([readManagerPersona(settings), listManagerPersonas(settings.managerBaseUrl)]);
      if (!personas.some((persona) => persona.id === settings.roleId)) throw new Error("The selected Rabi persona is no longer available from Manager.");
      this.setCachedPrompt(settings, prompt);
      await this.scope.update(settings);
      return { online: true, message: "", personas, settings };
    }
    async plans() {
      return await listManagerPlans(normalizeSettings(this.scope.get() ?? defaultSettings()));
    }
    async refresh() {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings());
      this.setCachedPrompt(settings, settings.enabled ? await readManagerPersona(settings) : "");
    }
    prompt() {
      const settings = normalizeSettings(this.scope.get() ?? defaultSettings());
      if (!settings.enabled) return "";
      if (this.cachedKey !== settingsKey(settings) || this.cachedPrompt === "") return "";
      return this.cachedPrompt;
    }
    setCachedPrompt(settings, prompt) {
      this.cachedKey = settingsKey(settings);
      this.cachedPrompt = prompt;
    }
  }
  for (const method of ["status", "configure", "plans"]) {
    protocol.Remote(method)(RabiPersonaCatalog.prototype[method], {
      private: false,
      static: false,
      name: method,
      addInitializer(initializer) {
        initializers.push(initializer);
      }
    });
  }
  return RabiPersonaCatalog;
}
var LocalRabiPersonaCatalog = createRabiPersonaCatalogClass({ TypertRemoteService, Remote });
var profileRabiPersonaCatalog;
function createProfileRabiPersonaCatalog() {
  if (profileRabiPersonaCatalog !== void 0) return profileRabiPersonaCatalog;
  try {
    const dshHome = resolve(process.env.DSH_HOME?.trim() || join(homedir(), ".dsh"));
    const profileRequire = createRequire(join(dshHome, "profiles", "web", "package.json"));
    const protocol = profileRequire("@deepseek-ai/dsh-typert-protocol");
    if (typeof protocol.TypertRemoteService === "function" && typeof protocol.Remote === "function") {
      profileRabiPersonaCatalog = createRabiPersonaCatalogClass(protocol);
      return profileRabiPersonaCatalog;
    }
  } catch {
  }
  profileRabiPersonaCatalog = LocalRabiPersonaCatalog;
  return profileRabiPersonaCatalog;
}
function apply(ctx, config = {}) {
  ctx.inject(["settings", "systemPrompt"], (injected) => {
    const scope = injected.settings.register(SETTINGS_NAMESPACE, RabiDefaultPersonaSettingsSchema, {
      base: {
        enabled: config.enabled ?? DEFAULT_RABI_PERSONA_ENABLED,
        managerBaseUrl: config.managerBaseUrl ?? DEFAULT_RABI_MANAGER_BASE_URL,
        roleId: config.roleId ?? DEFAULT_RABI_PERSONA_ID
      }
    });
    const RabiPersonaCatalog = createProfileRabiPersonaCatalog();
    const catalog = new RabiPersonaCatalog(ctx, scope);
    injected.systemPrompt.section({ name: PROMPT_SECTION_NAME, order: PROMPT_SECTION_ORDER, text: () => catalog.prompt() });
    ctx.effect(() => {
      void catalog.refresh().catch(() => void 0);
      return ctx.on("settings/updated", (namespace) => {
        if (namespace === RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE) void catalog.refresh().catch(() => void 0);
      });
    });
  });
}
export {
  Config,
  DEFAULT_RABI_MANAGER_BASE_URL,
  DEFAULT_RABI_PERSONA_ENABLED,
  DEFAULT_RABI_PERSONA_ID,
  RABI_DEFAULT_PERSONA_SETTINGS_NAMESPACE,
  RabiDefaultPersonaSettingsSchema,
  apply,
  listManagerPersonas,
  listManagerPlans,
  readManagerPersona
};

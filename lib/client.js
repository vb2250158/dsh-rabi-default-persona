window.__ModuleLoader__.load({
  id: "dsh-rabi-default-persona",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/RabiDefaultPersonaSection.tsx
var React = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var styles = {
  section: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, color: "var(--dsw-alias-label-primary)" },
  title: { margin: 0, fontSize: 16, lineHeight: "24px", fontWeight: 500 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, lineHeight: "20px", fontWeight: 500 },
  notice: { margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-state-warn-label)" },
  error: { margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-state-error-primary)" },
  actions: { display: "flex", alignItems: "center", gap: 10 },
  saved: { fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-state-success-primary)" },
  select: { width: "100%", minHeight: 32, padding: "6px 10px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", font: "inherit" }
};
function RabiDefaultPersonaSection(props) {
  const { readStatus, saveBinding, t } = props;
  if (readStatus === void 0 || saveBinding === void 0 || t === void 0) return null;
  return /* @__PURE__ */ React.createElement(Loaded, { readStatus, saveBinding, t });
}
function Loaded(props) {
  const [status, setStatus] = React.useState(void 0);
  const [draft, setDraft] = React.useState({ enabled: false, managerBaseUrl: "http://127.0.0.1:8790", roleId: "" });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState(void 0);
  const refresh = React.useCallback(() => {
    setError(void 0);
    void props.readStatus().then((next) => {
      setStatus(next);
      setDraft(next.settings);
      if (!next.online) setError(next.message);
    }).catch((reason) => {
      setStatus(void 0);
      setError(reason instanceof Error ? reason.message : String(reason));
    });
  }, [props]);
  React.useEffect(() => {
    refresh();
  }, [refresh]);
  const save = () => {
    setSaving(true);
    setSaved(false);
    setError(void 0);
    void props.saveBinding({ ...draft, managerBaseUrl: draft.managerBaseUrl.trim(), roleId: draft.roleId.trim() }).then((next) => {
      setStatus(next);
      setDraft(next.settings);
      setSaved(true);
    }).catch((reason) => {
      setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      setSaving(false);
    });
  };
  const changed = status === void 0 || draft.enabled !== status.settings.enabled || draft.managerBaseUrl !== status.settings.managerBaseUrl || draft.roleId !== status.settings.roleId || (draft.personaPrompt ?? "") !== (status.settings.personaPrompt ?? "");
  return /* @__PURE__ */ React.createElement("section", { style: styles.section }, /* @__PURE__ */ React.createElement("h2", { style: styles.title }, props.t("title")), /* @__PURE__ */ React.createElement("label", { style: styles.field }, /* @__PURE__ */ React.createElement("span", { style: styles.label }, props.t("enabled")), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: draft.enabled,
      disabled: saving || status?.online !== true,
      onChange: (event) => {
        setDraft((current) => ({ ...current, enabled: event.target.checked }));
        setSaved(false);
      }
    }
  )), /* @__PURE__ */ React.createElement("label", { style: styles.field }, /* @__PURE__ */ React.createElement("span", { style: styles.label }, props.t("managerAddress")), /* @__PURE__ */ React.createElement(
    import_dsh_client_ui_primitives.Input,
    {
      value: draft.managerBaseUrl,
      placeholder: props.t("managerAddressPlaceholder"),
      disabled: saving,
      onChange: (event) => {
        setDraft((current) => ({ ...current, managerBaseUrl: event.target.value }));
        setSaved(false);
        setError(void 0);
      }
    }
  )), /* @__PURE__ */ React.createElement("label", { style: styles.field }, /* @__PURE__ */ React.createElement("span", { style: styles.label }, props.t("personaPrompt")), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      value: draft.personaPrompt ?? "",
      disabled: saving,
      rows: 6,
      style: styles.select,
      onChange: (event) => {
        setDraft((current) => ({ ...current, personaPrompt: event.target.value }));
        setSaved(false);
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { style: styles.actions }, /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Button, { variant: "outline", disabled: saving, onClick: refresh }, props.t("refresh"))), /* @__PURE__ */ React.createElement("label", { style: styles.field }, /* @__PURE__ */ React.createElement("span", { style: styles.label }, props.t("persona")), /* @__PURE__ */ React.createElement(
    "select",
    {
      style: styles.select,
      value: draft.roleId,
      disabled: saving || status?.online !== true,
      onChange: (event) => {
        setDraft((current) => ({ ...current, roleId: event.target.value }));
        setSaved(false);
        setError(void 0);
      }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, props.t("selectPersona")),
    status?.personas.map((persona) => /* @__PURE__ */ React.createElement("option", { key: persona.id, value: persona.id }, persona.label))
  )), status !== void 0 && !status.online ? /* @__PURE__ */ React.createElement("p", { style: styles.notice }, props.t("managerOffline")) : null, error === void 0 ? null : /* @__PURE__ */ React.createElement("p", { style: styles.error }, error), /* @__PURE__ */ React.createElement("div", { style: styles.actions }, /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.Button, { disabled: saving || !changed || draft.enabled && status?.online !== true, onClick: save }, saving ? props.t("saving") : props.t("save")), saved ? /* @__PURE__ */ React.createElement("span", { style: styles.saved, role: "status" }, props.t("saved")) : null));
}

// src/client/RabiPlansPanel.tsx
var React2 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
var styles2 = {
  layer: { position: "relative", flex: "none", display: "flex", alignItems: "center", width: "100%", height: 42, margin: "8px 0 0" },
  rail: { width: 36, height: 36, margin: 0 },
  trigger: { display: "inline-flex", alignItems: "center", gap: 8, width: "calc(100% + 4px)", height: 42, margin: "0 -2px", padding: "0 10px 0 8px", border: "none", borderRadius: 12, background: "transparent", color: "var(--dsw-alias-label-primary)", font: "inherit", fontSize: 14, cursor: "pointer", overflow: "hidden" },
  railTrigger: { justifyContent: "center", gap: 0, width: 36, height: 36, margin: 0, padding: 0, borderRadius: "50%" },
  label: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  count: { flex: "none", marginLeft: "auto", color: "var(--dsw-alias-label-tertiary)", fontSize: 12, lineHeight: "16px", fontVariantNumeric: "tabular-nums" },
  panel: { position: "fixed", zIndex: 30, display: "flex", flexDirection: "column", width: 420, maxWidth: "calc(100vw - 24px)", maxHeight: "60vh", overflow: "hidden", border: "1px solid var(--dsw-alias-border-inverted)", borderRadius: 12, background: "var(--dsw-specific-menu)", boxShadow: "var(--dsw-shadow-lv3)" },
  header: { display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "10px 12px", boxSizing: "border-box" },
  title: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14, fontWeight: 500, lineHeight: "20px", color: "var(--dsw-alias-label-primary)" },
  refresh: { marginLeft: "auto" },
  body: { minHeight: 0, overflowY: "auto", padding: "0 12px 12px" },
  note: { margin: "4px 0", fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-label-tertiary)" },
  error: { margin: "4px 0", fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-state-error-primary)" },
  list: { display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" },
  plan: { padding: 10, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 10, background: "var(--dsw-alias-bg-layer-1)" },
  planTitle: { margin: 0, fontSize: 13, fontWeight: 500, lineHeight: "20px", color: "var(--dsw-alias-label-primary)" },
  focus: { display: "-webkit-box", margin: "4px 0 0", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-label-secondary)" },
  meta: { margin: "8px 0 0", fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-label-tertiary)" }
};
function RabiPlansPanel(props) {
  if (props.readPlans === void 0 || props.t === void 0) return null;
  return /* @__PURE__ */ React2.createElement(Loaded2, { wide: props.wide, readPlans: props.readPlans, t: props.t });
}
function Loaded2({ wide, readPlans, t }) {
  const [open, setOpen] = React2.useState(false);
  const [plans, setPlans] = React2.useState(void 0);
  const [error, setError] = React2.useState(void 0);
  const [loading, setLoading] = React2.useState(false);
  const rootRef = React2.useRef(null);
  const [anchor, setAnchor] = React2.useState();
  const refresh = React2.useCallback(() => {
    setLoading(true);
    setError(void 0);
    void readPlans().then((result) => {
      setPlans(result.plans);
    }).catch((reason) => {
      setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => {
      setLoading(false);
    });
  }, [readPlans]);
  React2.useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (rect !== void 0) setAnchor({ left: rect.left, bottom: window.innerHeight - rect.top + 8 });
    };
    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
    };
  }, [open]);
  React2.useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);
  (0, import_dsh_client_ui_primitives2.useDismissOnOutsidePointer)(rootRef, open, setOpen);
  const title = t("plans");
  const trigger = /* @__PURE__ */ React2.createElement("button", { type: "button", style: { ...styles2.trigger, ...!wide ? styles2.railTrigger : {} }, "aria-label": title, "aria-expanded": open, onClick: () => {
    setOpen((value) => !value);
  } }, /* @__PURE__ */ React2.createElement(import_dsh_client_ui_primitives2.IconListPenOutline16, { size: wide ? 16 : 18 }), wide && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("span", { style: styles2.label }, title), plans !== void 0 && /* @__PURE__ */ React2.createElement("span", { style: styles2.count }, plans.length)));
  return /* @__PURE__ */ React2.createElement("div", { ref: rootRef, style: { ...styles2.layer, ...!wide ? styles2.rail : {} } }, open && anchor !== void 0 && /* @__PURE__ */ React2.createElement("section", { style: { ...styles2.panel, ...anchor }, "aria-label": title }, /* @__PURE__ */ React2.createElement("header", { style: styles2.header }, /* @__PURE__ */ React2.createElement("span", { style: styles2.title }, title), /* @__PURE__ */ React2.createElement(import_dsh_client_ui_primitives2.Button, { style: styles2.refresh, variant: "outline", size: "sm", disabled: loading, onClick: refresh }, t("refresh"))), /* @__PURE__ */ React2.createElement("div", { style: styles2.body }, loading && plans === void 0 && /* @__PURE__ */ React2.createElement("p", { style: styles2.note }, t("plansLoading")), error !== void 0 && /* @__PURE__ */ React2.createElement("p", { style: styles2.error, role: "alert" }, error), plans !== void 0 && plans.length === 0 && /* @__PURE__ */ React2.createElement("p", { style: styles2.note }, t("plansEmpty")), plans !== void 0 && plans.length > 0 && /* @__PURE__ */ React2.createElement("ul", { style: styles2.list }, plans.map((plan) => /* @__PURE__ */ React2.createElement("li", { key: plan.id, style: styles2.plan }, /* @__PURE__ */ React2.createElement("p", { style: styles2.planTitle }, plan.title), plan.focus !== "" && /* @__PURE__ */ React2.createElement("p", { style: styles2.focus }, plan.focus), /* @__PURE__ */ React2.createElement("p", { style: styles2.meta }, [plan.status, plan.priority, plan.currentStep].filter((value) => value !== "").join(" \xB7 "))))))), wide ? trigger : /* @__PURE__ */ React2.createElement(import_dsh_client_ui_primitives2.Tooltip, { label: title, side: "right", delayMs: 500 }, trigger));
}

// src/client/locales.ts
var en = {
  nav: "Rabi persona",
  personaPrompt: "Additional persona prompt",
  title: "Rabi",
  enabled: "Enable Rabi for all DSH sessions",
  managerAddress: "Manager address",
  managerAddressPlaceholder: "http://127.0.0.1:8790",
  refresh: "Refresh",
  persona: "Persona",
  selectPersona: "Select a persona",
  save: "Save",
  saving: "Saving\u2026",
  saved: "Saved",
  managerOffline: "Rabi Manager is offline.",
  plans: "Plans",
  plansLoading: "Loading plans\u2026",
  plansEmpty: "No plans for this persona."
};
var zh = {
  nav: "Rabi \u4EBA\u683C",
  personaPrompt: "\u9644\u52A0\u4EBA\u683C\u63D0\u793A\u8BCD",
  title: "Rabi",
  enabled: "\u5168\u5C40\u542F\u7528 Rabi",
  managerAddress: "Manager \u5730\u5740",
  managerAddressPlaceholder: "http://127.0.0.1:8790",
  refresh: "\u5237\u65B0",
  persona: "\u4EBA\u683C",
  selectPersona: "\u9009\u62E9\u4EBA\u683C",
  save: "\u4FDD\u5B58",
  saving: "\u6B63\u5728\u4FDD\u5B58\u2026\u2026",
  saved: "\u5DF2\u4FDD\u5B58",
  managerOffline: "Rabi Manager \u672A\u542F\u52A8\u6216\u65E0\u6CD5\u8FDE\u63A5\u3002",
  plans: "\u8BA1\u5212",
  plansLoading: "\u6B63\u5728\u8BFB\u53D6\u8BA1\u5212\u2026\u2026",
  plansEmpty: "\u8FD9\u4E2A\u4EBA\u683C\u8FD8\u6CA1\u6709\u8BA1\u5212\u3002"
};

// src/client/index.ts
var NS = "settings.rabiDefaultPersona";
var bindingRequestSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Rabi persona settings are invalid.");
    const item = value;
    if (typeof item.enabled !== "boolean" || typeof item.managerBaseUrl !== "string" || typeof item.roleId !== "string") throw new TypeError("Rabi persona settings are invalid.");
    return item;
  }
};
var statusSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Rabi persona status is invalid.");
    const item = value;
    if (typeof item.online !== "boolean" || typeof item.message !== "string" || !Array.isArray(item.personas) || item.settings === void 0) {
      throw new TypeError("Rabi persona status is invalid.");
    }
    return item;
  }
};
var plansSchema = {
  parse(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Rabi plans are invalid.");
    const item = value;
    if (typeof item.roleId !== "string" || !Array.isArray(item.plans)) throw new TypeError("Rabi plans are invalid.");
    for (const plan of item.plans) {
      if (plan === null || typeof plan !== "object") throw new TypeError("Rabi plans are invalid.");
      const candidate = plan;
      if (typeof candidate.id !== "string" || typeof candidate.title !== "string" || typeof candidate.focus !== "string" || typeof candidate.status !== "string" || typeof candidate.priority !== "string" || typeof candidate.currentStep !== "string" || typeof candidate.nextAction !== "string" || typeof candidate.waitingFor !== "string" || typeof candidate.updatedAt !== "string") {
        throw new TypeError("Rabi plans are invalid.");
      }
    }
    return item;
  }
};
var request = (typeSymbol, schema) => ({
  name: "request",
  wire: "request",
  source: "json",
  codec: { mode: "strict", typeSymbol, schema }
});
var rabiPersonaCatalogRemote = {
  package: "dsh-rabi-default-persona",
  descriptors: [
    {
      id: "dsh-rabi-default-persona#rabiPersonaCatalog/status",
      service: "rabiPersonaCatalog",
      namespace: "rabiPersonaCatalog",
      method: "status",
      invocation: { kind: "direct" },
      parameters: [],
      result: { mode: "strict", typeSymbol: "dsh-rabi-default-persona#RabiPersonaStatus", schema: statusSchema }
    },
    {
      id: "dsh-rabi-default-persona#rabiPersonaCatalog/configure",
      service: "rabiPersonaCatalog",
      namespace: "rabiPersonaCatalog",
      method: "configure",
      invocation: { kind: "direct" },
      parameters: [request("dsh-rabi-default-persona#RabiPersonaBinding", bindingRequestSchema)],
      result: { mode: "strict", typeSymbol: "dsh-rabi-default-persona#RabiPersonaStatus", schema: statusSchema }
    },
    {
      id: "dsh-rabi-default-persona#rabiPersonaCatalog/plans",
      service: "rabiPersonaCatalog",
      namespace: "rabiPersonaCatalog",
      method: "plans",
      invocation: { kind: "direct" },
      parameters: [],
      result: { mode: "strict", typeSymbol: "dsh-rabi-default-persona#RabiPlansStatus", schema: plansSchema }
    }
  ]
};
function unwrap(value, operation) {
  if (value.ok && value.value !== void 0) return value.value;
  throw new Error(value.error?.message ?? `Rabi persona ${operation} failed.`);
}
var inject = ["slots", "locale", "remote"];
async function apply(ctx) {
  const dispose = await ctx.remote.$mount(rabiPersonaCatalogRemote);
  const service = ctx.reflect.get("remote.rabiPersonaCatalog");
  if (service?.status === void 0 || service.configure === void 0 || service.plans === void 0) throw new Error("Rabi persona catalog Remote did not mount.");
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "rabi-default-persona: copy dictionaries");
  const t = ctx.locale.bind(NS);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "rabi-default-persona",
    order: 18,
    label: () => t("nav"),
    inject: () => ({
      readStatus: async () => unwrap(await service.status(), "status"),
      saveBinding: async (value) => unwrap(await service.configure(value), "configure"),
      t
    })
  }, RabiDefaultPersonaSection));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "rabi-plans",
    order: 10,
    inject: () => ({ readPlans: async () => unwrap(await service.plans(), "plans"), t })
  }, RabiPlansPanel));
  return dispose;
}

    return module.exports
  },
})

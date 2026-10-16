import { PROJECT_TYPES } from '../content/project-types.ts';
import {
  CHANNEL_FIELD,
  ELAPSED_FIELD,
  type Channel,
  type FieldError,
  formatPhone,
  normalizePhone,
  resolveChannel,
  validateFields,
} from '../lib/form-schema.ts';
import { buildWaUrl, fallbackWaText } from '../lib/whatsapp.ts';

type Field = FieldError;
type Control = HTMLInputElement | HTMLTextAreaElement;

const FIELDS: readonly Field[] = ['nome', 'whatsapp', 'email', 'mensagem'];
const TIMEOUT_MS = 15000;
const DEFAULT_LOCK_S = 60;
const SUBMIT_LABEL = 'Enviar pedido de orçamento';

export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('#form-orcamento');
  if (!form) return;
  form.noValidate = true;

  const startedAt = performance.now();
  const status = form.querySelector<HTMLElement>('#form-status');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = form.querySelector<HTMLElement>('.btn-label');
  const alertFail = form.querySelector<HTMLElement>('#form-erro');
  const alertLimit = form.querySelector<HTMLElement>('#form-limite');
  const titleFail = form.querySelector<HTMLElement>('#form-erro-t');
  const titleLimit = form.querySelector<HTMLElement>('#form-limite-t');
  const titleOk = form.querySelector<HTMLElement>('#ok-title');
  const elapsed = form.querySelector<HTMLInputElement>(`[name="${ELAPSED_FIELD}"]`);
  const radios = Array.from(
    form.querySelectorAll<HTMLInputElement>(`input[name="${CHANNEL_FIELD}"]`),
  );
  const typeRadios = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="tipo-projeto"]'));

  const controls = {} as Record<Field, Control | null>;
  const originalDescribed = {} as Record<Field, string>;
  for (const field of FIELDS) {
    const el = form.querySelector<Control>(`#${field}`);
    controls[field] = el;
    originalDescribed[field] = el?.getAttribute('aria-describedby') ?? '';
  }

  let sending = false;
  let attempted = false;
  let lockTimer = 0;

  const announce = (text: string): void => {
    if (!status) return;
    status.textContent = '';
    status.textContent = text;
  };

  const setLabel = (text: string): void => {
    if (label) label.textContent = text;
  };

  const currentChannel = (): Channel =>
    resolveChannel(radios.find((radio) => radio.checked)?.value);

  const contactField = (): Field => currentChannel();

  const clearError = (field: Field): void => {
    const el = controls[field];
    if (!el) return;
    el.closest('.field')?.classList.remove('err');
    el.removeAttribute('aria-invalid');
    if (originalDescribed[field]) el.setAttribute('aria-describedby', originalDescribed[field]);
    else el.removeAttribute('aria-describedby');
  };

  const markError = (field: Field): void => {
    const el = controls[field];
    if (!el) return;
    el.closest('.field')?.classList.add('err');
    el.setAttribute('aria-invalid', 'true');
    const ids = originalDescribed[field].split(' ').filter(Boolean);
    const errId = `erro-${field}`;
    if (!ids.includes(errId)) ids.push(errId);
    el.setAttribute('aria-describedby', ids.join(' '));
  };

  const syncChannel = (): void => {
    const active = contactField();
    for (const field of ['whatsapp', 'email'] as const) {
      const el = controls[field];
      if (!el) continue;
      const off = field !== active;
      el.disabled = off;
      if (off) clearError(field);
    }
  };

  const values = () => ({
    nome: controls.nome?.value ?? '',
    canal: currentChannel(),
    whatsapp: controls.whatsapp?.value ?? '',
    email: controls.email?.value ?? '',
    mensagem: controls.mensagem?.value ?? '',
  });

  const visibleFields = (): Field[] => ['nome', contactField(), 'mensagem'];

  const applyErrors = (errors: readonly string[], only?: Field): Field[] => {
    const hit: Field[] = [];
    for (const field of visibleFields()) {
      if (only && field !== only) continue;
      if (errors.includes(field)) {
        markError(field);
        hit.push(field);
      } else {
        clearError(field);
      }
    }
    return hit;
  };

  const reportInvalid = (hit: Field[]): void => {
    const first = hit[0];
    if (!first) return;
    const el = controls[first];
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    announce(
      hit.length === 1 ? 'Há 1 campo para corrigir.' : `Há ${hit.length} campos para corrigir.`,
    );
  };

  const hideAlerts = (): void => {
    if (alertFail) alertFail.hidden = true;
    if (alertLimit) alertLimit.hidden = true;
  };

  const lockInputs = (locked: boolean): void => {
    for (const field of FIELDS) {
      const el = controls[field];
      if (el) el.readOnly = locked;
    }
    for (const radio of [...radios, ...typeRadios]) radio.disabled = locked;
  };

  const typeLabel = (): string => {
    const value = typeRadios.find((radio) => radio.checked)?.value;
    return PROJECT_TYPES.find((type) => type.value === value)?.label ?? '';
  };

  const refreshWaLinks = (): void => {
    const href = buildWaUrl(fallbackWaText(controls.nome?.value, typeLabel()));
    for (const id of ['#form-erro-wa', '#form-limite-wa', '#ok-wa']) {
      form.querySelector<HTMLElement>(id)?.setAttribute('href', href);
    }
  };

  const setSending = (on: boolean): void => {
    sending = on;
    form.classList.toggle('sending', on);
    if (submit) {
      submit.disabled = on;
      if (on) submit.setAttribute('aria-disabled', 'true');
      else submit.removeAttribute('aria-disabled');
    }
    lockInputs(on);
    if (on) setLabel('Enviando…');
    else {
      setLabel(SUBMIT_LABEL);
      syncChannel();
    }
  };

  const fail = (): void => {
    setSending(false);
    form.classList.add('failed');
    refreshWaLinks();
    if (alertFail) alertFail.hidden = false;
    titleFail?.focus();
    announce('Não conseguimos enviar o pedido. Tente de novo ou use o WhatsApp.');
  };

  const limit = (retryAfter: string | null): void => {
    setSending(false);
    form.classList.add('limited');
    refreshWaLinks();
    if (alertLimit) alertLimit.hidden = false;
    titleLimit?.focus();
    announce('Muitos envios em pouco tempo. Use o WhatsApp.');
    const parsed = Number.parseInt(retryAfter ?? '', 10);
    const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LOCK_S;
    if (submit) {
      submit.disabled = true;
      submit.setAttribute('aria-disabled', 'true');
    }
    setLabel('Tente novamente em alguns minutos');
    window.clearTimeout(lockTimer);
    lockTimer = window.setTimeout(() => {
      form.classList.remove('limited');
      if (submit) {
        submit.disabled = false;
        submit.removeAttribute('aria-disabled');
      }
      setLabel(SUBMIT_LABEL);
    }, seconds * 1000);
  };

  const succeed = (): void => {
    setSending(false);
    refreshWaLinks();
    form.classList.add('done');
    titleOk?.focus();
    announce('Pedido enviado. Respondemos no mesmo dia útil.');
  };

  const handleInvalid = (errors: readonly string[]): void => {
    attempted = true;
    const hit = applyErrors(errors);
    if (hit.length === 0) {
      fail();
      return;
    }
    reportInvalid(hit);
  };

  for (const radio of radios) radio.addEventListener('change', syncChannel);

  for (const field of FIELDS) {
    const el = controls[field];
    if (!el) continue;
    el.addEventListener('blur', () => {
      if (sending || el.disabled) return;
      if (field === 'whatsapp') {
        const digits = normalizePhone(el.value);
        if (digits) el.value = formatPhone(digits);
      }
      if (el.value.trim() === '') {
        if (!attempted) clearError(field);
        else applyErrors(validateFields(values()).errors, field);
        return;
      }
      applyErrors(validateFields(values()).errors, field);
    });
    el.addEventListener('input', () => {
      if (!attempted || sending) return;
      applyErrors(validateFields(values()).errors, field);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (sending) return;
    const result = validateFields(values());
    if (!result.ok) {
      handleInvalid(result.errors);
      return;
    }
    for (const field of visibleFields()) clearError(field);
    if (elapsed) elapsed.value = String(Math.max(0, Math.round(performance.now() - startedAt)));

    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === 'string') params.append(key, value);
    }

    hideAlerts();
    form.classList.remove('failed', 'limited');
    setSending(true);
    announce('Enviando pedido…');

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    fetch(form.action, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 200) {
          succeed();
          return;
        }
        if (response.status === 429) {
          limit(response.headers.get('Retry-After'));
          return;
        }
        if (response.status === 400) {
          let fields: string[] = [];
          try {
            const data = (await response.json()) as { fields?: unknown };
            if (Array.isArray(data.fields)) {
              fields = data.fields.filter((item): item is string => typeof item === 'string');
            }
          } catch {
            fields = [];
          }
          setSending(false);
          handleInvalid(fields);
          return;
        }
        fail();
      })
      .catch(fail)
      .finally(() => window.clearTimeout(timer));
  });

  syncChannel();
}

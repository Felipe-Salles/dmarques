export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('#form-orcamento');
  if (!form) return;
  const pending = form.querySelector<HTMLElement>('#form-pendente');
  const status = form.querySelector<HTMLElement>('#form-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pending) pending.hidden = false;
    if (status) {
      status.textContent = '';
      status.textContent =
        'O envio pelo formulário ainda está sendo ativado. Fale com a gente pelo WhatsApp (16) 99611-1785 ou pelo e-mail contato@agenciadmarques.com.br.';
    }
  });
}

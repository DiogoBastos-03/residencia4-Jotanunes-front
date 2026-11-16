/** "Hoje" do protótipo: quarta-feira, 16 de setembro de 2026. */
export const HOJE = '2026-09-16';
export const AGORA = '2026-09-16T14:30';

/**
 * Relógio da demonstração gerada sobre a API: o dia é o do navegador, a hora é fixa (08:00).
 * Hora fixa para a tela não mudar a cada recarga; 08:00 para nada "de hoje" ficar no futuro
 * em horário comercial.
 */
export function relogioDoDia(): { hoje: string; agora: string } {
  const d = new Date();
  const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { hoje, agora: `${hoje}T08:00` };
}

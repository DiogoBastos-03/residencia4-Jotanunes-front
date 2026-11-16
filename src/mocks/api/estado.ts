/** Situação do mock de rede, para a /_api avisar como ele subiu. Arquivo separado para a página não puxar o MSW para o bundle. */
export const estadoMockDeRede: { ativo: boolean; viaFetch: boolean; motivo: string | null } = { ativo: false, viaFetch: false, motivo: null };

import type { Obra, ObraLista } from '@/entities';

export const obras: readonly Obra[] = [
  { id: 'ob-2401', codigo: 'OB-2401', nome: 'Residencial Mirante do Parque', cidade: 'Recife', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2026-01-08T07:00' },
  { id: 'ob-2402', codigo: 'OB-2402', nome: 'Edifício Jardins da Torre', cidade: 'Recife', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2025-11-03T07:00' },
  { id: 'ob-2403', codigo: 'OB-2403', nome: 'Condomínio Vila Serena', cidade: 'Jaboatão dos Guararapes', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2025-09-22T07:00' },
  { id: 'ob-2404', codigo: 'OB-2404', nome: 'Reserva das Águas', cidade: 'Olinda', uf: 'PE', situacao: 'planejamento', recebidaEm: '2026-08-28T07:00' },
  { id: 'ob-2312', codigo: 'OB-2312', nome: 'Centro Clínico Boa Viagem', cidade: 'Recife', uf: 'PE', situacao: 'concluida', recebidaEm: '2023-12-04T07:00' },
  { id: 'ob-2405', codigo: 'OB-2405', nome: 'Residencial Parque das Palmeiras', cidade: 'Caruaru', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2026-03-02T07:00' },
  { id: 'ob-2406', codigo: 'OB-2406', nome: 'Edifício Atlântico Sul', cidade: 'Recife', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2025-07-14T07:00' },
  { id: 'ob-2313', codigo: 'OB-2313', nome: 'Condomínio Porto Bello', cidade: 'Paulista', uf: 'PE', situacao: 'concluida', recebidaEm: '2023-10-09T07:00' },
  { id: 'ob-2407', codigo: 'OB-2407', nome: 'Torre Empresarial Derby', cidade: 'Recife', uf: 'PE', situacao: 'planejamento', recebidaEm: '2026-07-20T07:00' },
  { id: 'ob-2408', codigo: 'OB-2408', nome: 'Residencial Recanto dos Ipês', cidade: 'Camaragibe', uf: 'PE', situacao: 'emExecucao', recebidaEm: '2026-02-09T07:00' },
];

/** Reserva das Águas ainda não tem lista de exigências. */
export const obraListas: readonly ObraLista[] = [
  { obraId: 'ob-2401', listaId: 'hab-servico', vinculadaEm: '2026-01-10T16:40' },
  { obraId: 'ob-2401', listaId: 'seg-trabalho', vinculadaEm: '2026-01-10T16:40' },
  { obraId: 'ob-2401', listaId: 'hab-material', vinculadaEm: '2026-01-15T09:12' },
  { obraId: 'ob-2402', listaId: 'seg-trabalho', vinculadaEm: '2025-11-10T10:05' },
  { obraId: 'ob-2402', listaId: 'hab-material', vinculadaEm: '2025-11-10T10:05' },
  { obraId: 'ob-2403', listaId: 'seg-trabalho', vinculadaEm: '2025-10-01T14:30' },
  { obraId: 'ob-2403', listaId: 'hab-material', vinculadaEm: '2025-10-01T14:30' },
  { obraId: 'ob-2312', listaId: 'hab-servico', vinculadaEm: '2023-12-11T11:00' },
  { obraId: 'ob-2312', listaId: 'hab-material', vinculadaEm: '2023-12-11T11:00' },
  { obraId: 'ob-2312', listaId: 'obras-publicas', vinculadaEm: '2023-12-11T11:00' },
  { obraId: 'ob-2405', listaId: 'hab-servico', vinculadaEm: '2026-03-05T08:45' },
  { obraId: 'ob-2405', listaId: 'hab-material', vinculadaEm: '2026-03-05T08:45' },
  { obraId: 'ob-2406', listaId: 'hab-servico', vinculadaEm: '2025-07-20T15:10' },
  { obraId: 'ob-2406', listaId: 'hab-material', vinculadaEm: '2025-07-20T15:10' },
  { obraId: 'ob-2313', listaId: 'hab-servico', vinculadaEm: '2023-10-16T09:00' },
  { obraId: 'ob-2407', listaId: 'hab-servico', vinculadaEm: '2026-07-27T10:20' },
  { obraId: 'ob-2408', listaId: 'hab-servico', vinculadaEm: '2026-02-12T13:35' },
];

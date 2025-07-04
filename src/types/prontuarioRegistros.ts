export interface AnexoDetalhado {
    id: string;
    nomeOriginalArquivo: string;
    nomeArquivoArmazenado: string;
    tipoConteudo: string;
    tamanhoBytes?: number;
    dataUpload?: string;
    urlVisualizacao?: string;
}

export interface SinaisVitais {
    pressaoArterial?: string;
    temperatura?: string;
    frequenciaCardiaca?: string;
    saturacao?: string;
    hgt?: string;
}

export interface NovaConsultaRequest {
    dataConsulta?: string;
    motivoConsulta: string;
    queixasPrincipais: string;
    sinaisVitais?: SinaisVitais;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    condutaPlanoTerapeutico?: string;
    detalhesConsulta?: string;
    observacoesConsulta?: string;
    medicoExecutorId: number;
}

export interface AtualizarConsultaRequest {
    id?: string;
    dataConsulta?: string;
    motivoConsulta?: string;
    queixasPrincipais?: string;
    sinaisVitais?: SinaisVitais;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    condutaPlanoTerapeutico?: string;
    detalhesConsulta?: string;
    observacoesConsulta?: string;
    medicoExecutorId: number;
}

export interface ConsultaDetalhada {
    id: string;
    prontuarioId: string;
    dataConsulta: string;
    motivoConsulta?: string;
    queixasPrincipais?: string;
    sinaisVitais?: SinaisVitais;
    exameFisico?: string;
    hipoteseDiagnostica?: string;
    condutaPlanoTerapeutico?: string;
    detalhesConsulta?: string;
    observacoesConsulta?: string;
    responsavelId?: string | number;
    responsavelNomeCompleto?: string;
    responsavelEspecialidade?: string;
    responsavelCRM?: string;
    anexos?: AnexoDetalhado[];
    createdAt: string;
    updatedAt: string;
}

export interface AdicionarExameRequest {
    nome: string;
    resultado: string;
    observacoes?: string;
    arquivo?: File;
    dataExame?: string;
}

export interface AtualizarExameRequest {
    id?: string;
    dataExame?: string;
    nome?: string;
    resultado?: string;
    observacoes?: string;
    medicoResponsavelExameId?: number | null;
}

export type ExameDetalhado = import('./prontuario').Exame & {
    prontuarioId: string;
    dataExame: string;
    medicoResponsavelExameId?: number;
    medicoResponsavelExameNome?: string;
    medicoResponsavelExameEspecialidade?: string;
    medicoResponsavelExameCRM?: string;
};

export interface NovaEncaminhamentoRequest {
    dataEncaminhamento?: string;
    especialidadeDestino: string;
    motivoEncaminhamento: string;
    medicoSolicitanteId: number;
    observacoes?: string;
}

export interface AtualizarEncaminhamentoRequest {
    id?: string;
    dataEncaminhamento?: string;
    especialidadeDestino?: string;
    motivoEncaminhamento?: string;
    medicoSolicitanteId?: number | null;
    observacoes?: string;
}

export type EncaminhamentoDetalhada = import('./prontuario').Encaminhamento & {
    prontuarioId: string;
    dataEncaminhamento: string;
    medicoSolicitanteId?: number;
    medicoSolicitanteNome?: string;
    medicoSolicitanteCRM?: string;
    medicoSolicitanteEspecialidade?: string;
};

export interface NovaProcedimentoRequest {
    dataProcedimento?: string;
    descricaoProcedimento: string;
    relatorioProcedimento?: string;
    medicoExecutorId: number;
}

export interface AtualizarProcedimentoRequest {
    id?: string;
    dataProcedimento?: string;
    descricaoProcedimento?: string;
    relatorioProcedimento?: string;
    medicoExecutorId?: number | null;
}

export type ProcedimentoDetalhado = import('./prontuario').Procedimento & {
    prontuarioId: string;
    dataProcedimento: string;
    medicoExecutorId?: number;
    medicoExecutorNome?: string;
    medicoExecutorEspecialidade?: string;
    medicoExecutorCRM?: string;
};


export interface AdicionarAnotacaoRequest {
    texto: string;
}
export type AnotacaoGeralDetalhada = import('./prontuario').Anotacao & { prontuarioId: string };

export type TipoPrimeiroRegistro = 'CONSULTA' | 'EXAME' | 'PROCEDIMENTO' | 'ENCAMINHAMENTO';

export interface PrimeiroRegistroData {
    tipo: TipoPrimeiroRegistro;
    dadosConsulta?: NovaConsultaRequest;
    dadosExame?: AdicionarExameRequest;
    dadosProcedimento?: NovaProcedimentoRequest;
    dadosEncaminhamento?: NovaEncaminhamentoRequest;
}
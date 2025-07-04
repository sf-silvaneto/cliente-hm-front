import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter as FilterIcon, Edit2, Eye, ToggleLeft, ToggleRight, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { buscarMedicos, ativarMedico, inativarMedico } from '../../services/medicoService';
import { Medico, BuscaMedicoParams, ResultadoBuscaMedicos } from '../../types/medico';
import Card from '../../components/ui/Card';

interface MedicoSearchFormData {
  nome?: string;
  crm?: string;
  especialidade?: string;
  status?: 'ATIVO' | 'INATIVO' | '';
}

const MedicoTableComponent: React.FC<{
  medicos: Medico[];
  onEdit: (id: number) => void;
  onViewDetails: (id: number) => void;
  onToggleStatus: (id: number, isCurrentlyActive: boolean) => Promise<void>;
  isLoadingToggleOrDelete: boolean;
  medicoInAction: number | null;
}> = ({ medicos, onEdit, onViewDetails, onToggleStatus, isLoadingToggleOrDelete, medicoInAction }) => {

  const isMedicoAtivo = (medico: Medico): boolean => {
    return medico.deletedAt === null || medico.deletedAt === undefined;
  };

  const renderStatusBadge = (medico: Medico) => {
    const isActive = isMedicoAtivo(medico);
    return (
      <span
        className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          isActive ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'
        }`}
      >
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">CRM</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Especialidade</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {medicos.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-neutral-500">
                Nenhum médico encontrado.
              </td>
            </tr>
          ) : (
            medicos.map((medico) => (
              <tr key={medico.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-900">{medico.nomeCompleto}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{medico.crm}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">{medico.especialidade}</td>
                <td className="px-4 py-3 whitespace-nowrap">{renderStatusBadge(medico)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onViewDetails(medico.id)}
                      title="Visualizar Detalhes"
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onEdit(medico.id)}
                      title="Editar Médico"
                      className="p-1 text-primary-600 hover:text-primary-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => onToggleStatus(medico.id, isMedicoAtivo(medico))}
                        title={isMedicoAtivo(medico) ? "Inativar Médico" : "Ativar Médico"}
                        className={`p-1 ${isMedicoAtivo(medico) ? 'text-warning-600 hover:text-warning-800' : 'text-success-600 hover:text-success-800'}`}
                        isLoading={isLoadingToggleOrDelete && medicoInAction === medico.id}
                        disabled={isLoadingToggleOrDelete && medicoInAction === medico.id}
                    >
                        {isMedicoAtivo(medico) ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


const MedicoListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchFilters, setSearchFilters] = useState<MedicoSearchFormData>({
    nome: '',
    crm: '',
    especialidade: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [resultadoBusca, setResultadoBusca] = useState<ResultadoBuscaMedicos | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [medicoInAction, setMedicoInAction] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const fetchMedicos = useCallback(async (filters: MedicoSearchFormData, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: BuscaMedicoParams = {
        pagina: page,
        tamanho: pageSize,
        nome: filters.nome || undefined,
        crm: filters.crm || undefined,
        especialidade: filters.especialidade || undefined,
        status: filters.status || undefined,
        sort: 'nomeCompleto,asc',
      };
      const result = await buscarMedicos(params);
      setResultadoBusca(result);
    } catch (err: any) {
      setError(err.response?.data?.mensagem || 'Erro ao buscar médicos.');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchMedicos(searchFilters, currentPage);
  }, [fetchMedicos, searchFilters, currentPage]);

  useEffect(() => {
    const state = location.state as { medicoSuccess?: boolean, message?: string, medicoUpdateSuccess?: boolean };
    if ((state?.medicoSuccess || state?.medicoUpdateSuccess) && state?.message) {
        setSuccessMessage(state.message);
        if(state?.medicoSuccess || state?.medicoUpdateSuccess) {
            fetchMedicos(searchFilters, currentPage);
        }
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, fetchMedicos, searchFilters, currentPage]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'crm') {
      const cleanedInput = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      let numPart = "";
      let letterPart = "";
      let parsingNumbers = true;

      for (const char of cleanedInput) {
        if (parsingNumbers) {
          if (/\d/.test(char)) {
            numPart += char;
          } else if (/[A-Z]/.test(char)) {
            parsingNumbers = false;
            letterPart += char;
          }
        } else { 
          if (/[A-Z]/.test(char) && letterPart.length < 2) {
            letterPart += char;
          } else {
            break; 
          }
        }
      }
      if (letterPart.length > 0 && numPart.length === 0) {
        processedValue = ""; 
      } else {
        processedValue = numPart + letterPart;
      }

    } else if (name === 'nome' || name === 'especialidade') { 
      processedValue = value.replace(/[^a-zA-ZÀ-ú\s'-]/g, '');
    }
    setSearchFilters(prev => ({ ...prev, [name]: processedValue }));
    setCurrentPage(0); 
  };

  const handleClearFilters = () => {
    setSearchFilters({ nome: '', crm: '', especialidade: '', status: '' });
    setCurrentPage(0);
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const handleEditMedico = (id: number) => {
    navigate(`/medicos/${id}/editar`);
  };

  const handleViewMedicoDetails = (id: number) => {
    navigate(`/medicos/${id}`);
  };

  const handleToggleStatus = async (id: number, isCurrentlyActive: boolean) => {
    const actionText = isCurrentlyActive ? 'inativar' : 'ativar';
    const confirmAction = window.confirm(`Tem certeza que deseja ${actionText} este médico?`);
    if (confirmAction) {
      setIsLoadingAction(true);
      setMedicoInAction(id);
      setError(null);
      setSuccessMessage(null);
      try {
        if (isCurrentlyActive) {
            await inativarMedico(id);
            setSuccessMessage(`Médico inativado com sucesso.`);
        } else {
            await ativarMedico(id);
            setSuccessMessage(`Médico ativado com sucesso.`);
        }
        fetchMedicos(searchFilters, currentPage); 
      } catch (err: any) {
        setError(err.response?.data?.mensagem || `Erro ao ${actionText} o médico.`);
      } finally {
        setIsLoadingAction(false);
        setMedicoInAction(null);
      }
    }
  };

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' },
  ];
  
  const totalPages = resultadoBusca?.pageable.totalPages || 0;

  return (
    <div className="container-wide py-8">
        <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Gerenciar Médicos</h1>
        </div>
        
        {successMessage && (
            <Alert type="success" message={successMessage} className="mb-4" onClose={() => setSuccessMessage(null)} />
        )}
        {error && <Alert type="error" message={error} className="mb-4" onClose={() => setError(null)} />}

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
            <div className="flex-grow">
              <Input
                label="Buscar por Nome"
                name="nome"
                placeholder="Nome do médico..."
                value={searchFilters.nome}
                onChange={handleSearchChange}
                leftAddon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              leftIcon={<FilterIcon className="h-9 w-4" />}
              className="w-full md:w-auto"
            >
              Filtros Avançados
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 pt-3 border-t animate-slide-down">
              <Input
                label="CRM"
                name="crm"
                placeholder="CRM (Ex: 12345SP)"
                value={searchFilters.crm}
                onChange={handleSearchChange}
              />
              <Input
                label="Especialidade"
                name="especialidade"
                placeholder="Especialidade"
                value={searchFilters.especialidade}
                onChange={handleSearchChange}
              />
              <Select
                label="Status"
                name="status"
                options={statusOptions}
                value={searchFilters.status}
                onChange={handleSearchChange}
              />
            </div>
          )}
           {(searchFilters.nome || searchFilters.crm || searchFilters.especialidade || searchFilters.status) && (
            <div className="flex justify-end">
                <Button type="button" variant="link" size="sm" onClick={handleClearFilters} className="text-sm text-neutral-600 hover:text-error-600">
                    Limpar Filtros
                </Button>
            </div>
          )}
        </Card>

        <div className="flex justify-end items-center space-x-2 mb-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/painel-de-controle')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Voltar
          </Button>
          <Link to="/medicos/novo">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Adicionar Médico
            </Button>
          </Link>
        </div>

        {isLoading && !resultadoBusca ? (
             <div className="text-center py-10">
                <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                <p className="mt-2 text-neutral-500">Carregando médicos...</p>
            </div>
        ) : (
            <>
              <Card>
                <MedicoTableComponent 
                    medicos={resultadoBusca?.content || []}
                    onEdit={handleEditMedico}
                    onViewDetails={handleViewMedicoDetails} 
                    onToggleStatus={handleToggleStatus}
                    isLoadingToggleOrDelete={isLoadingAction}
                    medicoInAction={medicoInAction}
                />
              </Card>
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0 || isLoading}
                      className="rounded-r-none"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>
                    <span className="px-4 py-2 border-t border-b border-neutral-300 bg-white text-sm">
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="rounded-l-none"
                    >
                      Próxima <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
        )}
    </div>
  );
};

export default MedicoListPage;
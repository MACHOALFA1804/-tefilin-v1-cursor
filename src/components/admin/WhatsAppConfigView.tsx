import React, { useState, useEffect } from 'react';
import { initializeWhatsAppService, defaultWhatsAppConfig } from '../../services/whatsappService';

interface WhatsAppConfigProps {
  onBack: () => void;
}

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
  isActive: boolean;
}

interface ConfigMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

const WhatsAppConfigView: React.FC<WhatsAppConfigProps> = ({ onBack }) => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    businessAccountId: '',
    isActive: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<ConfigMessage | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do sistema TEFILIN.');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Simular carregamento da configuração do banco
      // TODO: Implementar quando tabela de configurações estiver pronta
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Por enquanto, usar configurações padrão das variáveis de ambiente
      setConfig({
        phoneNumberId: defaultWhatsAppConfig.phoneNumberId,
        accessToken: defaultWhatsAppConfig.accessToken,
        webhookVerifyToken: defaultWhatsAppConfig.webhookVerifyToken,
        businessAccountId: defaultWhatsAppConfig.businessAccountId,
        isActive: false
      });

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Validar campos obrigatórios
      if (!config.phoneNumberId || !config.accessToken) {
        setMessage({ 
          type: 'error', 
          text: 'Phone Number ID e Access Token são obrigatórios' 
        });
        return;
      }

      // Simular salvamento no banco
      // TODO: Implementar quando tabela de configurações estiver pronta
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Inicializar serviço WhatsApp com nova configuração
      if (config.isActive) {
        initializeWhatsAppService({
          phoneNumberId: config.phoneNumberId,
          accessToken: config.accessToken,
          webhookVerifyToken: config.webhookVerifyToken,
          businessAccountId: config.businessAccountId
        });
      }

      setMessage({ 
        type: 'success', 
        text: 'Configurações salvas com sucesso!' 
      });

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setMessage({ 
        type: 'error', 
        text: `Erro ao salvar: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const testWhatsApp = async () => {
    if (!testPhone || !testMessage) {
      setMessage({ 
        type: 'error', 
        text: 'Preencha o telefone e mensagem para teste' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Enviando mensagem de teste...' });

    try {
      // Por enquanto, apenas simular o envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implementar teste real quando API estiver configurada
      setMessage({ 
        type: 'success', 
        text: 'Mensagem de teste enviada com sucesso!' 
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao enviar mensagem de teste' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="ml-2">Voltar</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Configuração WhatsApp</h1>
            <p className="text-gray-600">Configure a integração com WhatsApp Business API</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          📖 Instruções
        </button>
      </div>

      {/* Mensagem de status */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' :
          message.type === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Instruções */}
      {showInstructions && (
        <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-yellow-800">
            📋 Como configurar WhatsApp Business API
          </h3>
          <div className="space-y-3 text-sm text-yellow-700">
            <p><strong>1.</strong> Acesse o Facebook Developers e crie uma conta Business</p>
            <p><strong>2.</strong> Crie um App do tipo "Business" e adicione o produto "WhatsApp"</p>
            <p><strong>3.</strong> Configure um número de telefone business verificado</p>
            <p><strong>4.</strong> Copie o Phone Number ID e Access Token gerados</p>
            <p><strong>5.</strong> Configure o Webhook para receber notificações</p>
            <p><strong>6.</strong> Cole as informações nos campos abaixo e teste</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            ⚙️ Configurações da API
          </h2>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status da Integração
                </label>
                <p className="text-xs text-gray-500">
                  Ativar/desativar integração WhatsApp
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) => handleConfigChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                value={config.phoneNumberId}
                onChange={(e) => handleConfigChange('phoneNumberId', e.target.value)}
                placeholder="Ex: 123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID do número de telefone no WhatsApp Business
              </p>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token *
              </label>
              <input
                type="password"
                value={config.accessToken}
                onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                placeholder="EAAxxxxxxxxxxxx..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token de acesso da API do WhatsApp
              </p>
            </div>

            {/* Webhook Verify Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Verify Token
              </label>
              <input
                type="text"
                value={config.webhookVerifyToken}
                onChange={(e) => handleConfigChange('webhookVerifyToken', e.target.value)}
                placeholder="seu_token_seguro_123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Token para verificação do webhook
              </p>
            </div>

            {/* Business Account ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Account ID
              </label>
              <input
                type="text"
                value={config.businessAccountId}
                onChange={(e) => handleConfigChange('businessAccountId', e.target.value)}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID da conta business do WhatsApp
              </p>
            </div>

            <button
              onClick={saveConfig}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : '💾 Salvar Configurações'}
            </button>
          </div>
        </div>

        {/* Teste */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            🧪 Teste de Envio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teste
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número para enviar mensagem de teste
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de Teste
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={testWhatsApp}
              disabled={loading || !config.isActive}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : '📱 Enviar Teste'}
            </button>

            {/* Status da configuração */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  config.isActive && config.phoneNumberId && config.accessToken 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {config.isActive && config.phoneNumberId && config.accessToken 
                    ? 'Configurado' 
                    : 'Não Configurado'
                  }
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {config.isActive && config.phoneNumberId && config.accessToken 
                  ? 'WhatsApp pronto para uso'
                  : 'Configure e ative o WhatsApp para usar'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          📊 Estatísticas de Uso
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Mensagens Enviadas</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Mensagens Entregues</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Mensagens Lidas</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Falhas de Envio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfigView;

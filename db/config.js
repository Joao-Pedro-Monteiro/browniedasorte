/**
 * Configura a conexao client-side com o Supabase para o app Brownie da Sorte.
 *
 * Este arquivo nao usa modules nem backend. Ele pode ser carregado com:
 *
 * @example
 * <script src="js/db/config.js" defer></script>
 *
 * @see {@link https://supabase.com/dashboard/project/_/settings/api}
*/

(function () {
    'use strict';

    console.log('config.js carregado');
    
    /**
     * URL publica do projeto Supabase.
     *
     * Encontre este valor em:
     * Supabase Dashboard > Project Settings > API > Project URL.
     *
     * @type {string}
    */
    var SUPABASE_URL = 'https://skaratjvkudmypwfzcqr.supabase.co'; 

    /**
     * Chave publica anonima do projeto Supabase.
     *
     * Use apenas a chave `anon public` no navegador. Nunca exponha a chave
     * `service_role` em aplicacoes client-side.
     *
     * @type {string}
    */
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXJhdGp2a3VkbXlwd2Z6Y3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzY1MTAsImV4cCI6MjA5NTc1MjUxMH0.Itom2ktBiW30fzvl7qSh5oPPsruuj8mcW-VuRAHsz70';
    
    /**
     * URL do SDK UMD do Supabase, compativel com scripts tradicionais.
     *
     * @type {string}
    */
    var SUPABASE_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    /**
     * Verifica se as credenciais placeholder foram substituidas.
     *
     * @returns {boolean} `true` quando URL e chave anonima parecem configuradas.
    */
    function hasConfigValues() {
        return SUPABASE_URL.indexOf('SEU-PROJETO') === -1
            && SUPABASE_ANON_KEY.indexOf('SUA_CHAVE') === -1;
    }

    /**
     * Cria o client Supabase global da aplicacao.
     *
     * O client fica disponivel em `window.brownieSupabase` para qualquer outro
     * script carregado na pagina. Quando estiver pronto, este metodo dispara o
     * evento `brownie:supabase-ready`.
     *
     * @fires Window#brownie:supabase-ready
     * @returns {void}
    */
    function createClient() {
        if (!window.supabase || !window.supabase.createClient) {
            console.error('SDK do Supabase nao foi carregado.');
            return;
        }

        if (!hasConfigValues()) {
            console.warn('Configure SUPABASE_URL e SUPABASE_ANON_KEY em js/db/config.js.');
            return;
        }

        window.brownieSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        window.dispatchEvent(new CustomEvent('brownie:supabase-ready', {
            detail: { client: window.brownieSupabase }
        }));
    }

    /**
     * Carrega o SDK do Supabase, caso ele ainda nao esteja disponivel.
     *
     * Se outro script ja carregou o SDK, o client e criado imediatamente. Se o
     * carregamento estiver em andamento, a criacao do client aguarda o evento
     * `load` do script existente.
     *
     * @returns {void}
    */
    function loadSupabaseSdk() {
        var existingScript = document.querySelector('script[data-supabase-sdk]');

        if (window.supabase && window.supabase.createClient) {
            createClient();
            return;
        }

        if (existingScript) {
            existingScript.addEventListener('load', createClient);
            return;
        }

        var script = document.createElement('script');
        script.src = SUPABASE_SDK_URL;
        script.defer = true;
        script.dataset.supabaseSdk = 'true';
        script.onload = createClient;
        script.onerror = function () {
            console.error('Nao foi possivel carregar o SDK do Supabase.');
        };

        document.head.appendChild(script);
    }

    loadSupabaseSdk();
})();

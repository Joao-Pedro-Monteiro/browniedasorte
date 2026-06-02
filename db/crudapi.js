/**
 * crudapi.js
 * Dependência: db/config.js — deve ser carregado ANTES deste arquivo.
 * db/config.js é responsável por definir window.brownieSupabase.
 */

/**
 * Verifica se o cliente Supabase foi inicializado corretamente.
 * Lança um erro descritivo caso não esteja disponível.
 */
function _assertClient() {
    if (!window.brownieSupabase) {
        throw new Error(
            "[crudapi] window.brownieSupabase é undefined. " +
            "Verifique se db/config.js está sendo carregado antes de crudapi.js " +
            "e se o cliente está sendo atribuído corretamente a window.brownieSupabase."
        );
    }
}

/**
 * Cria um ou mais registros em uma tabela.
 *
 * @param {string} table - Nome da tabela.
 * @param {Object|Object[]} data - Objeto ou array de objetos a serem inseridos.
 *   As chaves devem corresponder às colunas da tabela.
 * @returns {Promise<Object[]>} Array com os registros criados.
 *
 * @example
 * await db_create("products", { name: "Brownie", price: 15.00 });
 * await db_create("products", [{ name: "Brownie" }, { name: "Cookie" }]);
 */
async function db_create(table, data) {
    _assertClient();

    const { data: created, error } = await window.brownieSupabase
        .from(table)
        .insert(data)
        .select();

    if (error) {
        console.error("[crudapi] Erro ao criar registro:", error);
        throw new Error("Erro ao criar registro: " + error.message);
    }

    return created;
}

/**
 * Lê registros de uma tabela com base em um filtro de igualdade.
 *
 * @param {string} table - Nome da tabela.
 * @param {Object} [query={}] - Filtro no formato { coluna: valor }.
 *   Seleciona apenas linhas onde cada coluna é igual ao valor associado.
 *   Omitir ou passar {} retorna todos os registros.
 * @returns {Promise<Object[]>} Array com os registros encontrados.
 *
 * @example
 * await db_read("brownieCode", { used: false });
 * await db_read("brownieCode", { code: "BROWN001", used: false });
 */
async function db_read(table, query = {}) {
    _assertClient();

    const { data, error } = await window.brownieSupabase
        .from(table)
        .select("*")
        .match(query);

    if (error) {
        console.error("[crudapi] Erro ao ler registros:", error);
        throw new Error("Erro ao ler registros: " + error.message);
    }

    return data;
}

/**
 * Atualiza registros de uma tabela com base em um filtro de igualdade.
 *
 * @param {string} table - Nome da tabela.
 * @param {Object} query - Filtro no formato { coluna: valor }.
 *   Seleciona apenas linhas onde cada coluna é igual ao valor associado.
 * @param {Object} newData - Dados a serem atualizados. As chaves devem
 *   corresponder às colunas da tabela.
 * @returns {Promise<Object[]>} Array com os registros atualizados.
 *
 * @example
 * await db_update("brownieCode", { id: 1 }, { code: "A123" });
 */
async function db_update(table, query, newData) {
    _assertClient();

    const { data: updated, error } = await window.brownieSupabase
        .from(table)
        .update(newData)
        .match(query)
        .select();

    if (error) {
        console.error("[crudapi] Erro ao atualizar registros:", error);
        throw new Error("Erro ao atualizar registros: " + error.message);
    }

    return updated;
}

/**
 * Remove registros de uma tabela com base em um filtro de igualdade.
 *
 * @param {string} table - Nome da tabela.
 * @param {Object} query - Filtro no formato { coluna: valor }.
 *   Seleciona apenas linhas onde cada coluna é igual ao valor associado.
 * @returns {Promise<void>}
 *
 * @example
 * await db_delete("brownieCode", { id: 1 });
 */
async function db_delete(table, query) {
    _assertClient();

    const { error } = await window.brownieSupabase
        .from(table)
        .delete()
        .match(query);

    if (error) {
        console.error("[crudapi] Erro ao deletar registros:", error);
        throw new Error("Erro ao deletar registros: " + error.message);
    }
}
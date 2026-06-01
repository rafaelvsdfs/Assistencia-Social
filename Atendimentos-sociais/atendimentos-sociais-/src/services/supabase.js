import { store, TABLE_NAME } from './store';

// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://cblrzsbmauhebltsqkho.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Q4VHd-d5Fq83hzIF4eCEQ_2JWiJNQz';

export async function supabaseQuery(tabela, metodo, dados = null, id = null) {
    let url = `${SUPABASE_URL}/rest/v1/${tabela}`;
    if (id) url += `?id=eq.${id}`;

    const options = {
      method: metodo,
      headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
      }
    };

    if (dados) {
      options.body = JSON.stringify(dados);
    }

    try {
      const resposta = await fetch(url, options);
      const resultado = await resposta.json();

      console.log('STATUS:', resposta.status);
      console.log('RESULTADO:', JSON.stringify(resultado));

      if (Array.isArray(resultado)) {
        return resultado;
      } else if (resultado && typeof resultado === 'object') {
        return [resultado];
      } else {
        return [];
      }

    } catch (erro) {
      console.error('Erro na requisição:', erro);
      return null; // null = erro de rede
    }
}

/**
 * Envia um atendimento para o banco online
 * Retorna true se deu certo, false se falhou
 */
export async function enviarAtendimento(atendimento) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/protocolo`;

    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
      descricao: atendimento.description,
      agente:    atendimento.name,
      atendido:  atendimento.atendido,
      cpf:       atendimento.cpf,
      done:      atendimento.done,
      status:    true,
      categoria: atendimento.categoria, 
    }),
    });

    console.log('enviarAtendimento HTTP status:', resposta.status);

    // 201 = Created com sucesso
    if (resposta.status === 201 || resposta.status === 200) {
      return true;
    }

    // Loga o erro para depuração
    const corpo = await resposta.text();
    console.error('Erro Supabase:', resposta.status, corpo);
    return false;

  } catch (e) {
    console.error('Erro ao enviar atendimento:', e);
    return false;
  }
}

/**
 * Sincroniza todos os registros pendentes (status = false) com o Supabase
 * Retorna { enviados, falhas }
 */
export async function sincronizarPendentes() {
  const data = store.getTable(TABLE_NAME);
  const pendentes = Object.entries(data).filter(([_, item]) => !item.status);

  let enviados = 0;
  let falhas = 0;

  for (const [id, item] of pendentes) {
    const ok = await enviarAtendimento({
      description: item.descricao,
      name:        item.name,
      atendido:    item.atendido,
      cpf:         item.cpf,
      done:        item.done,
      categoria:   item.categoria,   
    });

    if (ok) {
      // Atualiza o status local para true
      store.setRow(TABLE_NAME, id, { ...item, status: true });
      enviados++;
    } else {
      falhas++;
    }
  }

  return { enviados, falhas, total: pendentes.length };
}

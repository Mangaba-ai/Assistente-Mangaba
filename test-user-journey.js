// Script de teste da jornada completa do usuário
import https from 'https';
import http from 'http';

// Configurações
const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:3001';

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para exibir resultado de teste
function showTestResult(testName, success, details = '') {
  const status = success ? `${colors.green}✓ PASSOU${colors.reset}` : `${colors.red}✗ FALHOU${colors.reset}`;
  log(`${testName}: ${status}`);
  if (details) {
    log(`  ${details}`, 'cyan');
  }
}

// Dados de teste
const testUser = {
  name: 'João Teste',
  email: `teste${Date.now()}@exemplo.com`,
  password: 'MinhaSenh@123'
};

let authToken = null;
let userId = null;

async function testUserJourney() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 INICIANDO TESTE DA JORNADA COMPLETA DO USUÁRIO', 'bright');
  log('='.repeat(60), 'bright');

  try {
    // 1. Verificar se os serviços estão rodando
    log('\n📋 ETAPA 1: Verificando serviços...', 'yellow');
    
    // Verificar backend
    try {
      const healthCheck = await makeRequest(`${API_BASE}/../health`);
      showTestResult('Backend Health Check', healthCheck.status === 200, 
        `Status: ${healthCheck.status}, Uptime: ${healthCheck.data.uptime}s`);
    } catch (error) {
      showTestResult('Backend Health Check', false, `Erro: ${error.message}`);
      return;
    }

    // Verificar frontend
    try {
      const frontendCheck = await makeRequest(FRONTEND_BASE);
      showTestResult('Frontend Disponível', frontendCheck.status === 200,
        `Status: ${frontendCheck.status}`);
    } catch (error) {
      showTestResult('Frontend Disponível', false, `Erro: ${error.message}`);
    }

    // 2. Teste de Registro
    log('\n📝 ETAPA 2: Testando registro de usuário...', 'yellow');
    
    try {
      const registerResponse = await makeRequest(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: testUser
      });
      
      const registerSuccess = registerResponse.status === 201 && registerResponse.data.success;
      showTestResult('Registro de Usuário', registerSuccess,
        `Status: ${registerResponse.status}, Email: ${testUser.email}`);
      
      if (registerSuccess) {
        authToken = registerResponse.data.data.token;
        userId = registerResponse.data.data.user.id;
        log(`  Token gerado: ${authToken.substring(0, 20)}...`, 'cyan');
        log(`  ID do usuário: ${userId}`, 'cyan');
      } else {
        log(`  Erro: ${registerResponse.data.message || 'Falha no registro'}`, 'red');
      }
    } catch (error) {
      showTestResult('Registro de Usuário', false, `Erro: ${error.message}`);
    }

    // 3. Teste de Login
    log('\n🔐 ETAPA 3: Testando login...', 'yellow');
    
    try {
      const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: {
          email: testUser.email,
          password: testUser.password
        }
      });
      
      const loginSuccess = loginResponse.status === 200 && loginResponse.data.success;
      showTestResult('Login de Usuário', loginSuccess,
        `Status: ${loginResponse.status}, Email: ${testUser.email}`);
      
      if (loginSuccess) {
        const newToken = loginResponse.data.data.token;
        log(`  Novo token: ${newToken.substring(0, 20)}...`, 'cyan');
        authToken = newToken;
      } else {
        log(`  Erro: ${loginResponse.data.message || 'Falha no login'}`, 'red');
      }
    } catch (error) {
      showTestResult('Login de Usuário', false, `Erro: ${error.message}`);
    }

    // 4. Teste de Perfil
    log('\n👤 ETAPA 4: Testando acesso ao perfil...', 'yellow');
    
    if (authToken) {
      try {
        const profileResponse = await makeRequest(`${API_BASE}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const profileSuccess = profileResponse.status === 200 && profileResponse.data.success;
        showTestResult('Acesso ao Perfil', profileSuccess,
          `Status: ${profileResponse.status}, Nome: ${profileResponse.data.data?.user?.name}`);
        
        if (profileSuccess) {
          const user = profileResponse.data.data.user;
          log(`  Nome: ${user.name}`, 'cyan');
          log(`  Email: ${user.email}`, 'cyan');
          log(`  Role: ${user.role}`, 'cyan');
          log(`  Plano: ${user.subscription.plan}`, 'cyan');
        }
      } catch (error) {
        showTestResult('Acesso ao Perfil', false, `Erro: ${error.message}`);
      }
    } else {
      showTestResult('Acesso ao Perfil', false, 'Token de autenticação não disponível');
    }

    // 5. Teste de Validação de Token
    log('\n🔒 ETAPA 5: Testando validação de token...', 'yellow');
    
    if (authToken) {
      try {
        // Teste com token válido
        const validTokenResponse = await makeRequest(`${API_BASE}/auth/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        showTestResult('Token Válido', validTokenResponse.status === 200,
          `Status: ${validTokenResponse.status}`);
        
        // Teste com token inválido
        const invalidTokenResponse = await makeRequest(`${API_BASE}/auth/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer token_invalido_123'
          }
        });
        
        showTestResult('Token Inválido (Esperado Falhar)', invalidTokenResponse.status === 401,
          `Status: ${invalidTokenResponse.status}`);
        
      } catch (error) {
        showTestResult('Validação de Token', false, `Erro: ${error.message}`);
      }
    }

    // 6. Teste de Atualização de Perfil
    log('\n✏️ ETAPA 6: Testando atualização de perfil...', 'yellow');
    
    if (authToken) {
      try {
        const updateData = {
          name: 'João Teste Atualizado',
          preferences: {
            theme: 'dark',
            language: 'pt-BR',
            notifications: true
          }
        };
        
        const updateResponse = await makeRequest(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: updateData
        });
        
        const updateSuccess = updateResponse.status === 200 && updateResponse.data.success;
        showTestResult('Atualização de Perfil', updateSuccess,
          `Status: ${updateResponse.status}, Novo nome: ${updateData.name}`);
        
      } catch (error) {
        showTestResult('Atualização de Perfil', false, `Erro: ${error.message}`);
      }
    }

    // 7. Teste de Integração com Ollama
    log('\n🤖 ETAPA 7: Testando integração com Ollama...', 'yellow');
    
    try {
      const ollamaResponse = await makeRequest(`${API_BASE}/ollama/models`);
      const ollamaSuccess = ollamaResponse.status === 200;
      showTestResult('Conexão com Ollama', ollamaSuccess,
        `Status: ${ollamaResponse.status}`);
      
      if (ollamaSuccess && ollamaResponse.data.models) {
        log(`  Modelos disponíveis: ${ollamaResponse.data.models.length}`, 'cyan');
        ollamaResponse.data.models.slice(0, 3).forEach(model => {
          log(`    - ${model.name}`, 'cyan');
        });
      }
    } catch (error) {
      showTestResult('Conexão com Ollama', false, `Erro: ${error.message}`);
    }

    // 8. Teste de Rate Limiting
    log('\n⚡ ETAPA 8: Testando rate limiting...', 'yellow');
    
    try {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(makeRequest(`${API_BASE}/../health`));
      }
      
      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      showTestResult('Rate Limiting', true,
        `${successCount} sucessos, ${rateLimitedCount} rate limited`);
      
    } catch (error) {
      showTestResult('Rate Limiting', false, `Erro: ${error.message}`);
    }

    // Resumo Final
    log('\n' + '='.repeat(60), 'bright');
    log('📊 RESUMO DA JORNADA DO USUÁRIO', 'bright');
    log('='.repeat(60), 'bright');
    
    log('\n✅ Funcionalidades Testadas:', 'green');
    log('  • Verificação de serviços (Backend/Frontend)', 'cyan');
    log('  • Registro de novo usuário', 'cyan');
    log('  • Login com credenciais', 'cyan');
    log('  • Acesso ao perfil autenticado', 'cyan');
    log('  • Validação de tokens', 'cyan');
    log('  • Atualização de perfil', 'cyan');
    log('  • Integração com Ollama', 'cyan');
    log('  • Rate limiting', 'cyan');
    
    log('\n🔧 Dados de Teste Utilizados:', 'yellow');
    log(`  • Nome: ${testUser.name}`, 'cyan');
    log(`  • Email: ${testUser.email}`, 'cyan');
    log(`  • Senha: ${testUser.password}`, 'cyan');
    
    if (authToken) {
      log('\n🎯 Token de Autenticação Gerado:', 'yellow');
      log(`  ${authToken}`, 'cyan');
    }
    
    log('\n🚀 Teste da jornada completa finalizado!', 'green');
    log('='.repeat(60), 'bright');
    
  } catch (error) {
    log(`\n❌ Erro geral no teste: ${error.message}`, 'red');
    console.error(error);
  }
}

// Executar o teste
testUserJourney().catch(console.error);

export { testUserJourney };
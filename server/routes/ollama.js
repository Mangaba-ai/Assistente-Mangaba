import express from 'express';
import { body, query, validationResult } from 'express-validator';
import ollamaService from '../services/ollamaService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware para validar erros
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/ollama/status
 * Testa a conexão com o Ollama
 */
router.get('/status', async (req, res) => {
  try {
    const status = await ollamaService.testConnection();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/models
 * Lista todos os modelos disponíveis
 */
router.get('/models', async (req, res) => {
  try {
    const models = await ollamaService.getAvailableModels();
    res.json({
      success: true,
      models
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar modelos',
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/generate
 * Gera uma resposta usando o Ollama
 */
router.post('/generate', [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt é obrigatório')
    .isLength({ max: 10000 })
    .withMessage('Prompt muito longo (máximo 10000 caracteres)'),
  body('model')
    .optional()
    .isString()
    .withMessage('Modelo deve ser uma string'),
  body('system')
    .optional()
    .isString()
    .withMessage('System prompt deve ser uma string'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature deve estar entre 0 e 2'),
  body('top_p')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Top_p deve estar entre 0 e 1'),
  body('top_k')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Top_k deve estar entre 1 e 100'),
  body('stream')
    .optional()
    .isBoolean()
    .withMessage('Stream deve ser um boolean'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      prompt,
      model,
      system,
      context,
      temperature,
      top_p,
      top_k,
      stream = false
    } = req.body;

    if (stream) {
      // Configurar headers para streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        await ollamaService.generateStreamResponse(
          prompt,
          { model, system, context, temperature, top_p, top_k },
          (chunk, data) => {
            // Enviar chunk para o cliente
            res.write(JSON.stringify({ 
              type: 'chunk', 
              content: chunk,
              done: data.done || false
            }) + '\n');
          }
        );
        
        res.write(JSON.stringify({ type: 'done' }) + '\n');
        res.end();
      } catch (error) {
        res.write(JSON.stringify({ 
          type: 'error', 
          message: error.message 
        }) + '\n');
        res.end();
      }
    } else {
      const result = await ollamaService.generateResponse(prompt, {
        model,
        system,
        context,
        temperature,
        top_p,
        top_k
      });
      
      res.json(result);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar resposta',
        error: error.message
      });
    }
  }
});

/**
 * POST /api/ollama/embeddings
 * Gera embeddings para um texto
 */
router.post('/embeddings', [
  authMiddleware,
  body('text')
    .notEmpty()
    .withMessage('Texto é obrigatório')
    .isLength({ max: 5000 })
    .withMessage('Texto muito longo (máximo 5000 caracteres)'),
  body('model')
    .optional()
    .isString()
    .withMessage('Modelo deve ser uma string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { text, model } = req.body;
    
    const result = await ollamaService.generateEmbeddings(text, model);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar embeddings',
      error: error.message
    });
  }
});

/**
 * POST /api/ollama/pull
 * Baixa um modelo do repositório
 */
router.post('/pull', [
  authMiddleware,
  body('model')
    .notEmpty()
    .withMessage('Nome do modelo é obrigatório')
    .isString()
    .withMessage('Nome do modelo deve ser uma string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { model } = req.body;
    
    // Verificar se o usuário tem permissão para baixar modelos
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem baixar modelos'
      });
    }

    // Configurar headers para streaming do progresso
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await ollamaService.pullModel(model, (progress) => {
      res.write(JSON.stringify(progress) + '\n');
    });
    
    res.write(JSON.stringify(result) + '\n');
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erro ao baixar modelo',
        error: error.message
      });
    } else {
      res.write(JSON.stringify({
        success: false,
        message: 'Erro ao baixar modelo',
        error: error.message
      }) + '\n');
      res.end();
    }
  }
});

/**
 * DELETE /api/ollama/models/:modelName
 * Remove um modelo
 */
router.delete('/models/:modelName', [
  authMiddleware
], async (req, res) => {
  try {
    const { modelName } = req.params;
    
    // Verificar se o usuário tem permissão para remover modelos
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem remover modelos'
      });
    }

    const result = await ollamaService.deleteModel(modelName);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover modelo',
      error: error.message
    });
  }
});

/**
 * GET /api/ollama/model/:modelName/check
 * Verifica se um modelo específico está disponível
 */
router.get('/model/:modelName/check', authMiddleware, async (req, res) => {
  try {
    const { modelName } = req.params;
    
    const isAvailable = await ollamaService.isModelAvailable(modelName);
    
    res.json({
      success: true,
      model: modelName,
      available: isAvailable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar modelo',
      error: error.message
    });
  }
});

export default router;
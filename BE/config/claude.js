const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Anthropic } = require('@anthropic-ai/sdk');

// Inicializar el SDK de Anthropic usando la variable de entorno ANTHROPIC_API_KEY
const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = claude;

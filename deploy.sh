#!/bin/bash
set -e

echo "=========================================="
echo "   Publicação - Gestão Integrada RH       "
echo "=========================================="

echo "1. Compilando o projeto para produção..."
npm run build

echo ""
echo "Compilação concluída com sucesso na pasta 'dist/'!"
echo ""
echo "Opções de Publicação:"
echo "------------------------------------------"
echo "A) Publicar no Google Cloud Run (Container):"
echo "   gcloud run deploy gestao-rh --source . --port 3000 --allow-unauthenticated"
echo ""
echo "B) Publicar no Firebase Hosting:"
echo "   firebase deploy --only hosting"
echo ""
echo "C) Executar localmente com Docker:"
echo "   docker build -t gestao-rh ."
echo "   docker run -p 3000:3000 gestao-rh"
echo ""
echo "D) Deploy estático (Vercel, Netlify, S3, Cloudflare Pages):"
echo "   Basta fazer o upload do conteúdo da pasta 'dist/' ou do arquivo 'dist-deploy.zip'."
echo "=========================================="

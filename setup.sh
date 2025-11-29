#!/bin/bash

echo "🚀 Configuración del Dashboard Retell AI"
echo "========================================"
echo ""

# Verificar que node está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
else
    echo "✅ Dependencias ya instaladas"
    echo ""
fi

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo ""
    echo "Necesitas crear un archivo .env con las siguientes variables:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key"
    echo "SUPABASE_TABLE=retell_calls"
    echo ""
    echo "¿Quieres copiar las credenciales del proyecto anterior? (s/n)"
    read -r respuesta
    
    if [ "$respuesta" = "s" ]; then
        if [ -f "../metrics-LT/.env" ]; then
            cp "../metrics-LT/.env" ".env"
            echo "✅ Archivo .env copiado"
            echo ""
        else
            echo "❌ No se encontró el archivo .env en el proyecto anterior"
            echo "Por favor crea el archivo .env manualmente"
            exit 1
        fi
    else
        echo ""
        echo "Por favor crea el archivo .env manualmente antes de continuar"
        exit 1
    fi
else
    echo "✅ Archivo .env encontrado"
    echo ""
fi

echo "✨ Configuración completa!"
echo ""
echo "Para iniciar el dashboard ejecuta:"
echo "  npm run dev"
echo ""
echo "El dashboard estará disponible en: http://localhost:3000"
echo ""


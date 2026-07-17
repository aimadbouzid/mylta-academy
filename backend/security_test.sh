#!/bin/bash

echo "=== TEST 1: En-têtes de sécurité (Helmet) & X-Powered-By masqué ==="
curl -s -I http://localhost:3000/api/health | grep -iE "^(x-|content-security-policy)"
echo ""

echo "=== TEST 2: Health Check sans infos sensibles ==="
curl -s http://localhost:3000/api/health
echo -e "\n"

echo "=== TEST 3: Webhook Edahabia (Protection HMAC) ==="
curl -s -X POST http://localhost:3000/api/payments/edahabia/webhook \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "123", "courseId": 1, "userId": 1, "amount": 1000, "status": "SUCCESS"}'
echo -e "\n"

echo "=== TEST 4: Protection du dossier des reçus (/uploads/receipts) ==="
curl -s -I http://localhost:3000/uploads/receipts/test.jpg | head -n 1
echo ""

echo "=== TEST 5: Validation de l'email à l'inscription ==="
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pas-un-email", "password":"password123", "name":"Hacker"}'
echo -e "\n"

echo "=== TEST 6: Protection des URLs de vidéo éphémères ==="
curl -s http://localhost:3000/api/video/1
echo -e "\n"


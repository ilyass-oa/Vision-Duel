# Vision-Duel

Application web pour certifier une IA de classification d'images (chat / pas chat).
Deux modeles sont compares a travers trois tests : duel, stress test et incertitude.

## Prerequis

- Python 3 avec PyTorch, Flask, Flask-CORS, Pillow
- Node.js avec npm
- ngrok (pour exposition publique)

## Lancement

### Local uniquement

```bash
chmod +x start.sh  # Une seule fois
./start.sh
```

Ouvrir http://localhost:3000

### Stand/démonstration (avec QR code)

**Terminal 1 - Application :**
```bash
./start.sh
```

**Terminal 2 - Tunnel ngrok :**
```bash
ngrok http 3000
```

**Terminal 3 - QR code :**
```bash
sudo apt install qrencode  # Si pas déjà installé
NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])")
echo "URL: $NGROK_URL"
qrencode -o vision-duel-qr.png -s 10 "$NGROK_URL"
```

Le fichier `vision-duel-qr.png` est généré → l'afficher/imprimer pour les visiteurs.

## Architecture

- **Backend Flask** : port 5000 (API + modèles IA)
- **Frontend Vite/React** : port 3000 (interface utilisateur)
- Le frontend proxyfie les appels `/api/*` vers le backend
- ngrok expose le port 3000 publiquement avec HTTPS
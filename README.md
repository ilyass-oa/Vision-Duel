# Vision-Duel

Application web pour certifier une IA de classification d'images (chat / pas chat).
Deux modeles sont compares a travers trois tests : duel, stress test et incertitude.

## Prerequis

- Python 3 avec PyTorch, Flask, Flask-CORS, Pillow
- Node.js avec npm
- ngrok (pour exposition publique)

## Lancement

### Lancement local uniquement

Donner les droits d'execution au script si ce n'est pas encore fait :
```bash
chmod +x start.sh 
```

Lancer le script :
```bash
./start.sh
```

Ouvrir http://localhost:3000.

### Lancement public (stand/démonstration)

Pour exposer le site via QR code :

1. **Lancer l'application** (dans un terminal) :
```bash
./start.sh
```

2. **Lancer ngrok** (dans un second terminal) :
```bash
ngrok http 3000
```

3. **Récupérer l'URL publique** et générer le QR code :
```bash
# L'URL s'affiche dans le terminal ngrok
# Ou via l'API locale :
curl -s http://127.0.0.1:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"

# Générer le QR code (remplacer par votre URL) :
qrencode -o vision-duel-qr.png -s 10 "https://votre-url.ngrok-free.dev"
```

**⚠️ Important** : Gardez les deux terminaux ouverts pendant toute la durée du stand.

## Architecture

- **Backend Flask** : port 5000 (API + modèles IA)
- **Frontend Vite/React** : port 3000 (interface utilisateur)
- Le frontend proxyfie les appels `/api/*` vers le backend
- ngrok expose le port 3000 publiquement avec HTTPS
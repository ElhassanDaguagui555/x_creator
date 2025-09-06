import requests
import os

# ⚡ Mets ta clé Unsplash ici (Access Key)
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "65MCEUYbjTpySGHfTTkN46t-GnJ04Z0RE0YoLcG2b5I")

def get_image(query: str) -> str:
    """
    Recherche une image sur Unsplash en fonction d’un mot clé.
    Retourne l’URL de la première image trouvée ou une image par défaut.
    """
    try:
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": query,
            "client_id": UNSPLASH_ACCESS_KEY,
            "per_page": 1
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                return data["results"][0]["urls"]["regular"]  # ✅ URL de l'image
            else:
                return "https://via.placeholder.com/600x400.png?text=Aucune+image+trouvée"
        else:
            print(f"Erreur Unsplash API: {response.status_code}, {response.text}")
            return "https://via.placeholder.com/600x400.png?text=Erreur+API"

    except Exception as e:
        print("Erreur dans get_image:", e)
        return "https://via.placeholder.com/600x400.png?text=Erreur+serveur"

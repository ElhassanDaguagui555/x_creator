import google.generativeai as genai
import os
import json
from typing import Dict, List, Optional

class AIService:
    def __init__(self):
        """
        Initialise le service d'IA avec la configuration Gemini.
        La variable d'environnement GOOGLE_API_KEY doit être configurée.
        """
        genai.configure(api_key="AIzaSyAhlge2ijMBjkOBGZB4UBgitmL5MOI7tZs")
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def generate_post_content(self, prompt: str, platform: str = "general", 
                            tone: str = "professional", max_length: int = 280) -> Dict:
        """
        Génère du contenu de post basé sur un prompt utilisateur.
        """
        try:
            platform_instructions = self._get_platform_instructions(platform, max_length)
            
            system_prompt = f"""Tu es un expert en création de contenu pour les médias sociaux. 
            Génère un post {tone} pour {platform}. 
            {platform_instructions}
            
            Règles importantes:
            - Respecte la limite de caractères: {max_length}
            - Utilise un ton {tone}
            - Inclus des hashtags pertinents si approprié pour la plateforme
            - Le contenu doit être engageant et authentique
            """
            
            response = self.model.generate_content(
                [system_prompt, prompt]
            )
            
            generated_content = response.text.strip()
            
            return {
                "success": True,
                "content": generated_content,
                "platform": platform,
                "tone": tone,
                "character_count": len(generated_content),
                "model_used": "gemini-pro",
                "prompt_used": prompt
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": None
            }
    
    def generate_hashtags(self, content: str, platform: str = "general", count: int = 5) -> List[str]:
        """
        Génère des hashtags pertinents pour un contenu donné.
        """
        try:
            system_prompt = f"""Génère {count} hashtags pertinents et populaires pour ce contenu sur {platform}.
            Les hashtags doivent être:
            - Pertinents au contenu
            - Populaires sur {platform}
            - Sans espaces (format #hashtag)
            - Variés (mix de hashtags généraux et spécifiques)
            
            Retourne uniquement les hashtags, un par ligne, sans numérotation."""
            
            response = self.model.generate_content(
                [system_prompt, f"Contenu: {content}"]
            )
            
            hashtags_text = response.text.strip()
            hashtags = [tag.strip() for tag in hashtags_text.split("\n") if tag.strip().startswith("#")]
            
            return hashtags[:count]
            
        except Exception as e:
            print(f"Erreur lors de la génération des hashtags: {e}")
            return []
    
    def improve_content(self, content: str, improvement_type: str = "engagement") -> Dict:
        """
        Améliore un contenu existant selon un type d'amélioration spécifique.
        """
        try:
            improvement_instructions = {
                "engagement": "Rends ce contenu plus engageant et accrocheur",
                "clarity": "Améliore la clarté et la lisibilité de ce contenu",
                "tone": "Ajuste le ton pour qu'il soit plus professionnel",
                "brevity": "Raccourcis ce contenu tout en gardant l'essentiel",
                "positive": "Rends ce contenu plus positif et optimiste"
            }
            
            instruction = improvement_instructions.get(improvement_type, 
                                                     "Améliore ce contenu de manière générale")
            
            system_prompt = f"""{instruction}.
            Garde le même message principal mais améliore la formulation, la structure et l'impact.
            Retourne uniquement le contenu amélioré."""
            
            response = self.model.generate_content(
                [system_prompt, content]
            )
            
            improved_content = response.text.strip()
            
            return {
                "success": True,
                "original_content": content,
                "improved_content": improved_content,
                "improvement_type": improvement_type
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "improved_content": None
            }
    
    def analyze_sentiment(self, content: str) -> Dict:
        """
        Analyse le sentiment d'un contenu donné (positif, négatif, neutre).
        """
        try:
            system_prompt = """Analyse le sentiment du contenu suivant et retourne uniquement l'un des mots suivants : 'positive', 'negative', 'neutral'.
            Ne donne aucune explication, juste le mot correspondant au sentiment dominant."""
            
            response = self.model.generate_content(
                [system_prompt, f"Contenu: {content}"]
            )
            
            sentiment = response.text.strip().lower()
            if sentiment not in ['positive', 'negative', 'neutral']:
                sentiment = 'neutral'
            
            return {
                "success": True,
                "sentiment": sentiment,
                "content": content
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "sentiment": None
            }
    
    def suggest_content(self, previous_posts: List[str], count: int = 3) -> Dict:
        """
        Suggère des idées de contenu basées sur les posts précédents.
        """
        try:
            system_prompt = f"""Tu es un expert en création de contenu pour les médias sociaux.
            En te basant sur les posts précédents de l'utilisateur, suggère {count} idées de contenu originales et engageantes.
            Les idées doivent être:
            - Similaires en style et thématique aux posts précédents
            - Innovantes et variées
            - Formulées comme des prompts courts pour générer un nouveau post
            
            Posts précédents:
            {json.dumps(previous_posts, ensure_ascii=False)}
            
            Retourne uniquement une liste de {count} prompts, un par ligne."""
            
            response = self.model.generate_content(
                [system_prompt]
            )
            
            suggestions_text = response.text.strip()
            suggestions = suggestions_text.split("\n")[:count]
            
            return {
                "success": True,
                "suggestions": suggestions
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "suggestions": []
            }
    
    def _get_platform_instructions(self, platform: str, max_length: int) -> str:
        """
        Retourne les instructions spécifiques à chaque plateforme.
        """
        instructions = {
            "x": f"Pour X (Twitter): Sois concis et percutant. Limite: {max_length} caractères. Utilise des hashtags stratégiquement.",
            "facebook": "Pour Facebook: Peux être plus long et narratif. Encourage l'interaction avec des questions.",
            "instagram": "Pour Instagram: Focus sur le visuel et l'émotion. Utilise des emojis et des hashtags populaires.",
            "linkedin": "Pour LinkedIn: Ton professionnel et informatif. Focus sur la valeur ajoutée et l'expertise.",
            "general": f"Contenu polyvalent adaptable à plusieurs plateformes. Limite: {max_length} caractères."
        }
        
        return instructions.get(platform, instructions["general"])
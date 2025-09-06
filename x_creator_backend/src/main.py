import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.user import db
from routes.user import user_bp
from routes.posts import posts_bp
from routes.auth import auth_bp
from services.scheduler import schedule_posts
from api_images import get_image  # fonction pour récupérer une image

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(__file__), 'static')
)

# Configuration
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-very-secure'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://elhassan:elhassan123@localhost:5432/x_creator_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialisation des extensions
CORS(app)  # Autorise toutes les origines
JWTManager(app)
db.init_app(app)

# Enregistrement des blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(posts_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')

# Création des tables si elles n'existent pas
with app.app_context():
    db.create_all()

# Lancement du scheduler
schedule_posts()

# =========================
# ROUTES
# =========================

# Génération d'image via POST
@app.route("/api/generate-image", methods=["POST"])
def generate_image():
    try:
        data = request.get_json()
        if not data or "prompt" not in data:
            return jsonify({"error": "Le paramètre 'prompt' est requis"}), 400

        prompt = data["prompt"]
        img_url = get_image(prompt)
        return jsonify({"image_url": img_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Servir les fichiers statiques et index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    full_path = os.path.join(static_folder_path, path)

    if path != "" and os.path.exists(full_path):
        return send_from_directory(static_folder_path, path)
    index_path = os.path.join(static_folder_path, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_folder_path, 'index.html')
    return "index.html not found", 404

# =========================
# MAIN
# =========================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

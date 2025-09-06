from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import db, User

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Retourne la liste de tous les utilisateurs (pour admin ou test)."""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/users/<id>', methods=['GET'])
@jwt_required()
def get_user(id):
    """Retourne les détails d'un utilisateur spécifique."""
    current_user_id = get_jwt_identity()  # String from JWT
    if current_user_id != str(id):  # Convert id to string for comparison
        return jsonify({'error': 'Forbidden'}), 403
    
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict()), 200
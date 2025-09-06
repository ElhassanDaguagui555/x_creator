from flask import Blueprint, jsonify, request
from datetime import datetime
from models.post import Post, db
from services.ai_service import AIService
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

posts_bp = Blueprint('posts', __name__)
ai_service = AIService()

@posts_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """Récupère tous les posts d'un utilisateur."""
    user_id = get_jwt_identity()
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Crée un nouveau post."""
    user_id = get_jwt_identity()
    data = request.json
    
    post = Post(
        user_id=user_id,
        content=data['content'],
        platform=data.get('platform', 'general'),
        platform_account=data.get('platform_account'),
        status=data.get('status', 'draft'),
        scheduled_at=datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None,
        ai_generated=data.get('ai_generated', False),
        ai_prompt=data.get('ai_prompt'),
        media_urls=json.dumps(data.get('media_urls', []))
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict()), 201

@posts_bp.route('/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """Récupère un post spécifique."""
    user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id, user_id=user_id).first_or_404()
    return jsonify(post.to_dict())

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Met à jour un post existant."""
    user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id, user_id=user_id).first_or_404()
    data = request.json
    
    post.content = data.get('content', post.content)
    post.platform = data.get('platform', post.platform)
    post.platform_account = data.get('platform_account', post.platform_account)
    post.status = data.get('status', post.status)
    post.scheduled_at = datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else post.scheduled_at
    post.media_urls = json.dumps(data.get('media_urls', json.loads(post.media_urls or '[]')))
    post.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(post.to_dict())

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Supprime un post."""
    user_id = get_jwt_identity()
    post = Post.query.filter_by(id=post_id, user_id=user_id).first_or_404()
    db.session.delete(post)
    db.session.commit()
    return '', 204

@posts_bp.route('/posts/generate', methods=['POST'])
@jwt_required()
def generate_post_content():
    """Génère du contenu de post avec l'IA."""
    data = request.json
    
    if not data.get('prompt'):
        return jsonify({'error': 'Le prompt est requis'}), 400
    
    result = ai_service.generate_post_content(
        prompt=data['prompt'],
        platform=data.get('platform', 'general'),
        tone=data.get('tone', 'professional'),
        max_length=data.get('max_length', 280)
    )
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify({'error': result['error']}), 500

@posts_bp.route('/posts/hashtags', methods=['POST'])
@jwt_required()
def generate_hashtags():
    """Génère des hashtags pour un contenu."""
    data = request.json
    
    if not data.get('content'):
        return jsonify({'error': 'Le contenu est requis'}), 400
    
    hashtags = ai_service.generate_hashtags(
        content=data['content'],
        platform=data.get('platform', 'general'),
        count=data.get('count', 5)
    )
    
    return jsonify({'hashtags': hashtags})

@posts_bp.route('/posts/improve', methods=['POST'])
@jwt_required()
def improve_content():
    """Améliore un contenu existant."""
    data = request.json
    
    if not data.get('content'):
        return jsonify({'error': 'Le contenu est requis'}), 400
    
    result = ai_service.improve_content(
        content=data['content'],
        improvement_type=data.get('improvement_type', 'engagement')
    )
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify({'error': result['error']}), 500

@posts_bp.route('/posts/analyze-sentiment', methods=['POST'])
@jwt_required()
def analyze_sentiment():
    """Analyse le sentiment d'un contenu."""
    data = request.json
    
    if not data.get('content'):
        return jsonify({'error': 'Le contenu est requis'}), 400
    
    result = ai_service.analyze_sentiment(content=data['content'])
    
    if result['success']:
        return jsonify(result)
    else:
        return jsonify({'error': result['error']}), 500

@posts_bp.route('/posts/suggest', methods=['POST'])
@jwt_required()
def suggest_content():
    """Suggère des idées de contenu basées sur les posts de l'utilisateur."""
    user_id = get_jwt_identity()
    data = request.json
    count = data.get('count', 3)
    
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).limit(10).all()
    previous_content = [post.content for post in posts]
    
    result = ai_service.suggest_content(previous_content, count=count)
    
    if result['success']:
        return jsonify({'suggestions': result['suggestions']})
    else:
        return jsonify({'error': result['error']}), 500

@posts_bp.route('/posts/ai-create', methods=['POST'])
@jwt_required()
def ai_create_post():
    """Crée un post complet avec l'IA et le sauvegarde."""
    user_id = get_jwt_identity()
    data = request.json
    
    if not data.get('prompt'):
        return jsonify({'error': 'Le prompt est requis'}), 400
    
    ai_result = ai_service.generate_post_content(
        prompt=data['prompt'],
        platform=data.get('platform', 'general'),
        tone=data.get('tone', 'professional'),
        max_length=data.get('max_length', 280)
    )
    
    if not ai_result['success']:
        return jsonify({'error': ai_result['error']}), 500
    
    hashtags = []
    if data.get('include_hashtags', True):
        hashtags = ai_service.generate_hashtags(
            content=ai_result['content'],
            platform=data.get('platform', 'general'),
            count=data.get('hashtag_count', 3)
        )
    
    final_content = ai_result['content']
    if hashtags:
        final_content += '\n\n' + ' '.join(hashtags)
    
    post = Post(
        user_id=user_id,
        content=final_content,
        platform=data.get('platform', 'general'),
        platform_account=data.get('platform_account'),
        status=data.get('status', 'draft'),
        scheduled_at=datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else None,
        ai_generated=True,
        ai_prompt=data['prompt'],
        media_urls=json.dumps(data.get('media_urls', []))
    )
    
    db.session.add(post)
    db.session.commit()
    
    response = post.to_dict()
    response['ai_generation_details'] = ai_result
    response['generated_hashtags'] = hashtags
    
    return jsonify(response), 201
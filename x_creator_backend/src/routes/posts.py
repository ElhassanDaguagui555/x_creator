from flask import Blueprint, jsonify, request
from datetime import datetime
from models.post import Post, db
from services.ai_service import AIService
import json

posts_bp = Blueprint('posts', __name__)
ai_service = AIService()

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    """Récupère tous les posts d'un utilisateur."""
    user_id = request.args.get('user_id')
    if user_id:
        posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    else:
        posts = Post.query.order_by(Post.created_at.desc()).all()
    
    return jsonify([post.to_dict() for post in posts])

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    """Crée un nouveau post."""
    data = request.json
    
    post = Post(
        user_id=data['user_id'],
        content=data['content'],
        platform=data.get('platform', 'general'),
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
def get_post(post_id):
    """Récupère un post spécifique."""
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict())

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Met à jour un post existant."""
    post = Post.query.get_or_404(post_id)
    data = request.json
    
    post.content = data.get('content', post.content)
    post.platform = data.get('platform', post.platform)
    post.status = data.get('status', post.status)
    post.scheduled_at = datetime.fromisoformat(data['scheduled_at']) if data.get('scheduled_at') else post.scheduled_at
    post.media_urls = json.dumps(data.get('media_urls', json.loads(post.media_urls or '[]')))
    post.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(post.to_dict())

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Supprime un post."""
    post = Post.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return '', 204

@posts_bp.route('/posts/generate', methods=['POST'])
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

@posts_bp.route('/posts/ai-create', methods=['POST'])
def ai_create_post():
    """Crée un post complet avec l'IA et le sauvegarde."""
    data = request.json
    
    if not data.get('prompt') or not data.get('user_id'):
        return jsonify({'error': 'Le prompt et user_id sont requis'}), 400
    
    # Génère le contenu avec l'IA
    ai_result = ai_service.generate_post_content(
        prompt=data['prompt'],
        platform=data.get('platform', 'general'),
        tone=data.get('tone', 'professional'),
        max_length=data.get('max_length', 280)
    )
    
    if not ai_result['success']:
        return jsonify({'error': ai_result['error']}), 500
    
    # Génère des hashtags si demandé
    hashtags = []
    if data.get('include_hashtags', True):
        hashtags = ai_service.generate_hashtags(
            content=ai_result['content'],
            platform=data.get('platform', 'general'),
            count=data.get('hashtag_count', 3)
        )
    
    # Combine le contenu et les hashtags
    final_content = ai_result['content']
    if hashtags:
        final_content += '\n\n' + ' '.join(hashtags)
    
    # Crée le post en base de données
    post = Post(
        user_id=data['user_id'],
        content=final_content,
        platform=data.get('platform', 'general'),
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


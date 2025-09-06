from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from models.user import db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    platform_account = db.Column(db.String(100), nullable=True)  # Nom du compte sur la plateforme
    status = db.Column(db.String(20), default='draft')
    scheduled_at = db.Column(db.DateTime, nullable=True)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ai_generated = db.Column(db.Boolean, default=False)
    ai_prompt = db.Column(db.Text, nullable=True)
    media_urls = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Post {self.id} by User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'platform': self.platform,
            'platform_account': self.platform_account,
            'status': self.status,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'ai_generated': self.ai_generated,
            'ai_prompt': self.ai_prompt,
            'media_urls': self.media_urls
        }
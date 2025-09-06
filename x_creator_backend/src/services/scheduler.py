import threading
import time
from datetime import datetime
from models.post import Post, db


def publish_post(post):
    from main import app
    """Simule la publication d'un post sur une plateforme."""
    print(f"Publishing post {post.id} on {post.platform} with account {post.platform_account}")
    with app.app_context():
        post.status = 'published'
        post.published_at = datetime.utcnow()
        db.session.commit()

def schedule_posts():
    from main import app
    """Vérifie périodiquement les posts à publier."""
    def run_scheduler():
        while True:
            with app.app_context():
                now = datetime.utcnow()
                posts = Post.query.filter_by(status='scheduled').filter(Post.scheduled_at <= now).all()
                for post in posts:
                    publish_post(post)
            time.sleep(60)  # Vérifie toutes les minutes

    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()


import threading
import time
from datetime import datetime
from models.post import db, Post
from flask import current_app
import facebook
import os
from dotenv import load_dotenv

load_dotenv()

def publish_post(post):
    """Publish a post to the specified platform."""
    try:
        if post.platform == 'facebook':
            # Initialize Facebook Graph API
            graph = facebook.GraphAPI(access_token=os.getenv('FACEBOOK_PAGE_ACCESS_TOKEN'))
            # Post to the Facebook Page
            message = f"{post.content} {' '.join(post.hashtags or [])}"
            graph.put_object(
                parent_object=os.getenv('FACEBOOK_PAGE_ID'),
                connection_name='feed',
                message=message
            )
            print(f"Published post {post.id} on Facebook Page {os.getenv('FACEBOOK_PAGE_ID')}")
        else:
            # Existing logic for other platforms (e.g., x)
            print(f"Publishing post {post.id} on {post.platform} with account {post.platform_account}")
        
        # Update post status
        post.status = 'published'
        post.published_at = datetime.utcnow()
        db.session.commit()
    except Exception as e:
        print(f"Error publishing post {post.id}: {str(e)}")
        db.session.rollback()

def start_scheduler():
    """Start the scheduler to check for posts to publish."""
    def run():
        with current_app.app_context():
            while True:
                now = datetime.utcnow()
                posts = Post.query.filter_by(status='scheduled').filter(Post.scheduled_at <= now).all()
                for post in posts:
                    publish_post(post)
                time.sleep(60)  # Check every minute

    print("Scheduler started successfully")
    scheduler_thread = threading.Thread(target=run, daemon=True)
    scheduler_thread.start()
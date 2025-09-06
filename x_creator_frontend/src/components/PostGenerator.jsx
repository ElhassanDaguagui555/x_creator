import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, RefreshCw, Hash, Calendar, Smile, Frown, Meh, Image, Download, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

const PostGenerator = ({ setToken }) => {
  // ---------------- STATE ----------------
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('general');
  const [platformAccount, setPlatformAccount] = useState('');
  const [tone, setTone] = useState('professional');
  const [maxLength, setMaxLength] = useState(280);
  const [scheduledAt, setScheduledAt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [sentiment, setSentiment] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const platforms = [
    { value: 'general', label: 'Général' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
  ];

  const tones = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'casual', label: 'Décontracté' },
    { value: 'humorous', label: 'Humoristique' },
    { value: 'inspirational', label: 'Inspirant' },
    { value: 'educational', label: 'Éducatif' },
    { value: 'promotional', label: 'Promotionnel' },
  ];

  // ---------------- UTILS ----------------
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  // ---------------- EFFECT ----------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoadingUser(false);
    }
  }, []);

  // ---------------- USER ----------------
  const fetchUser = async () => {
    setIsLoadingUser(true);
    const userId = localStorage.getItem('userId');
    if (!userId) {
      logoutUser('Utilisateur non identifié, veuillez vous reconnecter.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) return logoutUser('Session invalide, veuillez vous reconnecter.');
      const data = await res.json();
      setUser(data);
    } catch {
      logoutUser('Erreur lors de la récupération des informations utilisateur.');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logoutUser = (message) => {
    if (setToken) setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    showToast(message, 'error');
    setIsLoadingUser(false);
  };

  // ---------------- AUTH ----------------
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const login = async () => {
    if (!email || !password) return showToast('Veuillez remplir tous les champs.', 'error');
    if (!validateEmail(email)) return showToast('Veuillez entrer un email valide.', 'error');

    setIsLoadingUser(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Erreur lors de la connexion.', 'error');
      
      if (setToken) setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userId', data.user.id);
      setUser(data.user);
      setEmail('');
      setPassword('');
      showToast('Connexion réussie !');
    } catch {
      showToast('Erreur réseau, veuillez réessayer.', 'error');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // ---------------- GENERATION CONTENT ----------------
  const generateContent = async () => {
    if (!prompt.trim()) return showToast('Veuillez entrer une description.', 'error');
    if (maxLength < 50 || maxLength > 2000) return showToast('La longueur max doit être entre 50 et 2000.', 'error');

    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, platform, tone, max_length: maxLength }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.content);
        analyzeSentiment(data.content);
        showToast('Contenu généré avec succès !');
      } else {
        showToast(data.error || 'Erreur lors de la génération du contenu.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la génération.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------- HASHTAGS ----------------
  const generateHashtags = async () => {
    if (!generatedContent.trim()) return showToast('Aucun contenu à analyser.', 'error');
    setIsGeneratingHashtags(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts/hashtags', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: generatedContent, platform, count: 5 }),
      });
      const data = await res.json();
      setHashtags(data.hashtags || []);
      showToast('Hashtags générés !');
    } catch {
      showToast('Erreur lors de la génération des hashtags.', 'error');
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  // ---------------- SENTIMENT ----------------
  const analyzeSentiment = async (content) => {
    if (!content) return;
    setIsAnalyzingSentiment(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts/analyze-sentiment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) setSentiment(data.sentiment);
    } catch {
      console.error('Erreur analyse sentiment');
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  // ---------------- SAVE POST ----------------
  const savePost = async () => {
    if (!generatedContent.trim()) return showToast('Aucun contenu à sauvegarder.', 'error');
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts/ai-create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          platform_account: platformAccount,
          tone,
          max_length: maxLength,
          content: generatedContent,
          scheduled_at: scheduledAt,
          status: scheduledAt ? 'scheduled' : 'draft',
          include_hashtags: true,
          hashtag_count: 3,
          image_data_url: generatedImageUrl || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Post sauvegardé avec succès !');
      } else {
        showToast(data.error || 'Erreur lors de la sauvegarde.', 'error');
      }
    } catch {
      showToast('Erreur réseau lors de la sauvegarde.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- COPY ----------------
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copié dans le presse-papiers !');
  };

  // ---------------- IMAGE GENERATION ----------------
  const generateImage = async () => {
    if (!imagePrompt.trim()) return showToast('Veuillez entrer un prompt pour l\'image.', 'error');

    setIsGeneratingImage(true);
    try {
      const res = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, size: imageSize }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (!data.image_url) throw new Error('Pas d\'image renvoyée par le serveur.');
      
      setGeneratedImageUrl(data.image_url);
      showToast('Image générée avec succès !');
      setImagePrompt('');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération de l\'image.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const removeImage = () => {
    setGeneratedImageUrl('');
    showToast('Image supprimée');
  };

  // ---------------- RENDER PREVIEW ----------------
  const renderPreview = () => {
    if (!generatedContent && !generatedImageUrl) return null;
    
    const platformStyles = {
      x: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
      facebook: 'bg-blue-100 dark:bg-blue-800/30 border-blue-300 dark:border-blue-600',
      instagram: 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700',
      linkedin: 'bg-blue-200 dark:bg-blue-700/30 border-blue-400 dark:border-blue-500',
      general: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
    };

    return (
      <Card className={`shadow-lg ${platformStyles[platform] || platformStyles.general}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {(platformAccount || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {platformAccount || '@Utilisateur'}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {platform.toUpperCase()}
                  </Badge>
                  {sentiment && (
                    <Badge variant={sentiment === 'positive' ? 'default' : sentiment === 'negative' ? 'destructive' : 'secondary'} className="text-xs">
                      {sentiment === 'positive' && <Smile className="w-3 h-3 mr-1" />}
                      {sentiment === 'negative' && <Frown className="w-3 h-3 mr-1" />}
                      {sentiment === 'neutral' && <Meh className="w-3 h-3 mr-1" />}
                      {sentiment}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(generatedContent)}
              disabled={!generatedContent}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {generatedContent && (
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
              {generatedContent}
            </p>
          )}
          
          {generatedImageUrl && (
            <div className="relative">
              <img 
                src={generatedImageUrl} 
                alt="Aperçu du post" 
                className="rounded-lg border max-h-96 w-full object-contain shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  showToast('Impossible de charger l\'image', 'error');
                }}
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(generatedImageUrl)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copier l'URL
                </Button>
                <a href={generatedImageUrl} download="post-image.png">
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                </a>
              </div>
            </div>
          )}
          
          {hashtags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">Hashtags suggérés :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() => copyToClipboard(`#${tag}`)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ---------------- UI LOGIN ----------------
  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Générateur de Posts IA</CardTitle>
            <CardDescription>Connectez-vous pour créer du contenu engageant</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Votre mot de passe" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
            </div>
            
            {(error || success) && (
              <Alert variant={error ? 'destructive' : 'default'}>
                <AlertDescription>{error || success}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={login} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6" 
              disabled={isLoadingUser}
            >
              {isLoadingUser ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Se connecter
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------- UI MAIN ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
              Générateur de Posts IA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bienvenue, {isLoadingUser ? '...' : user?.username || 'Utilisateur'} !
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => logoutUser('Déconnexion réussie')}
            className="hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Déconnexion
          </Button>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <Alert variant={error ? 'destructive' : 'default'}>
            <AlertDescription>{error || success}</AlertDescription>
          </Alert>
        )}

        {/* Générateur Principal */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Configuration du post
            </CardTitle>
            <CardDescription>
              Configurez les paramètres pour générer du contenu optimisé
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plateforme</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Compte</Label>
                <Input 
                  value={platformAccount} 
                  onChange={(e) => setPlatformAccount(e.target.value)} 
                  placeholder="@username" 
                />
              </div>

              <div className="space-y-2">
                <Label>Ton</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un ton" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Longueur max ({maxLength} caractères)</Label>
                <Input 
                  type="number" 
                  value={maxLength} 
                  onChange={(e) => setMaxLength(parseInt(e.target.value) || 280)} 
                  min={50} 
                  max={2000} 
                />
              </div>

              <div className="space-y-2">
                <Label>Planifier pour</Label>
                <Input 
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={(e) => setScheduledAt(e.target.value)} 
                />
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label>Décrivez votre post</Label>
              <Textarea 
                rows={4} 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                className="resize-none" 
                placeholder="Décrivez le contenu que vous souhaitez générer..."
              />
            </div>

            {/* Actions principales */}
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={generateContent} 
                disabled={!prompt.trim() || isGenerating} 
                className="bg-purple-600 hover:bg-purple-700 flex-1 min-w-[200px]" 
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Générer le contenu
                  </>
                )}
              </Button>

              <Button 
                onClick={() => setIsImageModalOpen(true)} 
                variant="outline" 
                className="flex-1 min-w-[200px]" 
                size="lg"
              >
                <Image className="mr-2 h-5 w-5" />
                Ajouter une image
              </Button>

              <Button 
                onClick={generateHashtags} 
                disabled={!generatedContent.trim() || isGeneratingHashtags} 
                variant="outline" 
                className="flex-1 min-w-[200px]" 
                size="lg"
              >
                {isGeneratingHashtags ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Hashtags...
                  </>
                ) : (
                  <>
                    <Hash className="mr-2 h-5 w-5" />
                    Générer hashtags
                  </>
                )}
              </Button>
            </div>

            {/* Action sauvegarde */}
            <div className="pt-4 border-t">
              <Button 
                onClick={savePost} 
                disabled={!generatedContent.trim() || isSaving} 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-5 w-5" />
                    {scheduledAt ? 'Planifier le post' : 'Sauvegarder en brouillon'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aperçu du post */}
        {renderPreview()}

        {/* Modal de génération d'image */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-600" />
                Générer une image pour le post
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Description de l'image</Label>
                <Textarea 
                  rows={4} 
                  value={imagePrompt} 
                  onChange={(e) => setImagePrompt(e.target.value)} 
                  className="resize-none" 
                  placeholder="Décrivez l'image que vous souhaitez générer..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Taille de l'image</Label>
                <Select value={imageSize} onValueChange={setImageSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256x256">256×256 (Petite)</SelectItem>
                    <SelectItem value="512x512">512×512 (Moyenne)</SelectItem>
                    <SelectItem value="1024x1024">1024×1024 (Grande)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {generatedImageUrl && (
                <div className="space-y-2">
                  <Label>Aperçu de l'image générée</Label>
                  <img 
                    src={generatedImageUrl} 
                    alt="Aperçu" 
                    className="w-full max-h-64 object-contain rounded-lg border shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      showToast('Impossible de charger l\'image', 'error');
                    }}
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={generateImage} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700" 
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer l'image
                    </>
                  )}
                </Button>
                
                <DialogClose asChild>
                  <Button variant="outline">Fermer</Button>
                </DialogClose>
              </div>
            </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          }
          
          export default PostGenerator;
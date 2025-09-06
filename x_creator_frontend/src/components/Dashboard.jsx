import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, RefreshCw, Hash, Calendar, Smile, Frown, Meh, Trash2, Edit, Search, LogOut, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast, { Toaster } from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ setToken }) => {
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
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const platforms = [
    { value: 'general', label: 'Général', color: 'bg-gray-500' },
    { value: 'x', label: 'X (Twitter)', color: 'bg-blue-500' },
    { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
    { value: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
    { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  ];

  const tones = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'casual', label: 'Décontracté' },
    { value: 'humorous', label: 'Humoristique' },
    { value: 'inspirational', label: 'Inspirant' },
    { value: 'educational', label: 'Éducatif' },
    { value: 'promotional', label: 'Promotionnel' },
  ];

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUser();
      fetchPosts();
      fetchSuggestions();
    } else {
      setIsLoadingUser(false);
    }
  }, []);

  const fetchUser = async () => {
    setIsLoadingUser(true);
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Utilisateur non identifié, veuillez vous reconnecter.');
      handleLogout();
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        handleLogout();
        setError('Session invalide, veuillez vous reconnecter.');
      }
    } catch (error) {
      handleLogout();
      setError('Erreur lors de la récupération des informations utilisateur.');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        toast.error('Erreur lors de la récupération des posts.');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts/suggest', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 5 }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        toast.error('Erreur lors de la récupération des suggestions.');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const login = async (email, password) => {
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Veuillez entrer un email valide.');
      return;
    }
    setIsLoadingUser(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userId', data.user.id);
        setUser(data.user);
        toast.success('Connexion réussie !');
        fetchUser();
        fetchPosts();
        fetchSuggestions();
      } else {
        toast.error(data.error || 'Erreur lors de la connexion.');
        setSuccess('');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
      setSuccess('');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setPosts([]);
    setSuggestions([]);
    setGeneratedContent('');
    setHashtags([]);
    setSentiment(null);
    toast.success('Déconnexion réussie.');
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer une description valide.');
      return;
    }
    if (maxLength < 50 || maxLength > 2000) {
      toast.error('La longueur maximale doit être entre 50 et 2000 caractères.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/posts/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          tone,
          max_length: maxLength,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedContent(data.content);
        analyzeSentiment(data.content);
        toast.success('Contenu généré avec succès !');
      } else {
        toast.error(data.error || 'Erreur lors de la génération du contenu.');
        setSuccess('');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
      setSuccess('');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHashtags = async () => {
    if (!generatedContent.trim()) {
      toast.error('Aucun contenu à analyser pour les hashtags.');
      return;
    }
    setIsGeneratingHashtags(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/posts/hashtags', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          platform,
          count: 5,
        }),
      });
      const data = await response.json();
      setHashtags(data.hashtags || []);
      toast.success('Hashtags générés avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération des hashtags.');
      setSuccess('');
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const analyzeSentiment = async (content) => {
    if (!content) return;
    setIsAnalyzingSentiment(true);
    try {
      const response = await fetch('http://localhost:5000/api/posts/analyze-sentiment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (data.success) {
        setSentiment(data.sentiment);
        toast.success('Analyse de sentiment terminée.');
      } else {
        toast.error(data.error || 'Erreur lors de l\'analyse de sentiment.');
      }
    } catch (error) {
      toast.error('Erreur réseau lors de l\'analyse de sentiment.');
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const savePost = async () => {
    if (!generatedContent.trim()) {
      toast.error('Aucun contenu à sauvegarder.');
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/posts/ai-create', {
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
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Post sauvegardé avec succès !');
        setSuccess('Post sauvegardé avec succès !');
        fetchPosts();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde.');
        setSuccess('');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
      setSuccess('');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Confirmer la suppression du post ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        toast.success('Post supprimé avec succès !');
        fetchPosts();
      } else {
        toast.error('Erreur lors de la suppression.');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setPrompt(post.prompt || '');
    setPlatform(post.platform);
    setTone(post.tone);
    setMaxLength(post.max_length);
    setGeneratedContent(post.content);
    setScheduledAt(post.scheduled_at || '');
    setPlatformAccount(post.platform_account || '');
    setIsModalOpen(true);
  };

  const updatePost = async () => {
    if (!editingPost || !generatedContent.trim()) {
      toast.error('Aucun contenu à mettre à jour.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${editingPost.id}`, {
        method: 'PUT',
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
        }),
      });
      if (response.ok) {
        toast.success('Post mis à jour avec succès !');
        fetchPosts();
        setIsModalOpen(false);
      } else {
        toast.error('Erreur lors de la mise à jour.');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers !');
  };

  const improveContent = async (improvementType = 'engagement') => {
    if (!generatedContent.trim()) {
      toast.error('Aucun contenu à améliorer.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/posts/improve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          improvement_type: improvementType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedContent(data.improved_content);
        analyzeSentiment(data.improved_content);
        toast.success('Contenu amélioré avec succès !');
      } else {
        toast.error(data.error || 'Erreur lors de l\'amélioration du contenu.');
        setSuccess('');
      }
    } catch (error) {
      toast.error('Erreur réseau, veuillez réessayer.');
      setSuccess('');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreview = () => {
    const platformStyles = {
      x: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm',
      facebook: 'bg-blue-100 dark:bg-blue-800/20 border-blue-300 dark:border-blue-700 shadow-sm',
      instagram: 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800 shadow-sm',
      linkedin: 'bg-blue-200 dark:bg-blue-700/20 border-blue-400 dark:border-blue-600 shadow-sm',
      general: 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 shadow-sm',
    };
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`border rounded-lg p-4 mt-4 ${platformStyles[platform] || platformStyles.general}`}
      >
        <div className="flex items-center mb-3">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{platformAccount || '@Utilisateur'}</span>
          <Badge className={`ml-2 ${platforms.find(p => p.value === platform)?.color}`}>
            {platform.toUpperCase()}
          </Badge>
        </div>
        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{generatedContent}</p>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {hashtags.map((hashtag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                onClick={() => copyToClipboard(hashtag)}
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const filteredPosts = posts
    .filter((post) => filterStatus === 'all' || post.status === filterStatus)
    .filter((post) => post.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const calendarEvents = posts
    .filter((post) => post.scheduled_at)
    .map((post) => ({
      title: `${post.platform.toUpperCase()}: ${post.content.slice(0, 20)}...`,
      start: new Date(post.scheduled_at),
      id: post.id,
      backgroundColor: platforms.find(p => p.value === post.platform)?.color || '#9333ea',
    }));

  const chartData = {
    labels: ['Publiés', 'Planifiés', 'Brouillons'],
    datasets: [
      {
        data: [
          posts.filter((post) => post.status === 'published').length,
          posts.filter((post) => post.status === 'scheduled').length,
          posts.filter((post) => post.status === 'draft').length,
        ],
        backgroundColor: ['#34D399', '#3B82F6', '#F59E0B'],
        hoverBackgroundColor: ['#6EE7B7', '#60A5FA', '#FBBF24'],
      },
    ],
  };

  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6">
        <Toaster position="top-right" />
        <Card className="w-full max-w-md shadow-xl rounded-xl bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connexion</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Connectez-vous pour accéder à votre tableau de bord</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                onChange={(e) => login(e.target.value, password)}
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                onChange={(e) => login(email, e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            {(error || success) && (
              <Alert variant={error ? 'destructive' : 'default'} className={error ? 'border-red-500' : 'border-green-500 text-green-700'}>
                <AlertDescription>{error || success}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => login(email, password)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
              disabled={isLoadingUser}
            >
              {isLoadingUser ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <Toaster position="top-right" toastOptions={{ className: 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' }} />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Tableau de bord, {isLoadingUser ? <Skeleton width={120} inline /> : user?.username || 'Utilisateur'}
          </h1>
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                    Générateur de Posts IA
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Créez et planifiez du contenu engageant pour vos réseaux sociaux</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(error || success) && (
                    <Alert variant={error ? 'destructive' : 'default'} className={error ? 'border-red-500' : 'border-green-500 text-green-700'}>
                      <AlertDescription>{error || success}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-gray-700 dark:text-gray-300">Plateforme</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500">
                          <SelectValue placeholder="Choisir une plateforme" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${p.color}`}></span>
                                {p.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platformAccount" className="text-gray-700 dark:text-gray-300">Compte (ex: @username)</Label>
                      <Input
                        id="platformAccount"
                        value={platformAccount}
                        onChange={(e) => setPlatformAccount(e.target.value)}
                        placeholder="Ex: @votreCompte"
                        className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tone" className="text-gray-700 dark:text-gray-300">Ton</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500">
                          <SelectValue placeholder="Choisir un ton" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLength" className="text-gray-700 dark:text-gray-300">Longueur max</Label>
                      <Input
                        id="maxLength"
                        type="number"
                        value={maxLength}
                        onChange={(e) => setMaxLength(parseInt(e.target.value))}
                        min="50"
                        max="2000"
                        className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt" className="text-gray-700 dark:text-gray-300">Planifier (optionnel)</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-gray-700 dark:text-gray-300">Décrivez votre post</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Ex: Un post sur les avantages du télétravail..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="resize-none border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <Button
                      onClick={generateContent}
                      disabled={!prompt.trim() || isGenerating}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Générer le contenu
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={savePost}
                      disabled={!generatedContent.trim() || isSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sauvegarde en cours...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-5 w-5" />
                          Sauvegarder et Planifier
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Contenu généré
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => copyToClipboard(generatedContent)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => improveContent('engagement')}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-4">
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{generatedContent}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span>{generatedContent.length} caractères</span>
                      <Badge variant={generatedContent.length <= maxLength ? 'default' : 'destructive'} className="px-3 py-1">
                        {generatedContent.length <= maxLength ? 'Longueur OK' : 'Trop long'}
                      </Badge>
                    </div>
                    {sentiment && (
                      <div className="mb-4">
                        <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          Analyse de sentiment :
                          {sentiment === 'positive' && <Smile className="h-5 w-5 text-green-500" />}
                          {sentiment === 'negative' && <Frown className="h-5 w-5 text-red-500" />}
                          {sentiment === 'neutral' && <Meh className="h-5 w-5 text-gray-500" />}
                          <span className="capitalize">{sentiment}</span>
                        </Label>
                        {sentiment === 'negative' && (
                          <Button
                            variant="link"
                            onClick={() => improveContent('positive')}
                            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Rendre plus positif
                          </Button>
                        )}
                      </div>
                    )}
                    {renderPreview()}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => improveContent('engagement')}
                        disabled={isGenerating}
                      >
                        Plus engageant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => improveContent('clarity')}
                        disabled={isGenerating}
                      >
                        Plus clair
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => improveContent('brevity')}
                        disabled={isGenerating}
                      >
                        Plus court
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-700 dark:text-gray-300">Hashtags suggérés</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={generateHashtags}
                          disabled={isGeneratingHashtags}
                        >
                          {isGeneratingHashtags ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((hashtag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                              onClick={() => copyToClipboard(hashtag)}
                            >
                              #{hashtag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vos posts</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Filtrez et gérez vos publications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['all', 'draft', 'scheduled', 'published'].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? 'default' : 'outline'}
                        className={`${
                          filterStatus === status
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } transition-colors`}
                        onClick={() => setFilterStatus(status)}
                      >
                        {status === 'all' ? 'Tous' : status === 'draft' ? 'Brouillons' : status === 'scheduled' ? 'Planifiés' : 'Publiés'}
                      </Button>
                    ))}
                  </div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      className="pl-10 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                      placeholder="Rechercher dans les posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {isLoadingPosts ? (
                    <Skeleton count={5} height={120} className="mb-4 rounded-lg" />
                  ) : filteredPosts.length > 0 ? (
                    <AnimatePresence>
                      {filteredPosts.map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${platforms.find(p => p.value === post.platform)?.color}`}></span>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{post.platform.toUpperCase()}</p>
                            </div>
                            <Badge
                              variant={post.status === 'published' ? 'default' : 'secondary'}
                              className={`${
                                post.status === 'published'
                                  ? 'bg-green-500'
                                  : post.status === 'scheduled'
                                  ? 'bg-blue-500'
                                  : 'bg-yellow-500'
                              } text-white`}
                            >
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{new Date(post.created_at).toLocaleString()}</p>
                          <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{post.content}</p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => openEditModal(post)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">Aucun post trouvé.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Suggestions de contenu</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Idées basées sur vos posts précédents</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions.length > 0 ? (
                    <motion.div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => setPrompt(suggestion)}
                        >
                          <p className="text-gray-800 dark:text-gray-200 text-sm">{suggestion}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">Aucune suggestion pour le moment.</p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={fetchSuggestions}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Rafraîchir les suggestions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    <BarChart2 className="h-6 w-6 text-purple-600" />
                    Statistiques
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Vos performances en un coup d'œil</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Nombre total de posts</p>
                      <p className="text-gray-800 dark:text-gray-200 font-bold">{posts.length}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Posts planifiés</p>
                      <p className="text-gray-800 dark:text-gray-200 font-bold">{posts.filter((post) => post.status === 'scheduled').length}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Engagement estimé</p>
                      <p className="text-gray-800 dark:text-gray-200 font-bold">{Math.round(posts.length * 100)} interactions</p>
                    </div>
                    <div className="mt-6">
                      <Doughnut
                        data={chartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'bottom', labels: { color: '#1F2937' } },
                            tooltip: { backgroundColor: '#1F2937', titleColor: '#ffffff', bodyColor: '#ffffff' },
                          },
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendrier des posts</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Visualisez et gérez vos posts planifiés</CardDescription>
                </CardHeader>
                <CardContent>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    eventClick={(info) => {
                      const post = posts.find((p) => p.id === parseInt(info.event.id));
                      if (post) openEditModal(post);
                    }}
                    height="500px"
                    eventDisplay="block"
                    eventTextColor="#ffffff"
                    dayMaxEvents={3}
                    moreLinkContent={({ num }) => `+${num} plus`}
                    eventContent={({ event }) => (
                      <div className="p-1 text-xs">
                        <span className="font-semibold">{event.title}</span>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Éditer le post</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-platform" className="text-gray-700 dark:text-gray-300">Plateforme</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="edit-platform" className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Choisir une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${p.color}`}></span>
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-platformAccount" className="text-gray-700 dark:text-gray-300">Compte</Label>
                  <Input
                    id="edit-platformAccount"
                    value={platformAccount}
                    onChange={(e) => setPlatformAccount(e.target.value)}
                    placeholder="Ex: @votreCompte"
                    className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tone" className="text-gray-700 dark:text-gray-300">Ton</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="edit-tone" className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500">
                      <SelectValue placeholder="Choisir un ton" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxLength" className="text-gray-700 dark:text-gray-300">Longueur max</Label>
                  <Input
                    id="edit-maxLength"
                    type="number"
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value))}
                    min="50"
                    max="2000"
                    className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledAt" className="text-gray-700 dark:text-gray-300">Planifier (optionnel)</Label>
                  <Input
                    id="edit-scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prompt" className="text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="edit-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content" className="text-gray-700 dark:text-gray-300">Contenu</Label>
                <Textarea
                  id="edit-content"
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={6}
                  className="resize-none border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={updatePost}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
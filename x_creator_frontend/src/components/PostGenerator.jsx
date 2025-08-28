import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Copy, RefreshCw, Hash } from 'lucide-react'
import { motion } from 'framer-motion'

const PostGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState('general')
  const [tone, setTone] = useState('professional')
  const [maxLength, setMaxLength] = useState(280)
  const [generatedContent, setGeneratedContent] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false)

  const platforms = [
    { value: 'general', label: 'Général' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' }
  ]

  const tones = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'casual', label: 'Décontracté' },
    { value: 'humorous', label: 'Humoristique' },
    { value: 'inspirational', label: 'Inspirant' },
    { value: 'educational', label: 'Éducatif' }
  ]

  const generateContent = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:5000/api/posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          platform,
          tone,
          max_length: maxLength
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
      } else {
        console.error('Erreur:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateHashtags = async () => {
    if (!generatedContent.trim()) return

    setIsGeneratingHashtags(true)
    try {
      const response = await fetch('http://localhost:5000/api/posts/hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          platform,
          count: 5
        })
      })

      const data = await response.json()
      setHashtags(data.hashtags || [])
    } catch (error) {
      console.error('Erreur lors de la génération des hashtags:', error)
    } finally {
      setIsGeneratingHashtags(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const improveContent = async (improvementType = 'engagement') => {
    if (!generatedContent.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:5000/api/posts/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          improvement_type: improvementType
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.improved_content)
      }
    } catch (error) {
      console.error('Erreur lors de l\'amélioration:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Générateur de Posts IA
            </CardTitle>
            <CardDescription>
              Créez du contenu engageant pour vos réseaux sociaux avec l'intelligence artificielle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Plateforme</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Ton</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
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
                <Label htmlFor="maxLength">Longueur max</Label>
                <Input
                  type="number"
                  value={maxLength}
                  onChange={(e) => setMaxLength(parseInt(e.target.value))}
                  min="50"
                  max="2000"
                />
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Décrivez votre post</Label>
              <Textarea
                id="prompt"
                placeholder="Ex: Un post sur les avantages du télétravail pour les développeurs..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Bouton de génération */}
            <Button 
              onClick={generateContent} 
              disabled={!prompt.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer le contenu
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Résultat généré */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Contenu généré
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => improveContent('engagement')}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="whitespace-pre-wrap">{generatedContent}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{generatedContent.length} caractères</span>
                <Badge variant={generatedContent.length <= maxLength ? "default" : "destructive"}>
                  {generatedContent.length <= maxLength ? "Longueur OK" : "Trop long"}
                </Badge>
              </div>

              {/* Boutons d'amélioration */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => improveContent('engagement')}
                  disabled={isGenerating}
                >
                  Plus engageant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => improveContent('clarity')}
                  disabled={isGenerating}
                >
                  Plus clair
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => improveContent('brevity')}
                  disabled={isGenerating}
                >
                  Plus court
                </Button>
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Hashtags suggérés</Label>
                  <Button
                    variant="outline"
                    size="sm"
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
                        className="cursor-pointer hover:bg-purple-100"
                        onClick={() => copyToClipboard(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default PostGenerator


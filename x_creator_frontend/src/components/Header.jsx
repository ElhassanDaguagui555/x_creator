import { Sparkles, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">X-Creator</h1>
              <p className="text-purple-100">Générateur de contenu IA</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Connexion
            </Button>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Commencer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-semibold mb-2">IA Avancée</h3>
            <p className="text-purple-100">
              Génération de contenu intelligent avec GPT-4o
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-green-300" />
            <h3 className="text-xl font-semibold mb-2">Multi-Plateformes</h3>
            <p className="text-purple-100">
              Optimisé pour X, Facebook, Instagram, LinkedIn
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-pink-300" />
            <h3 className="text-xl font-semibold mb-2">Personnalisable</h3>
            <p className="text-purple-100">
              Tons et styles adaptés à votre marque
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


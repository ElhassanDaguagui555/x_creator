import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Users, Menu, X, User, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import "../App.css";

const Header = ({ token, setToken }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken('');
    toast.success('Déconnecté avec succès !');
    setIsLogoutModalOpen(false);
    window.location.href = '/';
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white shadow-2xl overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-8 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-16 right-12 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-bounce blur-lg" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse blur-lg"></div>
        <div className="absolute top-8 right-1/3 w-16 h-16 bg-gradient-to-r from-green-400 to-teal-400 rounded-full animate-bounce blur-md" style={{ animationDuration: '4s' }}></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4 flex-wrap">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 p-2.5 rounded-xl shadow-xl transform hover:scale-110 transition duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
                X-Creator
              </h1>
              <p className="text-purple-200 text-xs font-medium flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg shadow-green-400/50"></span>
                Générateur IA Premium
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-2 md:mt-0">
            <div className="flex items-center space-x-2">
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              {isDarkMode ? <Moon className="h-5 w-5 text-gray-200" /> : <Sun className="h-5 w-5 text-yellow-300" />}
            </div>
            {/* Toujours afficher tous les boutons */}
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 text-sm py-2 px-4 rounded-xl font-semibold backdrop-blur-sm border border-white/10"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-white hover:bg-gradient-to-r hover:from-red-600/30 hover:to-pink-600/30 text-sm py-2 px-4 rounded-xl font-semibold backdrop-blur-sm border border-white/10"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 text-sm py-2 px-4 rounded-xl font-semibold backdrop-blur-sm border border-white/10"
              >
                Connexion
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-white via-purple-50 to-pink-50 text-purple-900 hover:from-purple-50 hover:to-white text-sm py-2 px-6 rounded-xl font-bold shadow-xl">
                <Sparkles className="h-4 w-4 mr-2" />
                Commencer
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10 md:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-white/20 shadow-2xl"
          >
            <div className="flex flex-col space-y-3">
              <Link to="/dashboard" onClick={toggleMobileMenu}>
                <Button
                  variant="ghost"
                  className="w-full text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 justify-start rounded-xl backdrop-blur-sm border border-white/10"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-gradient-to-r hover:from-red-600/30 hover:to-pink-600/30 justify-start rounded-xl backdrop-blur-sm border border-white/10"
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  toggleMobileMenu();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
              <Link to="/login" onClick={toggleMobileMenu}>
                <Button
                  variant="ghost"
                  className="w-full text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 justify-start rounded-xl backdrop-blur-sm border border-white/10"
                >
                  Connexion
                </Button>
              </Link>
              <Link to="/signup" onClick={toggleMobileMenu}>
                <Button
                  className="w-full bg-gradient-to-r from-white to-purple-50 text-purple-900 hover:from-purple-50 hover:to-white rounded-xl font-semibold"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Commencer
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <motion.div
            className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl p-4 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">IA Avancée</h3>
                <p className="text-purple-200 text-sm font-medium">GPT-4o Ultra Performant</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl p-4 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Users className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Multi-Plateformes</h3>
                <p className="text-purple-200 text-sm font-medium">Toutes les plateformes sociales</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="group bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl p-4 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-white/20 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-4">
              <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-3 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Sparkles className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <h3 className="text-base font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">Personnalisable</h3>
                <p className="text-purple-200 text-sm font-medium">Style unique à votre marque</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la déconnexion</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-300">Voulez-vous vraiment vous déconnecter ?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;

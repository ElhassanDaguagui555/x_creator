import Header from './components/Header'
import PostGenerator from './components/PostGenerator'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <PostGenerator />
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 X-Creator. Propulsé par l'intelligence artificielle.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

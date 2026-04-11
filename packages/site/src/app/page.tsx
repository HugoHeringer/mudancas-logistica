import Link from 'next/link';
import { Truck, Calendar, Phone, Shield, Star, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Truck className="h-6 w-6 text-blue-600" />
            Mudanças
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#servicos" className="text-gray-600 hover:text-gray-900">Serviços</Link>
            <Link href="#sobre" className="text-gray-600 hover:text-gray-900">Sobre</Link>
            <Link href="#testemunhos" className="text-gray-600 hover:text-gray-900">Testemunhos</Link>
            <Link href="#contacto" className="text-gray-600 hover:text-gray-900">Contacto</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/agendar" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md">
              Agendar
            </Link>
            <Link href="/urgente" className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              Urgente
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Mudanças Sem Stress
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Serviço profissional de mudanças locais, nacionais e internacionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agendar" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              <Calendar className="inline-block mr-2 h-5 w-5" />
              Agendar Mudança
            </Link>
            <Link href="/urgente" className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Mudança Urgente
            </Link>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <MapPin className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mudanças Locais</h3>
              <p className="text-gray-600">Serviço rápido e eficiente para mudanças na mesma cidade ou região.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Truck className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mudanças Nacionais</h3>
              <p className="text-gray-600">Cobertura em todo o território nacional com equipa especializada.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mudanças Internacionais</h3>
              <p className="text-gray-600">Tratamos de toda a documentação para mudanças para o estrangeiro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">1000+</p>
              <p className="text-gray-600 mt-2">Mudanças Realizadas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">10+</p>
              <p className="text-gray-600 mt-2">Anos de Experiência</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">50+</p>
              <p className="text-gray-600 mt-2">Veículos na Frota</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">98%</p>
              <p className="text-gray-600 mt-2">Clientes Satisfeitos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section id="testemunhos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">O Que Dizem os Clientes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"Serviço excelente! Equipa profissional e cuidadosa. Recomendo vivamente."</p>
                <p className="font-semibold">- Cliente Satisfeito</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contacte-nos</h2>
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-blue-600" />
              <span>+351 210 000 000</span>
            </div>
            <p className="text-center text-gray-600">
              Rua das Mudanças, 123, Lisboa<br />
              geral@mudancas.pt
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Mudanças & Logística. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

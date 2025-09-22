import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative h-[60vh] overflow-hidden md:h-[70vh] lg:h-[80vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80"
          alt="Cozy bedroom with premium bedding"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            How we do <span className="italic text-textile-cream">cozy</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-textile-cream md:text-xl">
            Transform your space with our curated collection of premium bedding,
            home textiles, and decor designed for ultimate comfort.
          </p>

          <Button
            size="lg"
            variant="textile"
            className="h-auto px-8 py-4 text-base font-semibold tracking-wide transition-all duration-300 hover:bg-white hover:text-textile-navy"
          >
            SHOP NEW ARRIVALS
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 transform md:block">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white">
          <div className="mt-2 h-3 w-1 animate-bounce rounded-full bg-white" />
        </div>
      </div>
    </section>
  )
}

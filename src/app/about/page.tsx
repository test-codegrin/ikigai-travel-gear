import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Award, Users, Globe2, Heart, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] bg-black">
        <Image
          src="/hero/image-1.jpeg"
          alt="IKIGAI Travel Gear"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              About Ikigai Travel Gear
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto">
              Crafting exceptional travel experiences through premium gear
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm sm:text-base uppercase text-primary font-semibold mb-4">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Designed for the Modern Traveler
              </h2>
              <div className="space-y-4 text-gray-700 text-base sm:text-lg">
                <p>
                  Founded with a passion for adventure and a commitment to
                  quality, Ikigai Travel Gear has been redefining travel
                  experiences since our inception. Our name, inspired by the
                  Japanese concept of &quot;Ikigai&quot;&mdash;finding purpose and joy in what
                  you do&mdash;reflects our mission to help travelers discover their
                  own path.
                </p>
                <p>
                  Every product we create is meticulously crafted with premium
                  materials and innovative design principles. We believe that
                  great travel gear shouldn&apos;t compromise between style,
                  durability, and functionality.
                </p>
                <p>
                  From weekend getaways to month-long expeditions, our products
                  are tested in real-world conditions to ensure they meet the
                  demands of modern travelers who refuse to settle for ordinary.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] sm:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/hero/image-2.jpeg"
                alt="Our Story"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Ikigai Travel Gear
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality First
              </h3>
              <p className="text-gray-600">
                We&apos;re never compromise on quality. Every product undergoes rigorous
                testing to ensure it meets our high standards of durability and
                performance.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600">
                We continuously push boundaries to create travel gear that
                combines cutting-edge technology with timeless design
                principles.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Customer Focus
              </h3>
              <p className="text-gray-600">
                Your satisfaction drives us. We listen to feedback and
                constantly improve our products to better serve your travel
                needs.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Globe2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sustainability
              </h3>
              <p className="text-gray-600">
                We&apos;re committed to reducing our environmental impact through
                responsible sourcing and sustainable manufacturing practices.
              </p>
            </div>

            {/* Value 5 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Passion
              </h3>
              <p className="text-gray-600">
                Travel is more than movement &mdash; it&apos;s about discovery, growth, and
                connection. We pour our passion into every product we create.
              </p>
            </div>

            {/* Value 6 */}
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Precision
              </h3>
              <p className="text-gray-600">
                Every detail matters. From stitching to zippers, we ensure
                meticulous craftsmanship in every aspect of our products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary text-white rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8">
              To empower travelers worldwide with premium, innovative gear that
              enhances every journey. We believe that exceptional travel
              experiences start with exceptional equipment.
            </p>
           
          </div>
        </div>
      </section>

      {/* Manufacturing Excellence */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] sm:h-[500px] rounded-lg overflow-hidden order-2 lg:order-1">
              <Image
                src="/hero/image-3.jpeg"
                alt="Manufacturing"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm sm:text-base uppercase text-primary font-semibold mb-4">
                Manufacturing Excellence
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Made with Pride in India
              </h2>
              <div className="space-y-4 text-gray-700 text-base sm:text-lg">
                <p>
                  Our state-of-the-art manufacturing facility in Rajkot, Gujarat
                  combines traditional craftsmanship with modern technology to
                  produce world-class travel gear.
                </p>
                <p>
                  Each product goes through multiple quality checkpoints,
                  ensuring that only the finest items reach our customers. Our
                  skilled artisans take pride in their work, treating each piece
                  as if it were their own.
                </p>
                <p>
                  By manufacturing locally, we support our community, maintain
                  strict quality control, and reduce our carbon footprint –
                  values that align with our commitment to responsible business
                  practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our range of premium travel gear designed to elevate every
            adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 px-8 py-6 text-base"
            >
              <Link href="/">Explore Products</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-base"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

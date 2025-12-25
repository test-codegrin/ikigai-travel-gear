import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Check,
  Shield,
  Package,
  Mail,
  Phone,
  MapPin,
  Earth,
  Map,
  Search,
  Smartphone,
  Tags,
  Wallet,
  Globe2,
  Cog,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function HomePage() {
  return (
    <main>
      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-13">
            {/* Feature 1 */}
            <div className="text-start">
              <div className="inline-flex items-center w-16 h-16 sm:w-20 sm:h-20 justify-center rounded-lg bg-white text-primary mb-4 sm:mb-5">
                <Earth className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base text-primary uppercase mb-3 sm:mb-4">
                Discover the perfect travel companion
              </h3>
              <p className="text-secondary font-light text-sm sm:text-base text-justify">
                Introducing Samurai Saga, the newest product from Ikigai Travel
                Gear.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-start">
              <div className="inline-flex items-center w-16 h-16 sm:w-20 sm:h-20 justify-center rounded-lg bg-white text-primary mb-4 sm:mb-5">
                <Check className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base text-primary uppercase mb-3 sm:mb-4">
                High-quality design and materials
              </h3>
              <p className="text-secondary font-light text-sm sm:text-base text-justify">
                Our product is carefully crafted with premium materials and
                innovative design to ensure durability and functionality.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-start">
              <div className="inline-flex items-center w-16 h-16 sm:w-20 sm:h-20 justify-center rounded-lg bg-white text-primary mb-4 sm:mb-5">
                <Map className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base text-primary uppercase mb-3 sm:mb-4">
                Perfect for any trip or occasion
              </h3>
              <p className="text-secondary text-sm sm:text-base font-light text-justify">
                Samurai Saga is versatile and adaptable, making it the perfect
                travel companion for any trip or occasion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-start">
              <div className="inline-flex items-center w-16 h-16 sm:w-20 sm:h-20 justify-center rounded-lg bg-white text-primary mb-4 sm:mb-5">
                <Search className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base text-primary uppercase mb-3 sm:mb-4">
                Affordable luxury for all travelers
              </h3>
              <p className="text-secondary font-light text-sm sm:text-base text-justify">
                At Ikigai Travel Gear, we believe that everyone should have
                access to high-quality travel gear without breaking the bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <img
              src="/hero/image-1.jpeg"
              alt="IKIGAI Travel Gear"
              className="rounded-lg w-full lg:w-1/3 object-cover"
            />
            <div className="flex flex-col justify-center">
              <p className="text-sm sm:text-base uppercase text-primary pb-2 sm:pb-2.5">
                Learn About Our Company
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900">
                Ikigai Travel Gear
              </h1>
              <p className="text-base sm:text-xl text-black max-w-2xl py-4 sm:py-8">
                Discover Ikigai Travel Gear, a leading luggage store with a
                passion for manufacturing high-quality travel bags that fuse
                style, durability, and practicality.
              </p>
              <Button className="bg-primary hover:bg-primary/90 py-5 sm:py-7 px-4 w-full sm:w-32">
                Discover
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl flex flex-col mx-auto px-4 sm:px-6 lg:px-8 gap-8 lg:gap-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <p className="text-xl sm:text-2xl font-semibold text-black pb-3 sm:pb-5">
                Find the Perfect Travel Bag for Your Next Adventure
              </p>
              <p className="text-sm sm:text-base font-light text-black max-w-2xl">
                Explore our wide selection of high-quality travel bags, designed
                with durability and functionality in mind.
              </p>
            </div>
            <img
              src="/hero/image-2.jpeg"
              alt="IKIGAI Travel Gear"
              className="rounded-lg w-full lg:w-auto object-cover order-1 lg:order-2"
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <img
              src="/hero/image-3.jpeg"
              alt="IKIGAI Travel Gear"
              className="rounded-lg w-full lg:w-auto object-cover"
            />
            <div className="flex flex-col justify-center">
              <p className="text-xl sm:text-2xl font-semibold text-black pb-3 sm:pb-5">
                Experience the Best of Travel Gear
              </p>
              <p className="text-sm sm:text-base font-light text-black max-w-2xl">
                At Ikigai Travel Gear, we know that not all travel bags are
                created equal. Trust us to make your next adventure hassle-free
                with the perfect travel bag.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Discover Our Unique Features!
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Travel with ease and style with our Samurai Saga travel bag.
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-13">
              {/* Feature 1 */}
              <div className="text-start">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary text-primary mb-4 sm:mb-5">
                  <Earth className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl text-black uppercase mb-3 sm:mb-5">
                  Durable Design
                </h3>
                <p className="text-black font-light text-sm sm:text-base mb-4 sm:mb-5">
                  Constructed with the highest quality materials to withstand
                  any journey.
                </p>
                <Button className="bg-primary hover:bg-primary/90 py-3 px-6 w-full sm:w-auto text-xs uppercase">
                  Learn more
                </Button>
              </div>

              {/* Feature 2 */}
              <div className="text-start">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary text-primary mb-4 sm:mb-5">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl text-black uppercase mb-3 sm:mb-5">
                  Ultimate Security
                </h3>
                <p className="text-black font-light text-sm sm:text-base mb-4 sm:mb-5">
                  Protect your belongings with our advanced locking system and
                  secure design.
                </p>
                <Button className="bg-primary hover:bg-primary/90 py-3 px-6 w-full sm:w-auto text-xs uppercase">
                  Discover
                </Button>
              </div>

              {/* Feature 3 */}
              <div className="text-start">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary text-primary mb-4 sm:mb-5">
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl text-black uppercase mb-3 sm:mb-5">
                  Laptop Case
                </h3>
                <p className="text-black font-light text-sm sm:text-base mb-4 sm:mb-5">
                  Carry Laptop Safely anywhere with no hassle
                </p>
                <Button className="bg-primary hover:bg-primary/90 py-3 px-6 w-full sm:w-auto text-xs uppercase">
                  Shop Now
                </Button>
              </div>

              {/* Feature 4 */}
              <div className="text-start">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary text-primary mb-4 sm:mb-5">
                  <Tags className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-xl sm:text-2xl text-black uppercase mb-3 sm:mb-5">
                  Smart Storage
                </h3>
                <p className="text-black font-light text-sm sm:text-base mb-4 sm:mb-5">
                  Efficiently pack and organise all your essentials with our
                  intelligent design.
                </p>
                <Button className="bg-primary hover:bg-primary/90 py-3 px-6 w-full sm:w-auto text-xs uppercase">
                  Browse Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-20">
          <img
            src="/hero/image-4.jpeg"
            alt="Travel Bag"
            className="w-full lg:w-[40%] h-auto rounded-lg object-cover"
          />

          <div className="text-center lg:text-left space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Ready to experience the ultimate travel bag?
            </h2>

            <p className="text-base sm:text-lg opacity-90">
              Order your Samurai Saga today and get ready for your next
              adventure!
            </p>

            <Button
              className="bg-white text-black border-2 !border-white
        hover:bg-transparent hover:text-white hover:!border-white
        px-8 py-5 text-sm uppercase font-semibold mt-3 w-full sm:w-auto"
            >
              Order Now
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2A38] mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mx-auto mb-12 sm:mb-16 text-sm sm:text-base">
            Get answers to some of the most commonly asked questions about our
            company, products, and services.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-14">
          {/* FAQ Item 1 */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <span className="text-primary text-4xl shrink-0">
              <Cog className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </span>
            <div className="w-full sm:w-[80%]">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                What is the quality of your products?
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                We take pride in the high quality materials and expert
                craftsmanship used to manufacture our products. We are committed
                to producing durable and functional travel gear that will last
                for all your adventures.
              </p>
            </div>
          </div>

          {/* FAQ Item 2 */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <span className="text-primary text-4xl shrink-0">
              <Globe2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </span>
            <div className="w-full sm:w-[80%]">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                Do you provide international shipping?
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Yes, we offer international shipping for all our products.
                Simply select your country and enter your shipping address
                during checkout to see the shipping options available to you.
              </p>
            </div>
          </div>

          {/* FAQ Item 3 */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <span className="text-primary text-4xl shrink-0">
              <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </span>
            <div className="w-full sm:w-[80%]">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                What is your returns and exchange policy?
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                We want you to be completely satisfied with your purchase.
                Please refer to our returns and exchange policy for more
                details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <img
                src="/ikigai-logo.png"
                alt=""
                className="w-40 sm:w-50 h-auto mb-2"
              />
              <p className="text-sm sm:text-base font-bold text-gray-600 mb-6 sm:mb-8">
                #GoBeyondFindYourself
              </p>

              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3 sm:mr-4 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Email
                    </h4>
                    <a
                      href="mailto:info@ikigaitravelgear.com"
                      className="text-gray-600 hover:text-primary text-sm sm:text-base break-all"
                    >
                      info@ikigaitravelgear.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3 sm:mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Contact
                    </h4>
                    <a href="tel:+919925471112" className="text-gray-600 max-w-md text-sm sm:text-base">
                     +91 99254 71112
                    </a>  
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-3 sm:mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Address
                    </h4>
                    <a href="https://maps.app.goo.gl/LKuaEBtfzt9Krwhw7" target="_blank" className="text-gray-600 max-w-md text-sm sm:text-base">
                      Plot No. G-1032, Road-E, Gate-3. Metoda GIDC, Rajkot,
                      Gujarat, India - 360021
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                Get in touch
              </h2>
              <form className="space-y-5 sm:space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 py-3"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} IKIGAI Travel Gear. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

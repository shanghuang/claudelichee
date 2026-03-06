export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍒</span>
              <span className="text-xl font-bold text-green-600">Lichee</span>
            </div>
            <p className="text-gray-600 text-sm">
              Fresh fruits delivered to your door. Quality produce from local farms.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="text-gray-600 hover:text-green-600">
                  All Products
                </a>
              </li>
              <li>
                <a href="/products?category=tropical" className="text-gray-600 hover:text-green-600">
                  Tropical Fruits
                </a>
              </li>
              <li>
                <a href="/products?category=berries" className="text-gray-600 hover:text-green-600">
                  Berries
                </a>
              </li>
              <li>
                <a href="/products?category=citrus" className="text-gray-600 hover:text-green-600">
                  Citrus
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: hello@lichee.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Sat 8am-8pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Lichee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

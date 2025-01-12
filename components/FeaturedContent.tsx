import Image from 'next/image'

const featuredContent = [
  {
    id: 1,
    title: "Featured Movie 1",
    image: "/movie1.jpg",
    category: "Action",
    rating: "4.8"
  },
  {
    id: 2,
    title: "Featured Movie 2",
    image: "/movie2.jpg",
    category: "Drama",
    rating: "4.5"
  },
  {
    id: 3,
    title: "Featured Movie 3",
    image: "/movie3.jpg",
    category: "Comedy",
    rating: "4.7"
  },
]

export default function FeaturedContent() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Featured Content</h2>
        <p className="text-gray-400 mb-12">Handpicked selections just for you</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredContent.map((item) => (
            <div 
              key={item.id} 
              className="group relative rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300"
            >
              <div className="aspect-[2/3] relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="backdrop-blur-sm bg-black/30 rounded-lg p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.category}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors">
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 
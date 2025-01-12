'use client'
import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false })

export default function ClientWrapper() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  )
} 
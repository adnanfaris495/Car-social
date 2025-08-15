import { redirect } from 'next/navigation'
import NewPostForm from '@/components/NewPostForm'

const validBrands = ['audi', 'bmw', 'mercedes', 'porsche', 'volkswagen']

export default async function NewPostPage({
  params: { brand },
}: {
  params: { brand: string }
}) {
  if (!validBrands.includes(brand)) {
    redirect('/forums')
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="page-heading mb-8">Create New Post in {brandName} Forum</h1>
      <NewPostForm brand={brand} />
    </div>
  )
} 
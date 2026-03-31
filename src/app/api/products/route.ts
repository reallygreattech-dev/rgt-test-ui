import { NextRequest, NextResponse } from 'next/server';
import { productsDb, initializeData } from '@/lib/data';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { Product, ProductCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  initializeData();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '6');

  let products = Array.from(productsDb.values());

  if (search) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'name_asc') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name_desc') {
    products.sort((a, b) => b.name.localeCompare(a.name));
  }

  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginated = products.slice(offset, offset + limit);

  return NextResponse.json({ products: paginated, total, totalPages, page, limit });
}

export async function POST(req: NextRequest) {
  initializeData();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, price, category, stock, description, imageUrl } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      name,
      price: parseFloat(price),
      category: category as ProductCategory,
      stock: parseInt(stock) || 0,
      description: description || '',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    productsDb.set(product.id, product);
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

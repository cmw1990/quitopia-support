import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Product } from "../api/apiCompatibility";

interface ProductListProps {
  session: any;
}

const ProductList: React.FC<ProductListProps> = ({ session }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'inventory'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New product form state
  const [newProduct, setNewProduct] = useState<{
    name: string;
    description: string;
    price: string;
    inventory: string;
    category: string;
    is_organic: boolean;
  }>({
    name: '',
    description: '',
    price: '',
    inventory: '',
    category: '',
    is_organic: false
  });

  // Environment variables for direct REST API calls
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fetch products using direct REST API call
  useEffect(() => {
    const fetchProducts = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Fetch products
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_products?select=*&user_id=eq.${session.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error(err instanceof Error ? err.message : 'Failed to load products');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [session, SUPABASE_URL, SUPABASE_ANON_KEY]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(
        product => product.category === categoryFilter
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      } else {
        return sortOrder === 'asc'
          ? a.inventory - b.inventory
          : b.inventory - a.inventory;
      }
    });
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder]);

  // Handle product creation
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    
    if (!newProduct.name) {
      toast.error('Product name is required');
      return;
    }
    
    if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
      toast.error('Valid price is required');
      return;
    }
    
    if (!newProduct.inventory || isNaN(parseInt(newProduct.inventory))) {
      toast.error('Valid inventory count is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const productToCreate = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        inventory: parseInt(newProduct.inventory),
        category: newProduct.category,
        is_organic: newProduct.is_organic,
        is_active: true,
        user_id: session.user.id
      };
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_products`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(productToCreate)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      const createdProduct = await response.json();
      
      // Update local state
      setProducts([...products, createdProduct[0]]);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        inventory: '',
        category: '',
        is_organic: false
      });
      
      setIsCreateModalOpen(false);
      toast.success('Product created successfully');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create product');
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!session) return;
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_products?id=eq.${productId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update local state
      setProducts(products.filter(product => product.id !== productId));
      toast.success('Product deleted successfully');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to delete product');
      setLoading(false);
    }
  };

  // Handle updating product inventory
  const handleUpdateInventory = async (productId: string, newInventory: number) => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_products?id=eq.${productId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            inventory: newInventory,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }
      
      const updatedProduct = await response.json();
      
      // Update local state
      setProducts(
        products.map(product => 
          product.id === productId ? { ...product, inventory: newInventory } : product
        )
      );
      
      toast.success('Inventory updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  // Create sample products
  const createSampleProducts = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      
      const sampleProducts = [
        {
          name: 'Organic Tomatoes',
          description: 'Fresh organic tomatoes grown locally',
          price: 3.99,
          inventory: 50,
          category: 'produce',
          is_organic: true,
          is_active: true,
          user_id: session.user.id
        },
        {
          name: 'Free-Range Eggs',
          description: 'Dozen eggs from free-range chickens',
          price: 5.49,
          inventory: 30,
          category: 'dairy',
          is_organic: false,
          is_active: true,
          user_id: session.user.id
        },
        {
          name: 'Sourdough Bread',
          description: 'Artisanal sourdough bread from local bakery',
          price: 6.99,
          inventory: 15,
          category: 'bakery',
          is_organic: false,
          is_active: true,
          user_id: session.user.id
        },
        {
          name: 'Organic Spinach',
          description: 'Fresh organic spinach',
          price: 4.29,
          inventory: 25,
          category: 'produce',
          is_organic: true,
          is_active: true,
          user_id: session.user.id
        }
      ];
      
      for (const product of sampleProducts) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_products`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(product)
          }
        );
      }
      
      // Fetch updated products list
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_products?select=*&user_id=eq.${session.user.id}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to refresh products');
      }
      
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
      
      toast.success('Sample products created successfully');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create sample products');
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'produce', label: 'Produce' },
    { value: 'dairy', label: 'Dairy & Eggs' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'meat', label: 'Meat & Seafood' },
    { value: 'pantry', label: 'Pantry Items' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'other', label: 'Other' }
  ];

  if (loading && products.length === 0) {
    return <div className="p-8 text-center">Loading products...</div>;
  }

  if (error && products.length === 0) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold">Product Management</h1>
            <div className="mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add New Product
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sort"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'inventory')}
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="inventory">Inventory</option>
              </select>
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                id="order"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          
          {/* Products Table */}
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventory
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                              {product.is_organic && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Organic
                                </span>
                              )}
                            </div>
                            {product.description && (
                              <div className="text-sm text-gray-500 max-w-md truncate">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{product.inventory}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleUpdateInventory(product.id, product.inventory - 1)}
                              disabled={product.inventory <= 0}
                              className={`p-1 rounded-md ${product.inventory <= 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleUpdateInventory(product.id, product.inventory + 1)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={createSampleProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Sample Products
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add New Product
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleCreateProduct}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                        <input
                          type="text"
                          id="name"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          id="description"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)*</label>
                          <input
                            type="number"
                            id="price"
                            step="0.01"
                            min="0"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-1">Inventory*</label>
                          <input
                            type="number"
                            id="inventory"
                            min="0"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={newProduct.inventory}
                            onChange={(e) => setNewProduct({ ...newProduct, inventory: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          id="category"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {categoryOptions.filter(opt => opt.value !== 'all').map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center">
                          <input
                            id="is_organic"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={newProduct.is_organic}
                            onChange={(e) => setNewProduct({ ...newProduct, is_organic: e.target.checked })}
                          />
                          <label htmlFor="is_organic" className="ml-2 block text-sm text-gray-900">
                            Organic Product
                          </label>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Create Product
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList; 

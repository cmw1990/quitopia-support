import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Order, Product } from "../api/apiCompatibility";

interface OrderManagerProps {
  session: any;
}

const OrderManager: React.FC<OrderManagerProps> = ({ session }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Environment variables for direct REST API calls
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fetch orders and products using direct REST API calls
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_orders?select=*&user_id=eq.${session.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
        // Fetch products for reference
        const productsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_products?select=*&user_id=eq.${session.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error(err instanceof Error ? err.message : 'Failed to load orders');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [session, SUPABASE_URL, SUPABASE_ANON_KEY]);

  // Filter and sort orders
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        order => 
          order.id.includes(searchTerm) ||
          (order.customer_id && order.customer_id.includes(searchTerm)) ||
          (order.tracking_number && order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount;
      }
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch order details including items
  const fetchOrderDetails = async (orderId: string) => {
    if (!session) return;
    
    try {
      // Find the order in current state
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Fetch order items
      const itemsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_order_items?order_id=eq.${orderId}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!itemsResponse.ok) {
        throw new Error('Failed to fetch order items');
      }
      
      const itemsData = await itemsResponse.json();
      
      // Combine order with items
      setSelectedOrder({
        ...order,
        items: itemsData
      });
      
      setIsOrderDetailsOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load order details');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_orders?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state
      setOrders(
        orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus
        });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, newStatus: Order['payment_status']) => {
    if (!session) return;
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_orders?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            payment_status: newStatus,
            updated_at: new Date().toISOString()
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      // Update local state
      setOrders(
        orders.map(order => 
          order.id === orderId ? { ...order, payment_status: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          payment_status: newStatus
        });
      }
      
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  // Create sample orders
  const createSampleOrders = async () => {
    if (!session || products.length === 0) {
      toast.error('You need to have products in your inventory to create sample orders');
      return;
    }
    
    try {
      setLoading(true);
      
      const sampleCustomers = [
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '555-123-4567',
          address: {
            street: '123 Main St',
            city: 'Portland',
            state: 'OR',
            zip: '97201'
          }
        },
        {
          name: 'Emily Johnson',
          email: 'emily.johnson@example.com',
          phone: '555-987-6543',
          address: {
            street: '456 Oak Ave',
            city: 'Seattle',
            state: 'WA',
            zip: '98101'
          }
        },
        {
          name: 'Local Restaurant',
          email: 'orders@localrestaurant.com',
          phone: '555-222-3333',
          address: {
            street: '789 Culinary Blvd',
            city: 'Portland',
            state: 'OR',
            zip: '97204'
          }
        }
      ];
      
      // Create customers first
      const customers = [];
      for (const customer of sampleCustomers) {
        const customerResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_customers`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              ...customer,
              user_id: session.user.id
            })
          }
        );
        
        if (!customerResponse.ok) {
          throw new Error('Failed to create customer');
        }
        
        const customerData = await customerResponse.json();
        customers.push(customerData[0]);
      }
      
      // Create 3 sample orders
      for (let i = 0; i < 3; i++) {
        const customer = customers[i % customers.length];
        
        // Select 2-4 random products for this order
        const orderProducts = [];
        const productCount = Math.floor(Math.random() * 3) + 2; // 2-4 products
        
        for (let j = 0; j < productCount; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items
          
          orderProducts.push({
            product: randomProduct,
            quantity,
            price: randomProduct.price
          });
        }
        
        // Calculate total
        const totalAmount = orderProducts.reduce(
          (sum, item) => sum + item.price * item.quantity, 
          0
        );
        
        // Create order
        const orderResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_orders`,
          {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              customer_id: customer.id,
              total_amount: totalAmount,
              status: ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)],
              payment_status: ['unpaid', 'paid'][Math.floor(Math.random() * 2)],
              shipping_address: customer.address,
              notes: `Sample order ${i + 1}`,
              user_id: session.user.id
            })
          }
        );
        
        if (!orderResponse.ok) {
          throw new Error('Failed to create order');
        }
        
        const orderData = await orderResponse.json();
        const orderId = orderData[0].id;
        
        // Create order items
        for (const item of orderProducts) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/mission8_order_items`,
            {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${session.access_token || ''}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                order_id: orderId,
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.price
              })
            }
          );
        }
      }
      
      // Fetch updated orders list
      const ordersResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/mission8_orders?select=*&user_id=eq.${session.user.id}`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${session.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!ordersResponse.ok) {
        throw new Error('Failed to refresh orders');
      }
      
      const ordersData = await ordersResponse.json();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      
      toast.success('Sample orders created successfully');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create sample orders');
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  if (error && orders.length === 0) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold">Order Management</h1>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
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
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {order.id.substring(0, 8)}...
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer_id ? order.customer_id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`text-sm rounded-md border-gray-300 pr-8 ${
                            order.status === 'pending' ? 'text-yellow-700 bg-yellow-50' :
                            order.status === 'processing' ? 'text-blue-700 bg-blue-50' :
                            order.status === 'shipped' ? 'text-purple-700 bg-purple-50' :
                            'text-green-700 bg-green-50'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.payment_status}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['payment_status'])}
                          className={`text-sm rounded-md border-gray-300 pr-8 ${
                            order.payment_status === 'unpaid' ? 'text-red-700 bg-red-50' :
                            order.payment_status === 'paid' ? 'text-green-700 bg-green-50' :
                            'text-gray-700 bg-gray-50'
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Details
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">Create sample orders to get started.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={createSampleOrders}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Sample Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Order Details Modal */}
      {isOrderDetailsOpen && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsOrderDetailsOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Order Details
                  </h3>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Order ID</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Status</p>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.payment_status}</p>
                      </div>
                      {selectedOrder.tracking_number && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.tracking_number}</p>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Notes</p>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedOrder.shipping_address && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                        <div className="mt-1 text-sm text-gray-900">
                          <p>{selectedOrder.shipping_address.street}</p>
                          <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Items */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Order Items</h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items && selectedOrder.items.map(item => {
                            const product = products.find(p => p.id === item.product_id);
                            return (
                              <tr key={item.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {product ? product.name : `Product ID: ${item.product_id.substring(0, 8)}...`}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  ${item.price.toFixed(2)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {item.quantity}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                              Total:
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${selectedOrder.total_amount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsOrderDetailsOpen(false)}
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Close
                      </button>
                      {selectedOrder.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = {
                              'pending': 'processing',
                              'processing': 'shipped',
                              'shipped': 'delivered'
                            }[selectedOrder.status] as Order['status'];
                            
                            updateOrderStatus(selectedOrder.id, nextStatus);
                          }}
                          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Mark as {
                            selectedOrder.status === 'pending' ? 'Processing' :
                            selectedOrder.status === 'processing' ? 'Shipped' :
                            selectedOrder.status === 'shipped' ? 'Delivered' : ''
                          }
                        </button>
                      )}
                    </div>
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

export default OrderManager; 

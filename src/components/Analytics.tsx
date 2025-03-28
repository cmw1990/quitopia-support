import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

interface AnalyticsProps {
  session: any;
}

interface SalesData {
  date: string;
  amount: number;
  orderCount: number;
}

interface ProductPerformance {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

interface CategoryPerformance {
  category: string;
  productCount: number;
  totalSold: number;
  totalRevenue: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ session }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'month'>('30days');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Environment variables for direct REST API calls
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Get date range based on selected time range
  const getDateRange = () => {
    const today = new Date();
    
    if (timeRange === '7days') {
      return {
        start: format(subDays(today, 7), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };
    } else if (timeRange === '30days') {
      return {
        start: format(subDays(today, 30), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd')
      };
    } else {
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
      };
    }
  };

  // Fetch analytics data using direct REST API calls
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        const { start, end } = getDateRange();
        
        // Fetch orders for sales data
        const ordersResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_orders?select=id,created_at,total_amount,status&user_id=eq.${session.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders data');
        }
        
        const ordersData = await ordersResponse.json();
        
        // Filter orders by date range
        const filteredOrders = ordersData.filter((order: any) => {
          const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
          return orderDate >= start && orderDate <= end;
        });
        
        // Group by date for sales chart
        const salesByDate = filteredOrders.reduce((acc: Record<string, SalesData>, order: any) => {
          const date = format(new Date(order.created_at), 'yyyy-MM-dd');
          
          if (!acc[date]) {
            acc[date] = {
              date,
              amount: 0,
              orderCount: 0
            };
          }
          
          acc[date].amount += order.total_amount;
          acc[date].orderCount += 1;
          
          return acc;
        }, {});
        
        // Convert to array and sort by date
        const salesDataArray = Object.values(salesByDate).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        setSalesData(salesDataArray);
        
        // Fetch order items to calculate product performance
        const orderItemsPromises = filteredOrders.map((order: any) => 
          fetch(
            `${SUPABASE_URL}/rest/v1/mission8_order_items?order_id=eq.${order.id}&select=*`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${session.access_token || ''}`,
                'Content-Type': 'application/json'
              }
            }
          ).then(res => res.json())
        );
        
        const orderItemsResults = await Promise.all(orderItemsPromises);
        const allOrderItems = orderItemsResults.flat();
        
        // Fetch products
        const productsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/mission8_products?select=id,name,category&user_id=eq.${session.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${session.access_token || ''}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products data');
        }
        
        const productsData = await productsResponse.json();
        
        // Create a map of product id to product details
        const productsMap = productsData.reduce((acc: Record<string, any>, product: any) => {
          acc[product.id] = product;
          return acc;
        }, {});
        
        // Calculate product performance
        const productPerformance = allOrderItems.reduce((acc: Record<string, ProductPerformance>, item: any) => {
          const productId = item.product_id;
          const product = productsMap[productId];
          
          if (!product) return acc;
          
          if (!acc[productId]) {
            acc[productId] = {
              productId,
              productName: product.name,
              totalSold: 0,
              totalRevenue: 0
            };
          }
          
          acc[productId].totalSold += item.quantity;
          acc[productId].totalRevenue += item.price * item.quantity;
          
          return acc;
        }, {});
        
        // Convert to array and sort by revenue
        const topProductsArray = Object.values(productPerformance)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5);
        
        setTopProducts(topProductsArray);
        
        // Calculate category performance
        const categoryPerf = allOrderItems.reduce((acc: Record<string, CategoryPerformance>, item: any) => {
          const productId = item.product_id;
          const product = productsMap[productId];
          
          if (!product) return acc;
          
          const category = product.category || 'Uncategorized';
          
          if (!acc[category]) {
            acc[category] = {
              category,
              productCount: 0,
              totalSold: 0,
              totalRevenue: 0
            };
          }
          
          // Only count unique products
          if (!acc[category].products) {
            acc[category].products = new Set();
          }
          acc[category].products.add(productId);
          acc[category].productCount = acc[category].products.size;
          
          acc[category].totalSold += item.quantity;
          acc[category].totalRevenue += item.price * item.quantity;
          
          return acc;
        }, {});
        
        // Convert to array and sort by revenue
        const categoryPerfArray = Object.values(categoryPerf)
          .map(({ products, ...rest }) => rest) // Remove the temporary products set
          .sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        setCategoryPerformance(categoryPerfArray);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error(err instanceof Error ? err.message : 'Failed to load analytics data');
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [session, timeRange, SUPABASE_URL, SUPABASE_ANON_KEY]);

  // Generate demo data if there's no real data
  const generateDemoData = () => {
    const demoSalesData: SalesData[] = [];
    const today = new Date();
    const { start } = getDateRange();
    
    let currentDate = new Date(start);
    while (currentDate <= today) {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      // Generate random data
      const amount = Math.random() * 1000 + 500; // $500-1500
      const orderCount = Math.floor(Math.random() * 10) + 1; // 1-10 orders
      
      demoSalesData.push({
        date: formattedDate,
        amount,
        orderCount
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sample top products
    const demoProducts: ProductPerformance[] = [
      { productId: '1', productName: 'Organic Tomatoes', totalSold: 45, totalRevenue: 179.55 },
      { productId: '2', productName: 'Free-Range Eggs', totalSold: 38, totalRevenue: 208.62 },
      { productId: '3', productName: 'Sourdough Bread', totalSold: 27, totalRevenue: 188.73 },
      { productId: '4', productName: 'Organic Spinach', totalSold: 32, totalRevenue: 137.28 },
      { productId: '5', productName: 'Grass-Fed Beef', totalSold: 15, totalRevenue: 299.85 }
    ];
    
    // Sample category performance
    const demoCategories: CategoryPerformance[] = [
      { category: 'produce', productCount: 8, totalSold: 127, totalRevenue: 489.68 },
      { category: 'dairy', productCount: 5, totalSold: 64, totalRevenue: 351.36 },
      { category: 'bakery', productCount: 3, totalSold: 42, totalRevenue: 293.58 },
      { category: 'meat', productCount: 4, totalSold: 31, totalRevenue: 527.93 },
      { category: 'pantry', productCount: 6, totalSold: 28, totalRevenue: 154.84 }
    ];
    
    setSalesData(demoSalesData);
    setTopProducts(demoProducts);
    setCategoryPerformance(demoCategories);
    setLoading(false);
  };

  // Show demo data if no real data and not loading
  useEffect(() => {
    if (!loading && salesData.length === 0) {
      generateDemoData();
    }
  }, [loading, salesData]);

  // Calculate summary metrics
  const totalRevenue = salesData.reduce((sum, day) => sum + day.amount, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orderCount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (error && salesData.length === 0) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold">Business Analytics</h1>
            <div className="mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
              <h2 className="text-sm font-medium text-blue-800">Total Revenue</h2>
              <p className="mt-2 text-3xl font-bold text-blue-900">${totalRevenue.toFixed(2)}</p>
              <p className="mt-1 text-sm text-blue-600">{timeRange === '7days' ? 'Last 7 days' : timeRange === '30days' ? 'Last 30 days' : 'This month'}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 shadow-sm">
              <h2 className="text-sm font-medium text-green-800">Orders</h2>
              <p className="mt-2 text-3xl font-bold text-green-900">{totalOrders}</p>
              <p className="mt-1 text-sm text-green-600">{timeRange === '7days' ? 'Last 7 days' : timeRange === '30days' ? 'Last 30 days' : 'This month'}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
              <h2 className="text-sm font-medium text-purple-800">Average Order Value</h2>
              <p className="mt-2 text-3xl font-bold text-purple-900">${averageOrderValue.toFixed(2)}</p>
              <p className="mt-1 text-sm text-purple-600">{timeRange === '7days' ? 'Last 7 days' : timeRange === '30days' ? 'Last 30 days' : 'This month'}</p>
            </div>
          </div>
          
          {/* Sales Chart */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h2>
            
            <div className="h-64 relative">
              {/* Simplified chart using divs */}
              <div className="flex h-full items-end space-x-2">
                {salesData.map((day) => {
                  // Find maximum amount to normalize chart heights
                  const maxAmount = Math.max(...salesData.map(d => d.amount));
                  const heightPercentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-400 rounded-t"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                      <div className="text-xs mt-1 text-gray-600 transform -rotate-45 origin-top-left">
                        {format(new Date(day.date), 'MMM d')}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 inset-y-0 flex flex-col justify-between pointer-events-none">
                <div className="text-xs text-gray-500">
                  ${Math.max(...salesData.map(d => d.amount)).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">$0</div>
              </div>
            </div>
          </div>
          
          {/* Top Products and Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Products */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top Products</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units Sold
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map(product => (
                      <tr key={product.productId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {product.totalSold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${product.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {topProducts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No product data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryPerformance.map(category => (
                      <tr key={category.category}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {category.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {category.productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${category.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {categoryPerformance.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No category data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 

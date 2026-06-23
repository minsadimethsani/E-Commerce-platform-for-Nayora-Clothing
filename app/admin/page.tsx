import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Mail
} from "lucide-react";
import Link from "next/link";
import { getTotalSubscribersCount, getAllSubscribers } from "@/lib/newsletter-db";

const recentOrders = [
  { id: "#ORD-001", customer: "Sarah Jenkins", product: "Silk Evening Gown", total: "LKR 299.00", status: "Processing", date: "Today, 2:45 PM" },
  { id: "#ORD-002", customer: "Michael Chen", product: "Classic Oxford Shirt", total: "LKR 89.50", status: "Shipped", date: "Today, 11:20 AM" },
  { id: "#ORD-003", customer: "Emily Davis", product: "Wool Blend Coat", total: "LKR 195.00", status: "Delivered", date: "Yesterday, 4:15 PM" },
  { id: "#ORD-004", customer: "James Wilson", product: "Linen Trousers", total: "LKR 125.00", status: "Processing", date: "Yesterday, 2:30 PM" },
  { id: "#ORD-005", customer: "Olivia Martinez", product: "Cashmere Sweater", total: "LKR 250.00", status: "Pending", date: "Oct 24, 9:00 AM" },
];

export default async function AdminDashboard() {
  const [totalSubscribers, subscribers] = await Promise.all([
    getTotalSubscribersCount(),
    getAllSubscribers()
  ]);

  const stats = [
    { 
      name: "Total Revenue", 
      value: "LKR 45,231.89", 
      change: "+20.1%", 
      trend: "up",
      icon: DollarSign 
    },
    { 
      name: "Active Orders", 
      value: "356", 
      change: "+8.2%", 
      trend: "up",
      icon: ShoppingBag 
    },
    { 
      name: "Total Products", 
      value: "1,245", 
      change: "-1.1%", 
      trend: "down",
      icon: TrendingUp 
    },
    { 
      name: "New Customers", 
      value: "2,845", 
      change: "+15.3%", 
      trend: "up",
      icon: Users 
    },
    { 
      name: "Newsletter Subscribers", 
      value: String(totalSubscribers), 
      change: subscribers.length > 0 ? "Active" : "New", 
      trend: "up",
      icon: Mail 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Welcome back. Here is an overview of your store's performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <stat.icon className="h-6 w-6 text-neutral-700" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-neutral-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : (
                          <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4 text-red-500" aria-hidden="true" />
                        )}
                        <span className="sr-only"> {stat.trend === 'up' ? 'Increased' : 'Decreased'} by </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {/* Recent Orders Table */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden w-full">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 text-right">{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Newsletter Subscribers details section */}
        <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden w-full flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">Newsletter Subscribers</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-50 text-neutral-600 rounded-full border border-neutral-200">
              {totalSubscribers} total
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {subscribers.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-sm font-light">
                No active subscribers found in Firestore.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-150">
                <thead className="bg-neutral-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email Address</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Date Subscribed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">{sub.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 text-right">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

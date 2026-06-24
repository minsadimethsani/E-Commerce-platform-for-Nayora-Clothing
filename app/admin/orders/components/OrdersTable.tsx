"use client";

import React, { useState, useTransition } from "react";
import { ChevronDown, CreditCard, Wallet, Banknote, MapPin, Mail, Package, ChevronRight, Phone, User, Calendar, FileText } from "lucide-react";
import { Order, OrderStatus } from "@/lib/db";
import { updateOrderStatusAction } from "../actions";

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(() => {
      updateOrderStatusAction(orderId, newStatus);
    });
  };

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card": return <CreditCard className="w-4 h-4 mr-2" />;
      case "paypal": return <Wallet className="w-4 h-4 mr-2" />;
      case "apple pay": return <Wallet className="w-4 h-4 mr-2" />;
      case "cash on delivery": return <Wallet className="w-4 h-4 mr-2" />;
      default: return <Banknote className="w-4 h-4 mr-2" />;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl shadow-sm p-12 text-center text-neutral-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment Method</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Expand</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr 
                  className={`transition-colors hover:bg-neutral-50 cursor-pointer ${isPending ? 'opacity-70' : ''}`}
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-neutral-900">
                      {order.orderNumber || (order.id.includes('ORD') ? order.id : `#ORD-${order.id.substring(0, 6).toUpperCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-500">{new Date(order.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-900 font-medium">{order.customerName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-neutral-900">LKR {order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-600">
                      {getPaymentIcon(order.paymentMethod)}
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`block w-full pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none ${statusColors[order.status]}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                      <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 bg-neutral-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 mb-4 flex items-center">
                            <Package className="w-4 h-4 mr-2 text-neutral-500" />
                            Order Items
                          </h4>
                          <ul className="space-y-3">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex items-start">
                                  <span className="text-neutral-500 font-medium mr-3">{item.quantity}x</span>
                                  <div className="flex flex-col">
                                    <span className="text-neutral-800 font-medium">{item.productName}</span>
                                    {(item.color || item.size) && (
                                      <span className="text-xs text-neutral-400 mt-0.5">
                                        {item.color && `Color: ${item.color}`}
                                        {item.color && item.size && " | "}
                                        {item.size && `Size: ${item.size}`}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-neutral-900 font-medium">LKR {(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between items-center text-sm">
                            <span className="font-medium text-neutral-900">Total</span>
                            <span className="font-bold text-neutral-900">LKR {order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 mb-4">Customer Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start">
                              <User className="w-4 h-4 mr-3 text-neutral-400 mt-0.5" />
                              <span className="text-neutral-600 font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-start">
                              <Calendar className="w-4 h-4 mr-3 text-neutral-400 mt-0.5" />
                              <span className="text-neutral-600">{new Date(order.date).toLocaleString()}</span>
                            </div>
                            <div className="flex items-start">
                              <Mail className="w-4 h-4 mr-3 text-neutral-400 mt-0.5" />
                              <span className="text-neutral-600">{order.customerEmail}</span>
                            </div>
                            <div className="flex items-start">
                              <Phone className="w-4 h-4 mr-3 text-neutral-400 mt-0.5" />
                              <span className="text-neutral-600">{order.customerPhone || "N/A"}</span>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-3 text-neutral-400 mt-0.5" />
                              <span className="text-neutral-600">{order.address}</span>
                            </div>
                          </div>

                          {order.paymentMethod.toLowerCase() === "bank deposit" && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                              <h5 className="text-xs uppercase tracking-wider font-bold text-neutral-500 mb-4 flex items-center">
                                <Banknote className="w-4 h-4 mr-2" />
                                Bank Deposit Verification
                              </h5>
                              {order.bankDepositDetails ? (
                                <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded border border-neutral-200">
                                  <div><span className="text-neutral-500">Depositor Name:</span> <span className="font-semibold text-neutral-900">{order.bankDepositDetails.depositorName}</span></div>
                                  <div><span className="text-neutral-500">Reference / Txn ID:</span> <span className="font-semibold font-mono text-neutral-900">{order.bankDepositDetails.referenceNumber}</span></div>
                                  <div><span className="text-neutral-500">Bank Name:</span> <span className="font-semibold text-neutral-900">{order.bankDepositDetails.bankName}</span></div>
                                  <div><span className="text-neutral-500">Amount Deposited:</span> <span className="font-bold text-neutral-900">LKR {order.bankDepositDetails.depositedAmount.toLocaleString()}</span></div>
                                  <div><span className="text-neutral-500">Date & Time:</span> <span className="font-semibold text-neutral-900">{new Date(order.bankDepositDetails.depositedDateTime).toLocaleString()}</span></div>
                                  {order.bankDepositDetails.slipUrl && (
                                    <div className="pt-2">
                                      <a 
                                        href={order.bankDepositDetails.slipUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 bg-neutral-900 text-white rounded text-[10px] uppercase font-bold tracking-wider hover:bg-neutral-800 transition-colors"
                                      >
                                        View Bank Slip Image
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 p-4 rounded font-medium">
                                  Awaiting Slip Details & Image Upload
                                </div>
                              )}
                            </div>
                          )}

                          {order.paymentMethod.toLowerCase() === "cash on delivery" && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                              <h5 className="text-xs uppercase tracking-wider font-bold text-neutral-500 mb-4 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                COD Delivery Charge Receipt
                              </h5>
                              {order.deliveryChargeReceiptUrl ? (
                                <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded border border-neutral-200">
                                  <div className="text-neutral-700">Delivery charge payment receipt uploaded:</div>
                                  <div className="pt-2">
                                    <a 
                                      href={order.deliveryChargeReceiptUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1.5 bg-neutral-950 text-white rounded text-[10px] uppercase font-bold tracking-wider hover:bg-neutral-800 transition-colors"
                                    >
                                      View Receipt Image
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-4 rounded font-medium">
                                  No Delivery Fee Receipt Uploaded
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

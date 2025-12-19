
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from '@/lib/schema';
import { toast } from '@/hooks/use-toast';

export interface QuoteItem extends Product {
  quantity: number;
}

interface BuyerInfo {
  name: string;
  email: string;
  companyName: string;
  phone: string;
}

interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
  isLoading: boolean;
  buyer: BuyerInfo;
  setOpen: (isOpen: boolean) => void;
  toggleDrawer: () => void;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  updateBuyerInfo: (info: Partial<BuyerInfo>) => void;
  clearQuote: () => void;
  submitQuote: () => Promise<void>;
  getItemCount: () => number;
}

export const useQuoteStore = create<QuoteState>()(persist((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  buyer: {
    name: '',
    email: '',
    companyName: '',
    phone: '',
  },
  setOpen: (isOpen) => set({ isOpen }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  addProduct: (product, quantity = 1) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      toast({
        title: "Already in Quote",
        description: `${product.name} is already in your quote list.`,
      });
      return;
    }

    set((state) => ({
      items: [...state.items, { ...product, quantity }],
    }));
    toast({
        title: "Added to Quote",
        description: `${product.name} has been added to your quote list.`,
    });
  },
  removeProduct: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
  },
  updateBuyerInfo: (info) => {
    set((state) => ({
      buyer: { ...state.buyer, ...info },
    }));
  },
  clearQuote: () => {
    set({ items: [] });
  },
  submitQuote: async () => {
    const { items, buyer } = get();

    if (items.length === 0) {
      toast({
        title: "Your quote list is empty",
        description: "Please add at least one product to your quote.",
        variant: "destructive",
      });
      return;
    }

    if (!buyer.email) {
        toast({
            title: "Email is required",
            description: "Please provide your email address to submit the quote.",
            variant: "destructive",
        });
        return;
    }

    set({ isLoading: true });
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'quote',
          data: {
            ...buyer,
            items: items.map((item) => ({
              productId: item.id,
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
            })),
          },
        }),
      });

      if (response.ok) {
        set({
          items: [],
          buyer: { name: '', email: '', companyName: '', phone: '' },
          isOpen: false,
        });
        toast({
          title: "Quote Request Sent!",
          description: "Thanks for your request. We'll be in touch shortly.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error Submitting Quote",
          description: errorData.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}), {
  name: 'quote-storage',
  partialize: (state) => ({ items: state.items, buyer: state.buyer }),
}));

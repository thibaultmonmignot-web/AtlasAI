import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { initializeCheckout } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';
import Header from '@/components/Header.jsx';

const ShopPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const products = [
    { id: 1, name: '1 Pixel', pixels: 1, price: 0.10, priceInCents: 10 },
    { id: 2, name: '5 Pixels Pack', pixels: 5, price: 0.50, priceInCents: 50 },
    { id: 3, name: '10 Pixels Pack', pixels: 10, price: 1.00, priceInCents: 100 },
  ];

  const handlePurchase = async (product) => {
    if (!currentUser) {
      toast('Please login to purchase pixels');
      return;
    }

    setLoading(product.id);

    try {
      const result = await initializeCheckout({
        items: [
          {
            variant_id: `pixel_${product.id}`,
            quantity: 1,
          },
        ],
        successUrl: `${window.location.origin}/dashboard?purchase_success=true&pixels=${product.pixels}`,
        cancelUrl: `${window.location.origin}/shop`,
        customer: {
          external_id: currentUser.id,
          email: currentUser.email,
        },
      });

      window.location.href = result.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      toast('Checkout failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Shop - PixelWar</title>
        <meta name="description" content="Purchase pixels to expand your creative power on the PixelWar canvas." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
              Pixel Shop
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Purchase pixels to place on the canvas. More pixels means more creative power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="border-2 border-border bg-card flex flex-col h-full">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">{product.name}</CardTitle>
                  <CardDescription className="text-foreground/70">
                    {product.pixels} pixel{product.pixels > 1 ? 's' : ''} to place
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-3xl font-bold text-foreground">
                    €{product.price.toFixed(2)}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    onClick={() => handlePurchase(product)}
                    disabled={loading === product.id}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
                  >
                    {loading === product.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-foreground/60">
              Need more pixels? Watch ads to earn them for free!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;

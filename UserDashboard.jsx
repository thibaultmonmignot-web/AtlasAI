import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Coins, ShoppingBag, Tv, LogOut } from 'lucide-react';
import Header from '@/components/Header.jsx';

const UserDashboard = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const purchaseRecords = await pb.collection('purchases').getFullList({
          filter: `userId = "${currentUser.id}"`,
          sort: '-purchase_date',
          $autoCancel: false,
        });

        setPurchases(purchaseRecords);

        if (searchParams.get('purchase_success') === 'true') {
          const pixels = parseInt(searchParams.get('pixels') || '0');
          if (pixels > 0) {
            await pb.collection('users').update(currentUser.id, {
              pixels: (currentUser.pixels || 0) + pixels,
            }, { $autoCancel: false });

            await pb.collection('purchases').create({
              userId: currentUser.id,
              pixels_purchased: pixels,
              price_paid: pixels * 0.10,
              payment_method: 'stripe',
            }, { $autoCancel: false });

            await refreshUser();
            toast(`${pixels} pixels added to your account`);
            window.history.replaceState({}, '', '/dashboard');
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, searchParams, refreshUser]);

  const adViewsToday = currentUser?.ad_views_today || 0;
  const maxAdsPerDay = 5;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - PixelWar</title>
        <meta name="description" content="View your pixel balance, purchase history, and account settings." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-foreground" />
                  <CardTitle className="text-foreground">Pixel Balance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-foreground mb-4">
                  {currentUser?.pixels || 0}
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Pixels available to place on the canvas
                </p>
                <Link to="/shop">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Buy More Pixels
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-foreground" />
                  <CardTitle className="text-foreground">Ad Rewards</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-foreground mb-4">
                  {adViewsToday}/{maxAdsPerDay}
                </div>
                <p className="text-sm text-foreground/70 mb-4">
                  Ads watched today. Earn 1 pixel per ad.
                </p>
                <Link to="/ads">
                  <Button
                    disabled={adViewsToday >= maxAdsPerDay}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Tv className="w-4 h-4 mr-2" />
                    {adViewsToday >= maxAdsPerDay ? 'Daily Limit Reached' : 'Watch Ad'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Purchase History</CardTitle>
              <CardDescription className="text-foreground/70">
                Your recent pixel purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground/70 mb-4">No purchases yet</p>
                  <Link to="/shop">
                    <Button variant="outline" className="border-2 border-border">
                      Visit Shop
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Date</TableHead>
                      <TableHead className="text-foreground">Pixels</TableHead>
                      <TableHead className="text-foreground">Price</TableHead>
                      <TableHead className="text-foreground">Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="text-foreground">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          {purchase.pixels_purchased}
                        </TableCell>
                        <TableCell className="text-foreground">
                          €{purchase.price_paid.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-foreground capitalize">
                          {purchase.payment_method || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Email</p>
                  <p className="text-foreground font-medium">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Total Pixels Earned</p>
                  <p className="text-foreground font-medium">{currentUser?.total_pixels_earned || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Total Spent</p>
                  <p className="text-foreground font-medium">€{(currentUser?.total_spent || 0).toFixed(2)}</p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;

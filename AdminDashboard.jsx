import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { formatCurrency } from '@/api/EcommerceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, BarChart3, TrendingUp, CreditCard, Activity, Coins } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [purchases, setPurchases] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPixels: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    avgTransaction: 0,
  });

  const displayCurrency = (amount) => {
    try {
      return formatCurrency(Math.round(amount * 100), { currency: 'EUR' }) || `€${amount.toFixed(2)}`;
    } catch (e) {
      return `€${amount.toFixed(2)}`;
    }
  };

  const loadUsers = async () => {
    try {
      const users = await pb.collection('users').getFullList({ $autoCancel: false });
      const map = {};
      users.forEach((u) => {
        map[u.id] = u.email;
      });
      setUsersMap(map);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  const loadData = async () => {
    try {
      const data = await pb.collection('purchases').getFullList({
        sort: '-purchase_date',
        $autoCancel: false,
      });
      setPurchases(data);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let tRev = 0;
      let tPix = 0;
      let todayRev = 0;
      let weekRev = 0;
      let monthRev = 0;

      const dailyRev = {};

      data.forEach((p) => {
        tRev += p.price_paid;
        tPix += p.pixels_purchased;
        const pDate = new Date(p.purchase_date);

        if (pDate >= startOfToday) todayRev += p.price_paid;
        if (pDate >= startOfWeek) weekRev += p.price_paid;
        if (pDate >= startOfMonth) monthRev += p.price_paid;

        const diffDays = Math.floor((now - pDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          const dateStr = pDate.toISOString().split('T')[0];
          if (!dailyRev[dateStr]) dailyRev[dateStr] = 0;
          dailyRev[dateStr] += p.price_paid;
        }
      });

      setStats({
        totalRevenue: tRev,
        totalPixels: tPix,
        todayRevenue: todayRev,
        weekRevenue: weekRev,
        monthRevenue: monthRev,
        avgTransaction: data.length ? tRev / data.length : 0,
      });

      const cData = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        cData.push({
          date: dateStr,
          revenue: dailyRev[dateStr] || 0,
        });
      }
      setChartData(cData);
    } catch (e) {
      console.error('Failed to load purchases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    try {
      const headers = ['Date & Time', 'Pixels Purchased', 'Amount Paid (€)', 'User Email', 'Payment Status'];
      const rows = purchases.map((p) => [
        `"${new Date(p.purchase_date).toLocaleString()}"`,
        p.pixels_purchased,
        p.price_paid.toFixed(2),
        `"${usersMap[p.userId] || p.userId}"`,
        `"${p.payment_method || 'completed'}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'pixelwar_transactions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PixelWar</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-foreground/70">Real-time revenue & statistics (auto-updates every 5s)</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={loadData} variant="outline" className="border-2 border-border">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportCSV} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Total Revenue</CardTitle>
                <Activity className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{displayCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Pixels Sold</CardTitle>
                <Coins className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalPixels.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Revenue Today</CardTitle>
                <TrendingUp className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{displayCurrency(stats.todayRevenue)}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Revenue This Week</CardTitle>
                <BarChart3 className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{displayCurrency(stats.weekRevenue)}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Revenue This Month</CardTitle>
                <BarChart3 className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{displayCurrency(stats.monthRevenue)}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-foreground/70 uppercase tracking-wide">Avg Transaction</CardTitle>
                <CreditCard className="w-4 h-4 text-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{displayCurrency(stats.avgTransaction)}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Revenue Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(tick) => `€${tick}`} 
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '0px' }}
                      formatter={(value) => [`€${value.toFixed(2)}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                    />
                    <Line 
                      type="step" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={false} 
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-foreground/70">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-border">
                        <TableHead className="text-foreground font-semibold">Date & Time</TableHead>
                        <TableHead className="text-foreground font-semibold">User Email</TableHead>
                        <TableHead className="text-foreground font-semibold">Pixels</TableHead>
                        <TableHead className="text-foreground font-semibold">Amount</TableHead>
                        <TableHead className="text-foreground font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id} className="border-b border-border/50">
                          <TableCell className="text-foreground">
                            {new Date(purchase.purchase_date).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            {usersMap[purchase.userId] || purchase.userId}
                          </TableCell>
                          <TableCell className="text-foreground">{purchase.pixels_purchased}</TableCell>
                          <TableCell className="text-foreground font-bold">{displayCurrency(purchase.price_paid)}</TableCell>
                          <TableCell className="text-foreground capitalize">{purchase.payment_method || 'Completed'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

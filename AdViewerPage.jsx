import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tv, Coins, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';

const AdViewerPage = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [adViewsToday, setAdViewsToday] = useState(0);
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const maxAdsPerDay = 5;

  useEffect(() => {
    const checkAndResetAdCounter = async () => {
      if (!currentUser) return;

      const now = new Date();
      const lastReset = currentUser.last_ad_reset ? new Date(currentUser.last_ad_reset) : null;

      const needsReset = !lastReset || 
        now.toISOString().split('T')[0] !== lastReset.toISOString().split('T')[0];

      if (needsReset) {
        await pb.collection('users').update(currentUser.id, {
          ad_views_today: 0,
          last_ad_reset: now.toISOString(),
        }, { $autoCancel: false });
        await refreshUser();
        setAdViewsToday(0);
      } else {
        setAdViewsToday(currentUser.ad_views_today || 0);
      }
    };

    checkAndResetAdCounter();
  }, [currentUser, refreshUser]);

  useEffect(() => {
    let timer;
    if (watching && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (watching && countdown === 0) {
      completeAdView();
    }
    return () => clearTimeout(timer);
  }, [watching, countdown]);

  const startWatching = () => {
    if (adViewsToday >= maxAdsPerDay) {
      toast('Daily ad limit reached. Come back tomorrow.');
      return;
    }
    setWatching(true);
    setCountdown(30);
  };

  const completeAdView = async () => {
    try {
      const newAdCount = adViewsToday + 1;
      const newPixelCount = (currentUser.pixels || 0) + 1;
      const newTotalEarned = (currentUser.total_pixels_earned || 0) + 1;

      await pb.collection('users').update(currentUser.id, {
        pixels: newPixelCount,
        ad_views_today: newAdCount,
        total_pixels_earned: newTotalEarned,
      }, { $autoCancel: false });

      await refreshUser();
      setAdViewsToday(newAdCount);
      setWatching(false);
      setCountdown(30);
      toast('1 pixel earned');
    } catch (error) {
      console.error('Failed to award pixel:', error);
      toast('Failed to award pixel');
      setWatching(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Watch Ads - PixelWar</title>
        <meta name="description" content="Watch ads to earn free pixels for the PixelWar canvas." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-2 border-border mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
              Earn Free Pixels
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Watch ads to earn pixels. Each ad rewards you with 1 pixel.
            </p>
          </div>

          <Card className="border-2 border-border bg-card mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-foreground" />
                <CardTitle className="text-foreground">Ad Counter</CardTitle>
              </div>
              <CardDescription className="text-foreground/70">
                Daily limit: {maxAdsPerDay} ads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-foreground mb-4">
                {adViewsToday}/{maxAdsPerDay}
              </div>
              <p className="text-sm text-foreground/70">
                {maxAdsPerDay - adViewsToday} ads remaining today
              </p>
            </CardContent>
          </Card>

          {watching ? (
            <Card className="border-2 border-border bg-card">
              <CardContent className="pt-6">
                <div className="aspect-video bg-secondary border-2 border-border flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Tv className="w-16 h-16 text-foreground mx-auto mb-4" />
                    <p className="text-2xl font-bold text-foreground mb-2">Mock Advertisement</p>
                    <p className="text-foreground/70">This is a placeholder ad</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-foreground mb-4">
                    {countdown}
                  </div>
                  <p className="text-foreground/70">
                    {countdown > 0 ? 'Watching ad...' : 'Processing reward...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-border bg-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-6">
                    <Coins className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Ready to earn pixels?
                  </h3>
                  <p className="text-foreground/70 mb-6 max-w-md mx-auto">
                    Watch a 30-second ad to earn 1 pixel. You can watch up to {maxAdsPerDay} ads per day.
                  </p>
                  <Button
                    onClick={startWatching}
                    disabled={adViewsToday >= maxAdsPerDay}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adViewsToday >= maxAdsPerDay ? 'Daily Limit Reached' : 'Watch Ad'}
                  </Button>
                  {adViewsToday >= maxAdsPerDay && (
                    <p className="text-sm text-foreground/60 mt-4">
                      Come back tomorrow to earn more pixels
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default AdViewerPage;

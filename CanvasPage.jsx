import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShoppingCart, LayoutDashboard, Palette } from 'lucide-react';
import Header from '@/components/Header.jsx';

const GRID_SIZE = 100;
const PIXEL_SIZE = 8;

const MANGA_COLORS = [
  '#000000', // Pure black
  '#FFFFFF', // Pure white
  '#1a1a1a', // Near black
  '#333333', // Dark gray
  '#666666', // Medium gray
  '#999999', // Light gray
  '#cccccc', // Very light gray
  '#e5e5e5', // Off white
];

const CanvasPage = () => {
  const { currentUser, refreshUser } = useAuth();
  const [pixels, setPixels] = useState({});
  const [selectedColor, setSelectedColor] = useState(MANGA_COLORS[0]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const loadCanvas = async () => {
    try {
      const weekNumber = getCurrentWeekNumber();
      const records = await pb.collection('canvas_pixels').getFullList({
        filter: `week_number = ${weekNumber}`,
        $autoCancel: false,
      });

      const pixelMap = {};
      records.forEach((record) => {
        const key = `${record.x}-${record.y}`;
        pixelMap[key] = {
          color: record.color,
          placed_by: record.placed_by,
          id: record.id,
        };
      });

      setPixels(pixelMap);
    } catch (error) {
      console.error('Failed to load canvas:', error);
      toast('Failed to load canvas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCanvas();
  }, []);

  const handlePixelClick = (x, y) => {
    if (!currentUser?.pixels || currentUser.pixels < 1) {
      toast('You need pixels to place. Visit the shop or watch ads.');
      return;
    }

    setSelectedPixel({ x, y });
    setColorPickerOpen(true);
  };

  const placePixel = async () => {
    if (!selectedPixel || !currentUser) return;

    try {
      const weekNumber = getCurrentWeekNumber();
      const key = `${selectedPixel.x}-${selectedPixel.y}`;

      if (pixels[key]) {
        await pb.collection('canvas_pixels').delete(pixels[key].id, { $autoCancel: false });
      }

      const newPixel = await pb.collection('canvas_pixels').create({
        x: selectedPixel.x,
        y: selectedPixel.y,
        color: selectedColor,
        placed_by: currentUser.id,
        week_number: weekNumber,
      }, { $autoCancel: false });

      await pb.collection('users').update(currentUser.id, {
        pixels: currentUser.pixels - 1,
      }, { $autoCancel: false });

      setPixels((prev) => ({
        ...prev,
        [key]: {
          color: selectedColor,
          placed_by: currentUser.id,
          id: newPixel.id,
        },
      }));

      await refreshUser();
      setColorPickerOpen(false);
      setSelectedPixel(null);
      toast('Pixel placed');
    } catch (error) {
      console.error('Failed to place pixel:', error);
      toast('Failed to place pixel');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading canvas...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Canvas - PixelWar</title>
        <meta name="description" content="Place pixels on the collaborative canvas and create art with players worldwide." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Canvas</h1>
              <p className="text-foreground/70">Click any pixel to place your color</p>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/shop">
                <Button variant="outline" className="border-2 border-border">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="border-2 border-border">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-card border-2 border-border p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Palette className="w-5 h-5 text-foreground" />
              <span className="text-sm font-medium text-foreground">Selected color:</span>
              <div
                className="w-8 h-8 border-2 border-border cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setColorPickerOpen(true)}
              ></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MANGA_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 border-2 transition-all duration-200 hover:scale-110 ${
                    selectedColor === color ? 'border-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
          </div>

          <div className="bg-card border-2 border-border p-4 overflow-auto">
            <div
              className="grid mx-auto"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${PIXEL_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${PIXEL_SIZE}px)`,
                width: `${GRID_SIZE * PIXEL_SIZE}px`,
                height: `${GRID_SIZE * PIXEL_SIZE}px`,
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const key = `${x}-${y}`;
                const pixel = pixels[key];

                return (
                  <motion.div
                    key={key}
                    onClick={() => handlePixelClick(x, y)}
                    className="border border-border/20 cursor-pointer transition-all duration-200 hover:border-primary"
                    style={{
                      backgroundColor: pixel?.color || '#ffffff',
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <Dialog open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
          <DialogContent className="bg-card border-2 border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Place pixel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-foreground/70">
                Position: ({selectedPixel?.x}, {selectedPixel?.y})
              </p>
              <div className="flex flex-wrap gap-2">
                {MANGA_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 border-2 transition-all duration-200 hover:scale-110 ${
                      selectedColor === color ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
              <Button
                onClick={placePixel}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Place pixel (1 pixel)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default CanvasPage;

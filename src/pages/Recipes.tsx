import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const Recipes = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Healthy Recipes</CardTitle>
          <CardDescription>Discover nutritious and delicious meals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
            <Input type="search" placeholder="Search recipes..." />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Energy Boost Bowl', 'Recovery Smoothie', 'Protein-Rich Salad', 'Brain Food Mix', 'Wellness Wrap', 'Power Breakfast'].map((recipe) => (
              <Card key={recipe}>
                <CardHeader>
                  <CardTitle className="text-lg">{recipe}</CardTitle>
                  <CardDescription>Quick & Easy • 15 mins</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Recipe</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Recipes;

import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from '../../../components/ui';
import { ActivitySquare, Dumbbell, Droplet, Scale, Calculator, Heart } from 'lucide-react';

interface HealthCalculatorsToolProps {
  session: Session | null;
}

export const HealthCalculatorsTool: React.FC<HealthCalculatorsToolProps> = ({ session }) => {
  // BMI calculator state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [bmiColor, setBmiColor] = useState('');

  // Water intake calculator state
  const [weightForWater, setWeightForWater] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [climate, setClimate] = useState('temperate');
  const [waterRecommendation, setWaterRecommendation] = useState<number | null>(null);
  
  // Calories Needed calculator state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [heightForCalories, setHeightForCalories] = useState('');
  const [weightForCalories, setWeightForCalories] = useState('');
  const [activityLevelForCalories, setActivityLevelForCalories] = useState('moderate');
  const [caloriesResult, setCaloriesResult] = useState<number | null>(null);

  // Nicotine Money Savings calculator state
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [packPrice, setPackPrice] = useState('');
  const [quitDuration, setQuitDuration] = useState('30');
  const [moneySaved, setMoneySaved] = useState<number | null>(null);
  const [cigarettesAvoided, setCigarettesAvoided] = useState<number | null>(null);

  // Calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return;
    
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    
    if (heightInMeters <= 0 || weightInKg <= 0) return;
    
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    setBmiResult(parseFloat(bmi.toFixed(1)));
    
    // Determine BMI category and color
    if (bmi < 18.5) {
      setBmiCategory('Underweight');
      setBmiColor('text-blue-500');
    } else if (bmi >= 18.5 && bmi < 25) {
      setBmiCategory('Normal weight');
      setBmiColor('text-green-500');
    } else if (bmi >= 25 && bmi < 30) {
      setBmiCategory('Overweight');
      setBmiColor('text-yellow-500');
    } else {
      setBmiCategory('Obese');
      setBmiColor('text-red-500');
    }
  };

  // Calculate water intake
  const calculateWaterIntake = () => {
    if (!weightForWater) return;
    
    const weightInKg = parseFloat(weightForWater);
    
    if (weightInKg <= 0) return;
    
    // Base calculation: 35ml per kg of body weight
    let waterAmount = weightInKg * 35;
    
    // Adjust for activity level
    if (activityLevel === 'sedentary') {
      waterAmount *= 0.8;
    } else if (activityLevel === 'very_active') {
      waterAmount *= 1.2;
    }
    
    // Adjust for climate
    if (climate === 'hot') {
      waterAmount *= 1.1;
    }
    
    setWaterRecommendation(Math.round(waterAmount));
  };
  
  // Calculate calories needed
  const calculateCalories = () => {
    if (!age || !heightForCalories || !weightForCalories) return;
    
    const ageValue = parseInt(age);
    const heightValue = parseInt(heightForCalories);
    const weightValue = parseInt(weightForCalories);
    
    if (ageValue <= 0 || heightValue <= 0 || weightValue <= 0) return;
    
    // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weightValue + 6.25 * heightValue - 5 * ageValue + 5;
    } else {
      bmr = 10 * weightValue + 6.25 * heightValue - 5 * ageValue - 161;
    }
    
    // Apply activity multiplier
    let caloriesNeeded;
    switch (activityLevelForCalories) {
      case 'sedentary':
        caloriesNeeded = bmr * 1.2;
        break;
      case 'light':
        caloriesNeeded = bmr * 1.375;
        break;
      case 'moderate':
        caloriesNeeded = bmr * 1.55;
        break;
      case 'active':
        caloriesNeeded = bmr * 1.725;
        break;
      case 'very_active':
        caloriesNeeded = bmr * 1.9;
        break;
      default:
        caloriesNeeded = bmr * 1.55;
    }
    
    setCaloriesResult(Math.round(caloriesNeeded));
  };

  // Calculate money saved from not smoking
  const calculateSavings = () => {
    if (!cigarettesPerDay || !packPrice) return;
    
    const cigsPerDay = parseFloat(cigarettesPerDay);
    const pricePerPack = parseFloat(packPrice);
    const days = parseInt(quitDuration);
    
    if (cigsPerDay <= 0 || pricePerPack <= 0 || days <= 0) return;
    
    // Calculate cigarettes avoided
    const totalCigsAvoided = cigsPerDay * days;
    setCigarettesAvoided(totalCigsAvoided);
    
    // Calculate money saved (assuming 20 cigarettes per pack)
    const pricePerCig = pricePerPack / 20;
    const totalSaved = pricePerCig * totalCigsAvoided;
    setMoneySaved(parseFloat(totalSaved.toFixed(2)));
  };

  // Get water intake in cups (assuming 240ml per cup)
  const getWaterInCups = (ml: number) => {
    return Math.round((ml / 240) * 10) / 10;
  };

  return (
    <div>
      <Tabs defaultValue="bmi" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="bmi">
            <Scale className="h-4 w-4 mr-2" />
            BMI Calculator
          </TabsTrigger>
          <TabsTrigger value="water">
            <Droplet className="h-4 w-4 mr-2" />
            Water Intake
          </TabsTrigger>
          <TabsTrigger value="calories">
            <Dumbbell className="h-4 w-4 mr-2" />
            Calories Needed
          </TabsTrigger>
          <TabsTrigger value="savings">
            <Calculator className="h-4 w-4 mr-2" />
            Smoking Savings
          </TabsTrigger>
        </TabsList>
        
        {/* BMI Calculator Tab */}
        <TabsContent value="bmi">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-green-500" />
                  Body Mass Index (BMI) Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your BMI to understand your weight status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Enter your height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter your weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={calculateBMI} 
                  className="w-full"
                  disabled={!height || !weight}
                >
                  Calculate BMI
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Your BMI Result</CardTitle>
                <CardDescription>
                  Based on World Health Organization guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bmiResult === null ? (
                  <div className="text-center py-12">
                    <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter your height and weight to calculate your BMI
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-2">{bmiResult}</h3>
                      <p className={`text-lg font-medium ${bmiColor}`}>{bmiCategory}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">BMI Categories:</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Underweight</span>
                          <span className="text-blue-500">&lt; 18.5</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Normal weight</span>
                          <span className="text-green-500">18.5 - 24.9</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Overweight</span>
                          <span className="text-yellow-500">25 - 29.9</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Obese</span>
                          <span className="text-red-500">&gt;= 30</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Note: BMI is a screening tool, not a diagnostic tool. Consult a healthcare provider for a complete health assessment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Water Intake Calculator Tab */}
        <TabsContent value="water">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  Water Intake Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your recommended daily water intake
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weightForWater">Weight (kg)</Label>
                  <Input
                    id="weightForWater"
                    type="number"
                    placeholder="Enter your weight"
                    value={weightForWater}
                    onChange={(e) => setWeightForWater(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select 
                    value={activityLevel} 
                    onValueChange={setActivityLevel}
                  >
                    <SelectTrigger id="activityLevel">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="moderate">Moderate (moderate exercise/sports 3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (hard exercise/sports 6-7 days/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="climate">Climate</Label>
                  <Select 
                    value={climate} 
                    onValueChange={setClimate}
                  >
                    <SelectTrigger id="climate">
                      <SelectValue placeholder="Select climate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperate">Temperate</SelectItem>
                      <SelectItem value="hot">Hot or Humid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={calculateWaterIntake} 
                  className="w-full"
                  disabled={!weightForWater}
                >
                  Calculate Water Intake
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Your Water Intake Recommendation</CardTitle>
                <CardDescription>
                  Based on your body weight and activity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waterRecommendation === null ? (
                  <div className="text-center py-12">
                    <Droplet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter your details to calculate your recommended water intake
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-blue-500 mb-2">{waterRecommendation} ml</h3>
                      <p className="text-lg">approximately {getWaterInCups(waterRecommendation)} cups per day</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Pro Tip:</strong> During nicotine withdrawal, your body needs extra hydration. Try to drink a glass of water whenever you feel a craving.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Quitting Benefit:</strong> Proper hydration can help reduce withdrawal symptoms and flush nicotine from your system faster.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Tips to stay hydrated:</h4>
                      <ul className="space-y-1 list-disc pl-5">
                        <li>Start your day with a glass of water</li>
                        <li>Carry a reusable water bottle with you</li>
                        <li>Set reminders to drink water throughout the day</li>
                        <li>Add natural flavors like lemon or cucumber</li>
                        <li>Drink a glass of water with each meal and snack</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Calories Needed Calculator Tab */}
        <TabsContent value="calories">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivitySquare className="h-5 w-5 text-orange-500" />
                  Daily Calories Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your daily calorie needs during your fresh journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={gender} 
                    onValueChange={setGender}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heightForCalories">Height (cm)</Label>
                  <Input
                    id="heightForCalories"
                    type="number"
                    placeholder="Enter your height"
                    value={heightForCalories}
                    onChange={(e) => setHeightForCalories(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weightForCalories">Weight (kg)</Label>
                  <Input
                    id="weightForCalories"
                    type="number"
                    placeholder="Enter your weight"
                    value={weightForCalories}
                    onChange={(e) => setWeightForCalories(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activityLevelForCalories">Activity Level</Label>
                  <Select 
                    value={activityLevelForCalories} 
                    onValueChange={setActivityLevelForCalories}
                  >
                    <SelectTrigger id="activityLevelForCalories">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="light">Lightly active (light exercise 1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very active (hard exercise & physical job)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={calculateCalories} 
                  className="w-full"
                  disabled={!age || !heightForCalories || !weightForCalories}
                >
                  Calculate Calories
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Your Daily Calorie Needs</CardTitle>
                <CardDescription>
                  Based on your details and activity level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {caloriesResult === null ? (
                  <div className="text-center py-12">
                    <ActivitySquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter your details to calculate your daily calorie needs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-orange-500 mb-2">{caloriesResult}</h3>
                      <p className="text-lg">calories per day to maintain weight</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-base">For weight goals during your fresh journey:</p>
                      <div className="pl-5 space-y-2">
                        <p><strong>Weight loss:</strong> {Math.round(caloriesResult * 0.8)} calories per day</p>
                        <p><strong>Weight gain:</strong> {Math.round(caloriesResult * 1.15)} calories per day</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Special consideration for quitting:</strong> Your metabolism may change during your quit journey. Pay attention to hunger cues and adjust as needed.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Fresh journey tip:</strong> Focus on nutrient-dense foods that satisfy both hunger and can help reduce cravings, such as protein, fiber-rich vegetables, and healthy fats.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Smoking Savings Calculator Tab */}
        <TabsContent value="savings">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-500" />
                  Smoking Savings Calculator
                </CardTitle>
                <CardDescription>
                  Calculate how much you've saved by staying fresh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cigarettesPerDay">Cigarettes per day</Label>
                  <Input
                    id="cigarettesPerDay"
                    type="number"
                    placeholder="How many cigarettes per day"
                    value={cigarettesPerDay}
                    onChange={(e) => setCigarettesPerDay(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packPrice">Price per pack ($)</Label>
                  <Input
                    id="packPrice"
                    type="number"
                    placeholder="Cost of one pack"
                    value={packPrice}
                    onChange={(e) => setPackPrice(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quitDuration">Duration (days)</Label>
                  <Select 
                    value={quitDuration} 
                    onValueChange={setQuitDuration}
                  >
                    <SelectTrigger id="quitDuration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">1 week (7 days)</SelectItem>
                      <SelectItem value="30">1 month (30 days)</SelectItem>
                      <SelectItem value="90">3 months (90 days)</SelectItem>
                      <SelectItem value="180">6 months (180 days)</SelectItem>
                      <SelectItem value="365">1 year (365 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={calculateSavings} 
                  className="w-full"
                  disabled={!cigarettesPerDay || !packPrice}
                >
                  Calculate Savings
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle>Your Fresh Journey Savings</CardTitle>
                <CardDescription>
                  Money saved and cigarettes avoided by staying fresh
                </CardDescription>
              </CardHeader>
              <CardContent>
                {moneySaved === null ? (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter your details to calculate your savings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-green-500 mb-2">${moneySaved}</h3>
                      <p className="text-lg">saved in {quitDuration} days</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-medium mb-2">Cigarettes avoided:</h4>
                        <p className="text-2xl font-bold text-primary">{cigarettesAvoided}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-medium mb-2">What you could buy with ${moneySaved}:</h4>
                        <ul className="space-y-1 list-disc pl-5">
                          {moneySaved >= 5 && <li>A premium coffee or smoothie</li>}
                          {moneySaved >= 20 && <li>A nice lunch at a restaurant</li>}
                          {moneySaved >= 50 && <li>A new book or streaming subscription</li>}
                          {moneySaved >= 100 && <li>A nice dinner for two</li>}
                          {moneySaved >= 200 && <li>New workout clothes or gear</li>}
                          {moneySaved >= 500 && <li>A weekend getaway</li>}
                          {moneySaved >= 1000 && <li>A new smartphone or laptop</li>}
                          {moneySaved >= 2000 && <li>A tropical vacation</li>}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-2">Annual savings at this rate:</h4>
                      <p className="text-xl font-bold text-green-500">
                        ${Math.round((moneySaved / parseInt(quitDuration)) * 365)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 
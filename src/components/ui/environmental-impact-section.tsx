import React from 'react';
import { Leaf, Clock, Car, Factory } from 'lucide-react';
import { SectionCard } from './section-card';
import { Progress } from './progress';
import { motion } from 'framer-motion';

interface EnvironmentalImpactSectionProps {
  carbonReduction: number;
  cigarettesAvoided: number;
}

export const EnvironmentalImpactSection: React.FC<EnvironmentalImpactSectionProps> = ({
  carbonReduction,
  cigarettesAvoided
}) => {
  // Custom CO2 icon component
  const CO2Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 13a3 3 0 00-3 3v4h3" />
      <path d="M14 13a4 4 0 014 4" />
      <path d="M14 17a3 3 0 01-3 3H9" />
      <path d="M14 9a3 3 0 110 6h-3" />
      <path d="M3 7V5a2 2 0 012-2h10" />
      <path d="M17 8a1 1 0 100-2 1 1 0 000 2z" />
      <path d="M13 5a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );

  // Custom Tree icon component
  const TreeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22v-7l-2-2" />
      <path d="M17 8a5 5 0 00-10 0" />
      <path d="M12 13a5 5 0 005-5" />
      <path d="M12 13a5 5 0 01-5-5" />
      <path d="M7 8a7 7 0 0114 0" />
    </svg>
  );

  // Custom Droplet icon component
  const DropletIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  );

  // Calculate environmental metrics
  const co2Kilograms = (carbonReduction / 1000).toFixed(2);
  const treesEquivalent = Math.floor(carbonReduction / 7000);
  const waterSaved = (cigarettesAvoided * 3.7).toFixed(1); // Liters (each cigarette takes ~3.7L of water to produce)
  const plasticReduction = (cigarettesAvoided * 0.01).toFixed(1); // KG (filter plastic)
  const landSaved = ((cigarettesAvoided / 100) * 0.0001).toFixed(4); // Hectares
  const toxinsReduced = (cigarettesAvoided * 7).toFixed(0); // Each cigarette contains ~7000 chemicals

  // Calculate car driving equivalent (avg car produces ~170g CO2/km)
  const carKilometersAvoided = (carbonReduction / 170).toFixed(1);

  return (
    <SectionCard
      title="Your Environmental Impact"
      description="The positive effect your decision has on the planet"
      icon={<Leaf className="h-5 w-5" />}
    >
      <div className="mt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">Carbon Reduction</h3>
                <p className="text-gray-500 text-sm mt-1">
                  You've prevented {co2Kilograms} kg of CO2 emissions
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CO2Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1 flex justify-between">
                <span>0 kg</span>
                <span>{Math.max(5, Math.ceil(parseFloat(co2Kilograms) / 5) * 5)} kg</span>
              </div>
              <Progress 
                value={(parseFloat(co2Kilograms) / Math.max(5, Math.ceil(parseFloat(co2Kilograms) / 5) * 5)) * 100} 
                className="h-2"
                indicatorClassName="bg-green-500"
              />
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Car className="h-4 w-4 text-gray-500" />
              <p>Equivalent to not driving a car for {carKilometersAvoided} km</p>
            </div>
            
            {carbonReduction > 5000 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <TreeIcon className="h-4 w-4 text-green-500" />
                <p>Equivalent to planting {treesEquivalent} {treesEquivalent === 1 ? 'tree' : 'trees'}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg">Time Saved</h3>
                <p className="text-gray-500 text-sm mt-1">
                  You've reclaimed approximately {Math.floor(cigarettesAvoided * 5 / 60)} hours
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-sm mt-2">
                <p>The average cigarette takes 5 minutes to smoke. You've saved:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{Math.floor(cigarettesAvoided * 5 / 60)} hours</li>
                  <li>{Math.floor(cigarettesAvoided * 5 / 60 / 24)} days</li>
                  <li>Approximately {(cigarettesAvoided * 5 / 60 / 168).toFixed(1)} weeks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm"
        >
          <h3 className="font-medium text-lg mb-4">Additional Environmental Benefits</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <DropletIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Water Saved</p>
                <p className="text-sm text-gray-500">{waterSaved} liters</p>
                <p className="text-xs text-gray-400 mt-1">Each cigarette requires ~3.7L of water to produce</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Factory className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Toxins Reduced</p>
                <p className="text-sm text-gray-500">{toxinsReduced} chemicals</p>
                <p className="text-xs text-gray-400 mt-1">Cigarettes contain ~7000 harmful chemicals</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Land Preserved</p>
                <p className="text-sm text-gray-500">{landSaved} hectares</p>
                <p className="text-xs text-gray-400 mt-1">Tobacco farming contributes to deforestation</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500">
              By not smoking, you're helping reduce the environmental impact of tobacco production,
              which is responsible for deforestation, water pollution, and significant CO2 emissions.
              Every cigarette not smoked makes a difference.
            </p>
          </div>
        </motion.div>
      </div>
    </SectionCard>
  );
}; 
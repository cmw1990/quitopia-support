import React from 'react';
import { HealthWidget } from '@/components/widgets/HealthWidget';

export function WidgetDemo() {
  // Demo user IDs to show different data
  const users = ['user123', 'user456', 'user789'];
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Health Widget Showcase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Small widget - overview only */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Small Widget (Overview)</h2>
          <HealthWidget 
            userId={users[0]}
            size="sm"
            onlyShowTab="overview"
            widgetTitle="Quick Health"
          />
        </div>
        
        {/* Medium widget - steps tab */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Medium Widget (Steps)</h2>
          <HealthWidget 
            userId={users[1]}
            size="md"
            onlyShowTab="steps"
            widgetTitle="Daily Steps"
          />
        </div>
        
        {/* Medium widget - health tab */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Medium Widget (Health)</h2>
          <HealthWidget 
            userId={users[2]}
            size="md"
            onlyShowTab="health"
            widgetTitle="Health Metrics"
          />
        </div>
        
        {/* Large widget - full tabs */}
        <div className="md:col-span-2 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Large Widget (All Tabs)</h2>
          <div className="flex justify-center">
            <HealthWidget 
              userId={users[0]}
              size="lg"
              exportable={true}
              widgetTitle="Complete Health Widget"
            />
          </div>
        </div>
      </div>
      
      {/* Mobile simulator */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Mobile View Simulation</h2>
        <div className="border border-gray-300 rounded-3xl p-4 mx-auto" style={{ width: '375px', maxWidth: '100%' }}>
          <div className="flex justify-center items-center h-6 mb-2">
            <div className="w-32 h-4 bg-gray-900 rounded-full"></div>
          </div>
          <div className="overflow-hidden bg-background rounded-xl">
            <HealthWidget 
              userId={users[0]}
              size="sm"
              widgetTitle="Home Screen Widget"
            />
          </div>
          <div className="flex justify-center items-center mt-4">
            <div className="w-16 h-4 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Home screen widget explanation */}
      <div className="mt-16 mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">About Home Screen Widgets</h2>
        <p className="mb-4">
          The HealthWidget component is designed to be exported to native mobile home screens on iOS and Android.
          When the <code>exportable</code> prop is set to <code>true</code>, users can add this widget to their
          home screen for quick access to their health metrics.
        </p>
        <p className="mb-4">
          The widget uses platform-specific APIs (via the <code>registerWidgetData</code> function) to share data
          with the native widget system, enabling real-time updates of health metrics without opening the app.
        </p>
        <p>
          Implementation leverages:
        </p>
        <ul className="list-disc ml-8 mt-2">
          <li>iOS WidgetKit for Apple devices</li>
          <li>App Widgets API for Android devices</li>
          <li>Progressive Web App integration for cross-platform support</li>
        </ul>
      </div>
    </div>
  );
}

export default WidgetDemo; 
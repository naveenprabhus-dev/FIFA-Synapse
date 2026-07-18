/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useSynapse } from '../contexts/SynapseContext';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { StatisticsCard, StatusCard } from '../components/dashboard/StatsWidgets';
import { ActivityFeed, EmptyState } from '../components/dashboard/ActivityFeed';
import { SectionContainer, WidgetGrid, QuickActions } from '../components/dashboard/DashboardLayoutElements';
import { Card } from '../components/ui/Card';
import { 
  CrowdDensityWidget, MatchStatusWidget, QueueAnalyticsWidget, 
  ParkingStatusWidget, WeatherWidget, AccessibilityStatusWidget, 
  EmergencyAlertsWidget, AiRecommendationsWidget 
} from '../components/dashboard/PlaceholderWidgets';
import { SmartNavigationAgent } from '../features/fan/SmartNavigationAgent';
import { CrowdIntelligenceAgent } from '../features/crowd/CrowdIntelligenceAgent';
import { FoodServicesAgent } from '../features/fan/FoodServicesAgent';
import { EmergencyResponseAgent } from '../features/emergency/EmergencyResponseAgent';
import { AccessibilityIntelligenceAgent } from '../features/accessibility/AccessibilityIntelligenceAgent';
import { OperationsIntelligenceAgent } from '../features/operations/OperationsIntelligenceAgent';
import { 
  Activity, Award, Compass, Heart, Layers, MapPin, 
  MessageSquare, Shield, ShieldAlert, ShoppingBag, Terminal, Users 
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { activeRole, activeTab, notifications } = useSynapse();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  // Compile general activity logs for the role
  const getMockFeedItemsForRole = (role: UserRole) => {
    const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    switch (role) {
      case UserRole.FAN:
        return [
          { id: '1', title: 'Concession Stand Update', description: 'Pizza Plaza wait time reduced to 4 minutes.', timestamp: defaultTime, severity: 'info' as const },
          { id: '2', title: 'Smart Route Recommendation', description: 'Take exit Sector 101 Gate A for optimal speed.', timestamp: defaultTime, severity: 'info' as const },
          { id: '3', title: 'Half-time commencing', description: 'Move to restrooms early to avoid congestion.', timestamp: '14:45', severity: 'warning' as const },
        ];
      case UserRole.ORGANIZER:
        return [
          { id: '1', title: 'Egress Surge Warning', description: 'Gate 4 exit path reached 4.2 people/sqm.', timestamp: defaultTime, severity: 'warning' as const },
          { id: '2', title: 'Emergency Gates Opened', description: 'Gate 4 auxiliary lanes deployed successfully.', timestamp: defaultTime, severity: 'info' as const },
          { id: '3', title: 'Staff Check-In Complete', description: 'Volunteer platoon 3 reporting to South corridor.', timestamp: '14:32', severity: 'info' as const },
        ];
      case UserRole.OPERATIONS:
        return [
          { id: '1', title: 'New Spill Logged', description: 'Sector 104 staircase spill logged. Sanitation alerted.', timestamp: defaultTime, severity: 'warning' as const },
          { id: '2', title: 'Medical Escort Dispatched', description: 'Medic unit 2 en route to Zone C row 14.', timestamp: defaultTime, severity: 'info' as const },
          { id: '3', title: 'Security patrol active', description: 'Sector 112 turnstile cluster patrol check-in.', timestamp: '14:20', severity: 'info' as const },
        ];
      case UserRole.STAFF:
        return [
          { id: '1', title: 'Beverage Warning', description: 'Sector 104 Stock predicts stockout in 15 mins.', timestamp: defaultTime, severity: 'warning' as const },
          { id: '2', title: 'Restroom Cleaning log', description: 'ADA restroom Sector 104 checked by team A.', timestamp: defaultTime, severity: 'info' as const },
          { id: '3', title: 'Elevator Check', description: 'Elevator cab 2 west concourse inspected.', timestamp: '14:10', severity: 'info' as const },
        ];
    }
  };

  const feedItems = getMockFeedItemsForRole(activeRole);

  return (
    <div className="space-y-6">
      {/* Upper context breadcrumb & titles */}
      <DashboardHeader 
        role={activeRole} 
        activeTab={activeTab} 
        onRefresh={handleRefresh} 
        isRefreshing={isRefreshing} 
      />

      {/* Render based on selected Tab */}
      {activeTab === 'home' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Announcement Banner */}
          <WelcomeBanner />

          {/* Statistics Cards depending on selected role */}
          <SectionContainer title="COGNITIVE METRIC PANEL" description="Current performance parameters calibrated in real-time.">
            {activeRole === UserRole.FAN ? (
              <WidgetGrid cols={3}>
                <StatisticsCard 
                  id="fan-match"
                  title="Match Scoreboard" 
                  value="1 - 0" 
                  subtext="France vs Morocco (Live 52')"
                  status="success"
                  icon={<Award className="w-4 h-4 text-emerald-400" />}
                />
                <StatisticsCard 
                  id="fan-wait"
                  title="Recommended Wait Time" 
                  value="4 min" 
                  subtext="At Gate 8 Pizza Plaza Concession"
                  status="info"
                  trend={{ value: 'Down 62%', direction: 'down' }}
                  icon={<ShoppingBag className="w-4 h-4 text-blue-400" />}
                />
                <StatisticsCard 
                  id="fan-weather"
                  title="Stadium Environment" 
                  value="29°C" 
                  subtext="Moderate humidity, pitch roof open"
                  status="info"
                  icon={<Compass className="w-4 h-4 text-blue-400" />}
                />
              </WidgetGrid>
            ) : activeRole === UserRole.ORGANIZER ? (
              <WidgetGrid cols={3}>
                <StatisticsCard 
                  id="org-capacity"
                  title="Total Crowd Count" 
                  value="84,240" 
                  subtext="Total stadium attendance load"
                  status="success"
                  progressValue={96}
                  icon={<Users className="w-4 h-4 text-emerald-400" />}
                />
                <StatisticsCard 
                  id="org-incidents"
                  title="Active Security Incidents" 
                  value="2" 
                  subtext="Ongoing dispatches in workspace"
                  status="warning"
                  trend={{ value: 'Stable', direction: 'neutral' }}
                  icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
                />
                <StatisticsCard 
                  id="org-sla"
                  title="System Operations Score" 
                  value="98.2%" 
                  subtext="Service throughput SLA target"
                  status="info"
                  trend={{ value: '+0.4%', direction: 'up' }}
                  icon={<Activity className="w-4 h-4 text-blue-400" />}
                />
              </WidgetGrid>
            ) : activeRole === UserRole.OPERATIONS ? (
              <WidgetGrid cols={3}>
                <StatisticsCard 
                  id="ops-tasks"
                  title="My Assigned Tasks" 
                  value="4 Active" 
                  subtext="Sanitation, safety and crowd checks"
                  status="warning"
                  icon={<Users className="w-4 h-4 text-amber-400" />}
                />
                <StatisticsCard 
                  id="ops-corridor"
                  title="Corridor Concurrence" 
                  value="Optimal" 
                  subtext="Gate 4 egress density is 1.2 sqm"
                  status="success"
                  trend={{ value: 'Decreased', direction: 'down' }}
                  icon={<Layers className="w-4 h-4 text-emerald-400" />}
                />
                <StatisticsCard 
                  id="ops-battery"
                  title="Telemetry Sensor Feeds" 
                  value="14 Online" 
                  subtext="99.8% active streaming node rate"
                  status="info"
                  icon={<Terminal className="w-4 h-4 text-blue-400" />}
                />
              </WidgetGrid>
            ) : (
              <WidgetGrid cols={3}>
                <StatisticsCard 
                  id="staff-inventory"
                  title="Sector Stock Level" 
                  value="24% stock" 
                  subtext="Pizza bistro stockout warning sector 104"
                  status="warning"
                  progressValue={24}
                  icon={<ShoppingBag className="w-4 h-4 text-amber-400" />}
                />
                <StatisticsCard 
                  id="staff-speed"
                  title="Speed of Service Score" 
                  value="1.8 min" 
                  subtext="Average customer wait time"
                  status="success"
                  trend={{ value: '-22s', direction: 'down' }}
                  icon={<Activity className="w-4 h-4 text-emerald-400" />}
                />
                <StatisticsCard 
                  id="staff-lifts"
                  title="Elevators & Escalators" 
                  value="100% active" 
                  subtext="No mechanical outages reported"
                  status="success"
                  icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                />
              </WidgetGrid>
            )}
          </SectionContainer>

          {/* Core Widget Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left 2 Cols: Reusable Domain Widget Cards */}
            <div className="xl:col-span-2 space-y-6">
              <SectionContainer title="Contextual Telemetry Grid" description="Role-specific dashboard widgets. Select and interact with mock parameters.">
                <WidgetGrid cols={2}>
                  {activeRole === UserRole.FAN ? (
                    <>
                      <MatchStatusWidget />
                      <CrowdDensityWidget />
                      <QueueAnalyticsWidget />
                      <WeatherWidget />
                    </>
                  ) : activeRole === UserRole.ORGANIZER ? (
                    <>
                      <CrowdDensityWidget />
                      <EmergencyAlertsWidget />
                      <AiRecommendationsWidget />
                      <ParkingStatusWidget />
                    </>
                  ) : activeRole === UserRole.OPERATIONS ? (
                    <>
                      <EmergencyAlertsWidget />
                      <CrowdDensityWidget />
                      <AiRecommendationsWidget />
                      <AccessibilityStatusWidget />
                    </>
                  ) : (
                    <>
                      <QueueAnalyticsWidget />
                      <AiRecommendationsWidget />
                      <AccessibilityStatusWidget />
                      <CrowdDensityWidget />
                    </>
                  )}
                </WidgetGrid>
              </SectionContainer>
            </div>

            {/* Right Col: Timeline & Dispatch Actions */}
            <div className="space-y-6">
              <QuickActions role={activeRole} />
              <ActivityFeed 
                id="home-activity-feed" 
                title="System Activity Logs" 
                items={feedItems} 
                isLoading={isRefreshing}
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'navigation' ? (
        <div className="space-y-6 animate-fade-in">
          <SmartNavigationAgent />
        </div>
      ) : activeTab === 'accessibility' ? (
        <div className="space-y-6 animate-fade-in">
          <AccessibilityIntelligenceAgent />
        </div>
      ) : activeTab === 'crowd-management' || activeTab === 'crowd-monitoring' ? (
        <div className="space-y-6 animate-fade-in">
          <CrowdIntelligenceAgent />
        </div>
      ) : activeTab === 'food-services' || activeTab === 'inventory' ? (
        <div className="space-y-6 animate-fade-in">
          <FoodServicesAgent />
        </div>
      ) : activeTab === 'incident-center' || activeTab === 'active-incidents' || activeTab === 'emergency-center' ? (
        <div className="space-y-6 animate-fade-in">
          <EmergencyResponseAgent />
        </div>
      ) : activeTab === 'operations-overview' || activeTab === 'assigned-tasks' || activeTab === 'maintenance' ? (
        <div className="space-y-6 animate-fade-in">
          <OperationsIntelligenceAgent />
        </div>
      ) : (
        /* Tab Specific Views showing corresponding reusable mock cards */
        <div className="space-y-6 animate-fade-in">
          <SectionContainer 
            title={`${activeTab.replace(/-/g, ' ')} Workspace`}
            description={`Fully configured control module mapped to ${activeRole} roles.`}
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Specialized main view for specific tab */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="p-6 bg-slate-900/30 border border-slate-800/80">
                  <h4 className="text-sm font-bold text-slate-200 font-sans uppercase mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Active Telemetry Matrix</span>
                  </h4>

                  {/* Render widget corresponding closely to the selected tab */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === 'navigation' && <ParkingStatusWidget />}
                    {activeTab === 'navigation' && <CrowdDensityWidget />}
                    
                    {activeTab === 'matches' && <MatchStatusWidget />}
                    {activeTab === 'matches' && <WeatherWidget />}
                    
                    {activeTab === 'food-services' && <QueueAnalyticsWidget />}
                    {activeTab === 'food-services' && <AiRecommendationsWidget />}
                    
                    {activeTab === 'crowd-management' && <CrowdDensityWidget />}
                    {activeTab === 'crowd-management' && <AiRecommendationsWidget />}
                    
                    {activeTab === 'incident-center' && <EmergencyAlertsWidget />}
                    {activeTab === 'incident-center' && <AccessibilityStatusWidget />}
                    
                    {activeTab === 'active-incidents' && <EmergencyAlertsWidget />}
                    {activeTab === 'active-incidents' && <AiRecommendationsWidget />}
                    
                    {activeTab === 'crowd-monitoring' && <CrowdDensityWidget />}
                    {activeTab === 'crowd-monitoring' && <ParkingStatusWidget />}
                    
                    {activeTab === 'facility-status' && <AccessibilityStatusWidget />}
                    {activeTab === 'facility-status' && <ParkingStatusWidget />}
                    
                    {activeTab === 'inventory' && <QueueAnalyticsWidget />}
                    {activeTab === 'inventory' && <AiRecommendationsWidget />}

                    {/* Fallback mock description for other tabs */}
                    {!['navigation', 'matches', 'food-services', 'crowd-management', 'incident-center', 'active-incidents', 'crowd-monitoring', 'facility-status', 'inventory'].includes(activeTab) && (
                      <div className="md:col-span-2 py-8 text-center text-xs text-slate-500 font-mono">
                        Workspace parameters loaded. Live {activeTab} data streams are fully synchronized under standard SLA targets.
                      </div>
                    )}
                  </div>
                </Card>

                {/* Simulated action details block */}
                <Card className="p-6 bg-slate-900/30 border border-slate-800/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Module Description & Guidelines
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    This workspace interface delivers optimized views customized for <strong>{activeRole}</strong> operatives regarding <strong>{activeTab.replace(/-/g, ' ')}</strong> tasks. No Firestore persistence is active in this sandbox mode. Actions and metrics operate using cached browser states.
                  </p>
                </Card>
              </div>

              {/* Sidebar helper controls */}
              <div className="space-y-6">
                <QuickActions role={activeRole} />
                <ActivityFeed 
                  id="tab-activity-feed" 
                  title={`${activeTab.replace(/-/g, ' ')} Activities`} 
                  items={feedItems.slice(0, 2)} 
                  isLoading={isRefreshing}
                />
              </div>
            </div>
          </SectionContainer>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { foodAgent, foodCourtRepository, matchRepository } from '../../services/di';
import { SynapseCoreRecommendation } from '../../types/synapse';
import { FoodCourt, MenuItem } from '../../types/concessions';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  ShoppingBag, Search, Filter, Clock, Footprints, CheckCircle2, 
  AlertTriangle, TrendingUp, TrendingDown, Accessibility, Star, 
  ArrowRight, ChevronRight, Plus, Minus, RefreshCw, Sliders, 
  Sparkles, Check, Activity, Leaf, UtensilsCrossed 
} from 'lucide-react';

export function FoodServicesAgent() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();

  // 1. Core State
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<FoodCourt | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<SynapseCoreRecommendation | null>(null);
  
  // 2. Interactive Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [halalOnly, setHalalOnly] = useState<boolean>(false);
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean>(false);
  const [accessibilityRequired, setAccessibilityRequired] = useState<boolean>(false);

  // 3. Simulator Parameters
  const [matchMinute, setMatchMinute] = useState<number>(52);
  const [isSyncingSimulator, setIsSyncingSimulator] = useState<boolean>(false);

  // Load food courts from the repository
  const refreshFoodCourtsList = async () => {
    try {
      const courts = await foodCourtRepository.getFoodCourts();
      setFoodCourts(courts);
      // Synchronize the selected food court details if one is selected
      if (selectedFoodCourt) {
        const updatedSelected = courts.find(c => c.id === selectedFoodCourt.id);
        if (updatedSelected) {
          setSelectedFoodCourt(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to load food courts telemetry:', err);
    }
  };

  // Modify Queue Length in Mock Repository and Trigger Live Re-fetch
  const handleUpdateQueueLength = async (foodCourtId: string, delta: number) => {
    setIsSyncingSimulator(true);
    try {
      const target = foodCourts.find(f => f.id === foodCourtId);
      if (target) {
        const newLength = Math.max(0, target.queue.currentLength + delta);
        await foodCourtRepository.updateQueueLength(foodCourtId, newLength);
        await refreshFoodCourtsList();
      }
    } catch (err) {
      console.error('Failed to update queue length:', err);
    } finally {
      setIsSyncingSimulator(false);
    }
  };

  // Modify Menu Item Stock Level in Mock Repository and Trigger Live Re-fetch
  const handleUpdateStockLevel = async (foodCourtId: string, itemId: string, currentLevel: MenuItem['stockLevel']) => {
    setIsSyncingSimulator(true);
    const levels: MenuItem['stockLevel'][] = ['HIGH', 'MEDIUM', 'LOW', 'OUT_OF_STOCK'];
    const nextIndex = (levels.indexOf(currentLevel) + 1) % levels.length;
    const nextLevel = levels[nextIndex];

    try {
      await foodCourtRepository.updateMenuItemStock(foodCourtId, itemId, nextLevel);
      await refreshFoodCourtsList();
    } catch (err) {
      console.error('Failed to update menu item stock level:', err);
    } finally {
      setIsSyncingSimulator(false);
    }
  };

  // 4. Request Recommendation from Food Recommendation Agent
  const getSmartRecommendations = async () => {
    setIsLoadingRecommendation(true);
    try {
      const userId = user?.uid || 'temp-spectator-888';
      const userSector = 'SEC_104'; // Default baseline sector for fan
      
      const options = {
        categoryFilter: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        searchQuery: searchQuery || undefined,
        halalOnly,
        vegetarianOnly,
        accessibilityRequired,
      };

      const result = await foodAgent.getSmartFoodRecommendations(
        userId,
        activeRole,
        {
          latitude: 25.3522,
          longitude: 51.5311,
          sectorId: userSector,
        },
        options
      );

      setRecommendation(result);
    } catch (err) {
      console.error('Failed to retrieve food recommendation:', err);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // Trigger recommendation updates on filter/state change
  useEffect(() => {
    refreshFoodCourtsList();
  }, []);

  useEffect(() => {
    getSmartRecommendations();
  }, [categoryFilter, halalOnly, vegetarianOnly, accessibilityRequired, foodCourts.map(f => f.queue.currentLength).join(','), foodCourts.map(f => f.menu.map(m => m.stockLevel).join(',')).join('|')]);

  // Categories list derived from all concessions
  const availableCategories = ['ALL', 'PIZZA', 'BURGER', 'SHAWARMA', 'FALAFEL', 'TACO', 'NACHOS', 'BEVERAGE', 'MERCHANDISE'];

  // Filter concessions locally for display list based on search/category queries
  const filteredFoodCourts = foodCourts.filter(court => {
    if (categoryFilter !== 'ALL' && !court.categories.includes(categoryFilter)) {
      return false;
    }
    if (halalOnly && !court.menu.some(item => item.isHalal && item.isAvailable)) {
      return false;
    }
    if (vegetarianOnly && !court.menu.some(item => item.isVegetarian && item.isAvailable)) {
      return false;
    }
    if (accessibilityRequired && !court.accessibilityFriendly) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesCourtName = court.name.toLowerCase().includes(query);
      const matchesMenuName = court.menu.some(item => item.name.toLowerCase().includes(query));
      if (!matchesCourtName && !matchesMenuName) {
        return false;
      }
    }
    return true;
  });

  // Calculate generic walking minutes based on location mapping
  const getWalkingMinutes = (courtId: string): number => {
    switch (courtId) {
      case 'bistro-1': return 2; // Sector 104 is user's sector, so very close!
      case 'bistro-2': return 6; // Sector 112 is East concourse, slightly further
      case 'bistro-3': return 4; // Sector 108 is North concourse
      case 'merch-1': return 3;  // Sector 102
      default: return 5;
    }
  };

  // Color helper for queue length
  const getQueueBadgeColor = (minutes: number) => {
    if (minutes <= 5) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (minutes <= 12) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  // Stock badge colors
  const getStockBadgeColor = (level: MenuItem['stockLevel']) => {
    switch (level) {
      case 'HIGH': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-400 border-blue-500/10';
      case 'LOW': return 'bg-amber-500/10 text-amber-400 border-amber-500/10';
      case 'OUT_OF_STOCK': return 'bg-rose-500/10 text-rose-400 border-rose-500/10';
    }
  };

  return (
    <div className="space-y-6" id="food-services-agent-container">
      {/* Overview Intro Banner */}
      <Card className="bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-100 tracking-tight font-sans uppercase flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span>AI Concession & Queue Optimization Agent</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            This agent observes concession line lengths, menu availability, dietary requirements, and match timestamps to formulate smart recommendations. It guides you to the concession kiosk that offers the optimal compromise between walking distance and line waiting times.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={getSmartRecommendations}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
            title="Refresh Recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecommendation ? 'animate-spin text-blue-400' : ''}`} />
            <span>FORCE RE-CALCULATE</span>
          </button>
          <div className="bg-slate-950/60 border border-slate-900 px-3 py-1.5 rounded-lg text-right text-[10px] font-mono text-slate-400">
            <span>MODEL: <strong>GEMINI-3.5-FLASH</strong></span>
          </div>
        </div>
      </Card>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Hand: Telemetry Modifier & Interactive Controls */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* SIMULATOR MODIFIER PANEL */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Stadium Environment Simulator</span>
              </h4>
              {isSyncingSimulator && (
                <span className="text-[10px] text-blue-400 font-mono animate-pulse">
                  SYNCING...
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Alter stadium telemetry nodes below in real-time. The AI Agent will immediately analyze changes and re-calculate recommended pathways.
            </p>

            <div className="space-y-4 pt-2 border-t border-slate-800/60">
              {/* Match Minute Controller */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Match Time Minute:</span>
                  <span className="text-blue-400 font-mono font-bold">{matchMinute}' ({matchMinute < 45 ? '1st Half' : matchMinute <= 60 ? 'Halftime Wave' : '2nd Half'})</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={matchMinute}
                  onChange={(e) => setMatchMinute(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Concession Queues Custom Modifier */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">
                  Concession Queues (People):
                </span>
                <div className="space-y-2">
                  {foodCourts.map(court => (
                    <div key={court.id} className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-slate-300 block max-w-[140px] truncate">
                          {court.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Wait: {court.queue.estimatedWaitMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQueueLength(court.id, -5)}
                          disabled={court.queue.currentLength <= 0}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-200 min-w-[20px] text-center">
                          {court.queue.currentLength}
                        </span>
                        <button
                          onClick={() => handleUpdateQueueLength(court.id, 5)}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* DYNAMIC SEARCH & FILTER PANEL */}
          <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Cuisine & Preference Filters</span>
            </h4>

            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search food, beverage, or kiosk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Categories scrollable pill row */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">
                Food Category:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences Checkbox toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
              {/* Halal */}
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={halalOnly}
                  onChange={(e) => setHalalOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 bg-slate-950 border border-slate-800 rounded"
                />
                <span className="text-xs text-slate-300">Halal Certified Items Only</span>
              </label>

              {/* Vegetarian */}
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={vegetarianOnly}
                  onChange={(e) => setVegetarianOnly(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 bg-slate-950 border border-slate-800 rounded"
                />
                <span className="text-xs text-slate-300">Vegetarian Dishes Only</span>
              </label>

              {/* Accessibility */}
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accessibilityRequired}
                  onChange={(e) => setAccessibilityRequired(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 bg-slate-950 border border-slate-800 rounded"
                />
                <span className="text-xs text-slate-300">Accessibility Friendly Access Only</span>
              </label>
            </div>
          </Card>

        </div>

        {/* Right Hand Column: AI Recommendation Output & Concession List */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* AI INTELLIGENCE RECOMMENDATION ENGINE */}
          {isLoadingRecommendation ? (
            <Card className="p-12 border border-slate-800/60 bg-slate-900/20 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-7 w-7 bg-blue-500 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-slate-100 animate-pulse" />
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 text-center animate-pulse tracking-widest uppercase">
                CONSULTING CONCESSION REPLENISHMENT & QUEUE LOOP...
              </p>
            </Card>
          ) : recommendation ? (
            <Card className="border border-blue-900/40 bg-blue-950/5 p-6 rounded-2xl space-y-5">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                    <span>SYNAPSE INTELLIGENCE DIRECTIVE</span>
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-100 tracking-tight font-sans">
                    {recommendation.title}
                  </h3>
                </div>
                <Badge variant={recommendation.priority === 'CRITICAL' ? 'error' : recommendation.priority === 'HIGH' ? 'warning' : 'info'} className="text-[10px] px-2.5 py-0.5">
                  {recommendation.priority} PRIORITY
                </Badge>
              </div>

              {/* Recommendation Statement */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                  Recommended Action:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {recommendation.recommendation}
                </p>
              </div>

              {/* Key Decision Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Walk Time</span>
                  <div className="flex items-center justify-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {String(recommendation.contextSnapshot?.estimatedWalkingTimeMinutes || getWalkingMinutes('bistro-1'))}m
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Wait Time</span>
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {String(recommendation.contextSnapshot?.estimatedWaitingTimeMinutes || 4)}m
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Time Saved</span>
                  <div className="flex items-center justify-center gap-1 text-emerald-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold font-mono">
                      {String(recommendation.contextSnapshot?.estimatedTimeSavedMinutes || 12)}m
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Confidence</span>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {Math.round(recommendation.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Reasoning Details Panel */}
              {recommendation.reasoningDetails && recommendation.reasoningDetails.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Reasoning & Calculations Loop:
                  </span>
                  <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-2">
                    {recommendation.reasoningDetails.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Justification details */}
              <div className="text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-800/50 pt-3">
                <strong>AI Reason:</strong> {recommendation.reason}
              </div>

              {/* Accessibility details & Alternative suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/50 pt-4 text-xs text-slate-400">
                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
                    Accessibility Route Check:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Accessibility className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      {String(recommendation.contextSnapshot?.accessibilityNotes || 'Standard route utilizes step-free concourse links.')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">
                    Alternative Option:
                  </span>
                  <div className="text-slate-300">
                    {recommendation.alternative || 'Maintain pizza bistro queue or head to East Merchandise kiosk.'}
                  </div>
                </div>
              </div>

            </Card>
          ) : null}

          {/* CONCESSIONS CARDS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-widest">
                Concessions & Kiosks List ({filteredFoodCourts.length})
              </h4>
              <span className="text-[10px] text-slate-500 font-sans">
                Click kiosk to inspect menu & simulator stock
              </span>
            </div>

            {filteredFoodCourts.length === 0 ? (
              <Card className="p-12 text-center text-xs text-slate-500 font-mono border border-slate-800/60 bg-slate-900/10">
                No concessions found matching your filters. Try adjusting dietary or category preferences.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFoodCourts.map(court => {
                  const walkingMin = getWalkingMinutes(court.id);
                  const isSelected = selectedFoodCourt?.id === court.id;
                  
                  return (
                    <Card 
                      key={court.id}
                      onClick={() => setSelectedFoodCourt(court)}
                      className={`p-4 border transition-all duration-200 cursor-pointer text-left space-y-3 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-950/5 ring-1 ring-blue-500/20' 
                          : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Title & Status */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-200 font-sans">
                            {court.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-sans">
                            {court.locationDescription}
                          </span>
                        </div>
                        <Badge 
                          variant={court.status === 'OPEN' ? 'success' : 'error'} 
                          className="text-[9px] py-0.5"
                        >
                          {court.status}
                        </Badge>
                      </div>

                      {/* Performance Indicators */}
                      <div className="grid grid-cols-3 gap-2 py-1">
                        {/* Queue Wait Time */}
                        <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block">Line Wait</span>
                          <span className={`text-xs font-bold font-mono ${getQueueBadgeColor(court.queue.estimatedWaitMinutes).split(' ')[1]}`}>
                            {court.queue.estimatedWaitMinutes} min
                          </span>
                        </div>

                        {/* Walking Time */}
                        <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block">Walk Time</span>
                          <span className="text-xs font-bold font-mono text-blue-400">
                            {walkingMin} min
                          </span>
                        </div>

                        {/* Popularity Rating */}
                        <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-900 text-center">
                          <span className="text-[8px] text-slate-500 font-mono block">Popularity</span>
                          <div className="flex items-center justify-center gap-0.5 text-xs font-bold font-mono text-amber-400">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{court.popularityScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Category Pills & Accessibility indicator */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <div className="flex items-center space-x-1">
                          {court.accessibilityFriendly ? (
                            <Accessibility className="w-3.5 h-3.5 text-blue-400" aria-label="Accessible Facility" />
                          ) : (
                            <span className="text-[9px] text-slate-500 font-mono">No ADA ramp</span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500">|</span>
                          <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
                            {court.categories.join(', ')}
                          </span>
                        </div>
                        <span className="text-blue-400 hover:text-blue-300 font-mono text-[9px] font-bold flex items-center gap-0.5">
                          <span>DETAILS</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>

                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* DYNAMIC SELECTED KIOSK INSPECTOR PANEL */}
          {selectedFoodCourt && (
            <Card className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-extrabold text-slate-200 font-sans uppercase">
                      {selectedFoodCourt.name}
                    </h4>
                    <span className="text-xs text-slate-500">Inspector</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedFoodCourt.locationDescription} — Capacity Load: {selectedFoodCourt.currentCapacityLoad}/{selectedFoodCourt.capacityLimit} visitors.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFoodCourt(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-mono uppercase cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

              {/* Menu items stock editor */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-bold">
                  Kiosk Menu Inventory & Stock Simulation:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedFoodCourt.menu.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleUpdateStockLevel(selectedFoodCourt.id, item.id, item.stockLevel)}
                      className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-900 hover:border-slate-800 transition-all cursor-pointer"
                      title="Click to cycle stock level in simulator"
                    >
                      <div className="space-y-1 max-w-[170px]">
                        <span className="text-xs font-semibold text-slate-300 block truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-blue-400">${item.price.toFixed(2)}</span>
                          {item.isHalal && (
                            <Badge variant="success" className="text-[8px] px-1 py-0 select-none">HALAL</Badge>
                          )}
                          {item.isVegetarian && (
                            <Badge variant="success" className="text-[8px] px-1 py-0 select-none flex items-center gap-0.5">
                              <Leaf className="w-2 h-2 text-emerald-400" />
                              <span>VEG</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge 
                          variant="info"
                          className={`text-[8px] font-mono px-2 py-0.5 border ${getStockBadgeColor(item.stockLevel)}`}
                        >
                          {item.stockLevel}
                        </Badge>
                        <span className="text-[8px] text-slate-500 font-mono block select-none">CYCLE STOCK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </Card>
          )}

        </div>

      </div>

    </div>
  );
}

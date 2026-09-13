import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import {
  Brain, CloudRain, Droplets, AlertTriangle, ShieldAlert,
  Compass, ArrowUpRight, Activity, RefreshCw, Layers,
  CheckCircle2, Gauge, TrendingUp, AlertOctagon, HelpCircle,
  Clock, MapPin, Database, ChevronRight, Zap
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import VoiceSpeakerButton from '../../components/common/VoiceSpeakerButton';
import {
  getLivePrediction,
  getForecastTrend,
  getWardRiskPredictions,
  dispatchEarlyAction,
} from '../../services/predictionService';
import Swal from 'sweetalert2';

export default function AiPredictionDashboard() {
  const [prediction, setPrediction] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [wardRisks, setWardRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWardTab, setSelectedWardTab] = useState('All');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [predRes, trendRes, wardsRes] = await Promise.all([
        getLivePrediction(),
        getForecastTrend(),
        getWardRiskPredictions(),
      ]);

      if (predRes) setPrediction(predRes);
      if (trendRes) setTrendData(trendRes);
      if (wardsRes) setWardRisks(wardsRes);
    } catch (err) {
      console.error('Failed to load AI prediction dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const handleExecuteEarlyAction = async () => {
    if (!prediction) return;

    const result = await Swal.fire({
      title: 'Execute AI Recommended Early Action?',
      html: `
        <div class="text-left text-sm space-y-2 mt-2">
          <p class="text-slate-600 dark:text-slate-300"><strong>Recommended Action:</strong> ${prediction.recommendedAction}</p>
          <p class="text-slate-600 dark:text-slate-300"><strong>Target Horizon:</strong> ${prediction.riskWindow}</p>
          <div class="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
            ⚠️ <strong>Safety Guardrail:</strong> This action will dispatch a verified high-priority Work Order to field technicians and notify the Municipal Emergency Desk.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm & Dispatch Action',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0F4C5C',
    });

    if (result.isConfirmed) {
      try {
        const res = await dispatchEarlyAction({
          actionType: 'Flood Inundation Pre-Diverter Actuation',
          ward: 'Ward 12',
          details: prediction.recommendedAction,
          technicianName: 'Rajesh Kumar (TECH-8842)',
        });

        Swal.fire({
          title: 'Early Action Dispatched!',
          text: res.message || 'Mitigation order active in field maintenance suite.',
          icon: 'success',
          confirmButtonColor: '#0F4C5C',
        });
      } catch (err) {
        Swal.fire('Dispatch Failed', err.message || 'Could not dispatch early action.', 'error');
      }
    }
  };

  const getRiskColor = (prob) => {
    if (prob >= 80) return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    if (prob >= 65) return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    if (prob >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  };

  const filteredWards = wardRisks.filter((w) => {
    if (selectedWardTab === 'All') return true;
    return w.riskTier === selectedWardTab;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white font-display">
                  AI Flood Prediction Engine
                </h1>
                <Badge variant="purple" className="text-[10px] uppercase tracking-wider py-0.5 px-2 font-mono">
                  SUOWMRS-HydroML v1.4
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hydrological risk prediction combining rainfall forecasts, drainage saturation index, and real-time telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai-prediction/history">
            <Button variant="outline" size="sm" icon={<Activity className="w-3.5 h-3.5" />}>
              Prediction Audit & Accuracy
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Model
          </Button>
        </div>
      </div>

      {/* Prototype Model Transparency Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200">
          <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>
            <strong>Hydrological Prediction Prototype:</strong> Risk probabilities are computed using verified physics-based precipitation inflow, soil catchment absorption rates, and drainage gradient models.
          </span>
        </div>
        <Link to="/ai-prediction/history" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 flex items-center gap-1">
          <span>Audit Log</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Screen: Hero AI Flood Risk & Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AI Flood Risk Card (5 cols) */}
        <Card className="lg:col-span-5 p-6 border-slate-200 dark:border-white/10 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Brain className="w-48 h-48" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              AI Flood Risk Assessment
            </span>
            <div className="flex items-center gap-2">
              <VoiceSpeakerButton
                text={`AI Hydrological Prediction. Flood probability is ${prediction?.floodProbability || 78} percent. Risk level is ${prediction?.riskLevel || 'High'}. Expected risk window: ${prediction?.riskWindow || 'next 30 to 60 minutes'}. Drainage Saturation Index is ${prediction?.dsiScore || 76} percent.`}
                label="Listen Summary"
                size="xs"
                variant="pill"
                id="ai-risk-summary"
              />
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                Live Inference
              </span>
            </div>
          </div>

          {/* Probability Hero */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className={`text-6xl font-black font-display tracking-tight ${
              (prediction?.floodProbability || 78) >= 80 ? 'text-rose-500' :
              (prediction?.floodProbability || 78) >= 65 ? 'text-orange-500' :
              (prediction?.floodProbability || 78) >= 40 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {prediction?.floodProbability || 78}%
            </span>
            <div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                getRiskColor(prediction?.floodProbability || 78)
              }`}>
                {prediction?.riskLevel || 'High'} Risk
              </span>
            </div>
          </div>

          {/* Expected Risk Window */}
          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              Expected Risk Window:
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
              {prediction?.riskWindow || 'Next 30–60 minutes'}
            </span>
          </div>

          {/* Contributing Factors Checklist */}
          <div className="mt-5 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Primary Contributing Factors:
            </span>
            <div className="space-y-2">
              {prediction?.mainFactors ? (
                prediction.mainFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>Heavy rainfall: 34.5 mm/hr (Monsoon Downpour)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>Drainage level at 81% in riverbed culvert</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>Storage capacity at 74% (limited buffer remaining)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>Rising water trend (+3.8% / 10 minutes)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Phase 7.7: Early Action Dispatch Button */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
            <Button
              variant="danger"
              className="w-full justify-center"
              onClick={handleExecuteEarlyAction}
              icon={<Zap className="w-4 h-4 text-amber-300" />}
            >
              Execute Early Action Protocol
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Dispatches automated preventative ticket with municipal safety confirmation
            </p>
          </div>
        </Card>

        {/* Right: Current Telemetry & Weather Conditions Strip (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            
            {/* Rainfall */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rainfall</span>
                <CloudRain className="w-4 h-4 text-sky-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
                {prediction?.currentConditions?.rainfallMmPerHour || 34.5} <span className="text-xs font-normal text-slate-500">mm/hr</span>
              </div>
              <Badge variant="blue" className="mt-2 text-[10px]">
                {prediction?.currentConditions?.rainfallIntensity || 'Heavy'}
              </Badge>
            </Card>

            {/* Water Level */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Water Level</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
                {prediction?.currentConditions?.waterLevelPercentage || 81}%
              </div>
              <Badge variant="danger" className="mt-2 text-[10px]">
                Culvert Peak
              </Badge>
            </Card>

            {/* Drainage Saturation Index (DSI) */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drainage Saturation (DSI)</span>
                <Gauge className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                {prediction?.dsiScore || 76}%
              </div>
              <Badge variant="purple" className="mt-2 text-[10px]">
                {prediction?.dsiCategory || 'High'} Saturation
              </Badge>
            </Card>

            {/* Storage */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Storage Buffer</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
                {prediction?.currentConditions?.storagePercentage || 74}%
              </div>
              <Badge variant="amber" className="mt-2 text-[10px]">
                2,600 L Free
              </Badge>
            </Card>

            {/* Flow Rate */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drain Flow Rate</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
                {prediction?.currentConditions?.drainageFlowRateLpm || 138} <span className="text-xs font-normal text-slate-500">L/min</span>
              </div>
              <Badge variant="blue" className="mt-2 text-[10px]">
                Inflow Active
              </Badge>
            </Card>

            {/* Temperature */}
            <Card className="p-4 border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Atmosphere</span>
                <TrendingUp className="w-4 h-4 text-slate-500" />
              </div>
              <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
                {prediction?.currentConditions?.temperatureC || 27.2}°C
              </div>
              <Badge variant="outline" className="mt-2 text-[10px]">
                Bhubaneswar
              </Badge>
            </Card>

          </div>

          {/* Recommended Operational Action Card */}
          <Card className="p-4 border-indigo-200 dark:border-indigo-800/40 bg-indigo-500/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Recommended Preventative Mitigation Protocol
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {prediction?.recommendedAction || 'Pre-divert 500 L/min to Riverbed Sump Tank and dispatch field inspection to Ward 12 & 4 culverts.'}
                </p>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Phase 7.5: Prediction Chart (Observed Data vs Predicted Horizon) */}
      <Card className="p-5 border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Observed vs. Predicted Drainage Level Curve (8-Hour Horizon)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous comparison between sensor-measured historical telemetry (Past 4h) and hydrological ML projection (Next 4h)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Observed Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 border-t-2 border-dashed border-[#D946EF]" />
              <span className="text-purple-600 dark:text-purple-400 font-medium">ML Prediction Curve</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="observedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D946EF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D946EF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/10" />
              <XAxis dataKey="timeLabel" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#fff',
                }}
              />
              <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Warning 75%', fill: '#F59E0B', fontSize: 10 }} />
              <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Flood Threshold 90%', fill: '#EF4444', fontSize: 10 }} />
              
              {/* Observed Curve */}
              <Area
                type="monotone"
                dataKey="observedWaterLevel"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#observedGrad)"
                name="Observed Level (%)"
              />
              
              {/* Predicted Curve */}
              <Area
                type="monotone"
                dataKey="predictedWaterLevel"
                stroke="#D946EF"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#predictedGrad)"
                name="Predicted Risk Level (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Phase 7.6: Ward-Level Risk Prediction Table */}
      <Card className="p-5 border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Ward-Level Flood Risk Projections (All 25 City Wards)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hydrological risk calculated across all 128 monitoring nodes in the municipal network
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'Critical', 'High', 'Moderate', 'Low'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedWardTab(tab)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedWardTab === tab
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}

            <Link to="/municipality/map">
              <Button variant="outline" size="sm" icon={<Compass className="w-3.5 h-3.5" />}>
                View GIS Map
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredWards.map((w) => (
            <div
              key={w.ward}
              className={`p-3 rounded-xl border transition-all ${
                w.riskTier === 'Critical' ? 'border-rose-500/40 bg-rose-500/5' :
                w.riskTier === 'High' ? 'border-orange-500/30 bg-orange-500/5' :
                w.riskTier === 'Moderate' ? 'border-amber-500/30 bg-amber-500/5' :
                'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {w.ward}
                </span>
                <span className={`text-xs font-black font-mono ${
                  w.riskTier === 'Critical' ? 'text-rose-500' :
                  w.riskTier === 'High' ? 'text-orange-500' :
                  w.riskTier === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {w.floodProbability}%
                </span>
              </div>

              <div className="mt-2 w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${w.floodProbability}%`, backgroundColor: w.riskColor }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{w.systemsCount} systems</span>
                <span className="capitalize font-semibold" style={{ color: w.riskColor }}>
                  {w.riskTier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </motion.div>
  );
}

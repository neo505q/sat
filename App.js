import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import EarthViewer from './components/EarthViewer';

const REFRESH_INTERVAL_MS = 15000;
const RISK_REFRESH_INTERVAL_MS = 3000;

function getDockedPanelSize() {
  return { width: 52, height: 52 };
}

function measureElementSize(ref, fallbackWidth, fallbackHeight) {
  if (ref?.current) {
    const rect = ref.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return { width: rect.width, height: rect.height };
    }
  }
  return { width: fallbackWidth, height: fallbackHeight };
}

function getEdgeZone(x, y, width, height) {
  const EDGE = 60;
  const BOTTOM = 130;
  if (y + height >= window.innerHeight - BOTTOM) return 'bottom';
  if (x <= EDGE) return 'left';
  if (x + width >= window.innerWidth - EDGE) return 'right';
  return 'default';
}

function getDockedStyle(zone, position) {
  const { width: iconW, height: iconH } = getDockedPanelSize();
  const bottomLimit = getBottomDragLimit();
  if (zone === 'left') {
    return { left: '0px', top: `${Math.min(Math.max(position.y, 76), bottomLimit - iconH)}px` };
  }
  if (zone === 'right') {
    return { left: 'auto', right: '0px', top: `${Math.min(Math.max(position.y, 76), bottomLimit - iconH)}px` };
  }
  if (zone === 'bottom') {
    return { left: `${Math.min(Math.max(position.x, 12), window.innerWidth - iconW - 170)}px`, top: 'auto', bottom: '12px' };
  }
  return null;
}

function getBottomDragLimit() {
  const toolbar = document.querySelector('.map-toolbar-wrap');
  const queue = document.querySelector('.conjunction-queue');
  const toolbarBottom = toolbar
    ? toolbar.getBoundingClientRect().bottom
    : window.innerHeight - 18;
  const queueBottom = queue
    ? queue.getBoundingClientRect().bottom
    : window.innerHeight - 18;

  return Math.max(toolbarBottom, queueBottom);
}

function severityOf(distanceKm) {
  if (distanceKm <= 50) return 'critical';
  if (distanceKm <= 250) return 'warning';
  return 'safe';
}

function formatTcaCountdown(offsetSeconds) {
  if (offsetSeconds === null || offsetSeconds === undefined || Number.isNaN(offsetSeconds)) {
    return '—';
  }
  const past = offsetSeconds <= 0;
  const abs = Math.abs(offsetSeconds);
  const minutes = Math.floor(abs / 60);
  const seconds = (abs % 60).toFixed(1);
  const padded = seconds.padStart(4, '0');
  const clock = minutes > 0 ? `${minutes}:${padded}` : `${padded}s`;
  return past ? `T+${clock} (past TCA)` : `T-${clock}`;
}

function utcTime() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  });
}

function useFloatingPanel(storageKey, fallback, panelWidth = 390, panelHeight = 560) {
  const [position, setPosition] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      return fallback;
    }
  });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(position));
    } catch (error) {
      // Persisting panel position is optional.
    }
  }, [position, storageKey]);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = position;
    const panelElement = event.currentTarget.closest('.floating-panel');
    setDragging(true);

    const handleMove = (moveEvent) => {
      const toolbarBottomInset = 18;
      const currentPanelHeight = panelElement?.getBoundingClientRect().height ?? panelHeight;
      const maxX = Math.max(12, window.innerWidth - panelWidth);
      const maxY = Math.max(76, getBottomDragLimit() - currentPanelHeight);
      setPosition({
        x: Math.min(maxX, Math.max(12, origin.x + moveEvent.clientX - startX)),
        y: Math.min(maxY, Math.max(76, origin.y + moveEvent.clientY - startY)),
      });
    };

    const handleUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [position]);

  return { position, setPosition, dragging, handlePointerDown };
}

function useDockedAxisDrag(zone, position, setPosition) {
  const positionRef = useRef(position);
  positionRef.current = position;

  return useCallback((event, onExpand) => {
    if (event.button !== 0) return;
    if (zone === 'default') {
      onExpand();
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = positionRef.current;
    let moved = false;

    const handleMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;

      const { width: iconW, height: iconH } = getDockedPanelSize();
      if (zone === 'left' || zone === 'right') {
        const minY = 76;
        const maxY = Math.max(minY, getBottomDragLimit() - iconH);
        setPosition({ ...origin, y: Math.min(maxY, Math.max(minY, origin.y + dy)) });
      } else if (zone === 'bottom') {
        const minX = 12;
        const maxX = Math.max(minX, window.innerWidth - iconW - 170);
        setPosition({ ...origin, x: Math.min(maxX, Math.max(minX, origin.x + dx)) });
      }
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      if (!moved) onExpand();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [zone, setPosition]);
}

function App() {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const earthViewerRef = useRef(null);
  const [activeQueueAlertId, setActiveQueueAlertId] = useState(null);
  const [maneuverAnalysis, setManeuverAnalysis] = useState(null);
  const [aiValidation, setAiValidation] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPanelPosition, setAiPanelPosition] = useState({
    x: typeof window === 'undefined' ? 400 : window.innerWidth / 2 - 190,
    y: typeof window === 'undefined' ? 160 : window.innerHeight / 2 - 220,
  });
  const [objectAnalysis, setObjectAnalysis] = useState(null);
  const [riskMode, setRiskMode] = useState('live');
  const [demoScenario, setDemoScenario] = useState('safe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const [selectedCollapsed, setSelectedCollapsed] = useState(false);
  const [riskCollapsed, setRiskCollapsed] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [selectedHidden, setSelectedHidden] = useState(false);
  const [riskHidden, setRiskHidden] = useState(false);
  const [queueHidden, setQueueHidden] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [selectedMinimizeZone, setSelectedMinimizeZone] = useState('default');
  const [riskMinimizeZone, setRiskMinimizeZone] = useState('default');
  const [aiMinimizeZone, setAiMinimizeZone] = useState('default');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const requestInFlightRef = useRef(false);
  const riskRequestInFlightRef = useRef(false);
  const maneuverRequestInFlightRef = useRef(false);
  const aiValidationRequestInFlightRef = useRef(false);

  const aiPanelPositionRef = useRef(aiPanelPosition);
  const moveAiPanel = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = aiPanelPositionRef.current;
    const panelElement = event.currentTarget.closest('.ai-validation-floating, .collapsed-panel-button');
    const handleMove = (moveEvent) => {
      const width = 380;
      const height = 440;
      const currentPanelHeight = panelElement?.getBoundingClientRect().height ?? height;
      const next = {
        x: Math.min(Math.max(10, window.innerWidth - width - 10), Math.max(10, origin.x + moveEvent.clientX - startX)),
        y: Math.min(
          Math.max(76, getBottomDragLimit() - currentPanelHeight),
          Math.max(76, origin.y + moveEvent.clientY - startY)
        ),
      };

      aiPanelPositionRef.current = next;
      setAiPanelPosition(next);
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []);
  
  const objectAnalysisRequestInFlightRef = useRef(false);

  const selectedPanel = useFloatingPanel(
    'leo-selected-panel-position',
    { x: 24, y: 96 },
    294,
    560
  );
  const riskPanel = useFloatingPanel(
    'leo-risk-panel-position',
    {
      x: typeof window === 'undefined' ? 1000 : Math.max(24, window.innerWidth - 414),
      y: 156,
    },
    380,
    560
  );

  const selectedDockedDrag = useDockedAxisDrag(selectedMinimizeZone, selectedPanel.position, selectedPanel.setPosition);
  const riskDockedDrag = useDockedAxisDrag(riskMinimizeZone, riskPanel.position, riskPanel.setPosition);
  const aiDockedDrag = useDockedAxisDrag(aiMinimizeZone, aiPanelPosition, setAiPanelPosition);

  const recenterPanel = useCallback((panel) => {
    const centerX = (width) => Math.max(12, window.innerWidth / 2 - width / 2);
    const centerY = (height) => Math.max(76, window.innerHeight / 2 - height / 2);
    if (panel === 'selected') {
      setSelectedHidden(false);
      setSelectedCollapsed(false);
      selectedPanel.setPosition({ x: centerX(390), y: centerY(560) });
    } else if (panel === 'risk') {
      setRiskHidden(false);
      setRiskCollapsed(false);
      riskPanel.setPosition({ x: centerX(390), y: centerY(560) });
    } else if (panel === 'queue') {
      setQueueHidden(false);
      setQueueOpen(true);
    } else if (panel === 'ai') {
      setAiPanelOpen(true);
      setAiCollapsed(false);

      const nextPosition = {
        x: centerX(380),
        y: centerY(440),
      };

      aiPanelPositionRef.current = nextPosition;
      setAiPanelPosition(nextPosition);
    }

    setMoreMenuOpen(false);
  }, [selectedPanel, riskPanel]);

  const fetchData = useCallback(async () => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const [objRes, alertRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/objects' ),
        fetch('http://127.0.0.1:8000/alerts' ),
      ]);
      if (!objRes.ok || !alertRes.ok) {
        throw new Error('Catalog response was not successful');
      }
      const objJson = await objRes.json();
      const alertJson = await alertRes.json();
      setData(objJson);
      setAlerts(Array.isArray(alertJson) ? alertJson : []);
      setLastUpdate(utcTime());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      requestInFlightRef.current = false;
    }
  }, []);

  const fetchRiskAnalysis = useCallback(async () => {
    if (riskRequestInFlightRef.current) return;
    riskRequestInFlightRef.current = true;
    try {
      const riskParams = new URLSearchParams({ mode: riskMode });
      if (riskMode === 'selected' && selectedObject?.id) {
        riskParams.set('object_id', selectedObject.id);
      }
      if (riskMode === 'demo') {
        riskParams.set('scenario', demoScenario);
      }
      const response = await fetch(`http://127.0.0.1:8000/risk-analysis?${riskParams.toString( )}`);
      if (!response.ok) throw new Error('Risk analysis response was not successful');
      setRiskAnalysis(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      riskRequestInFlightRef.current = false;
    }
  }, [riskMode, selectedObject, demoScenario]);

  const fetchManeuverAnalysis = useCallback(async () => {
    if (maneuverRequestInFlightRef.current) return;
    maneuverRequestInFlightRef.current = true;
    try {
      const maneuverParams = new URLSearchParams({ mode: riskMode });
      if (riskMode === 'selected' && selectedObject?.id) {
        maneuverParams.set('object_id', selectedObject.id);
      }
      if (riskMode === 'demo') {
        maneuverParams.set('scenario', demoScenario);
      }
      const response = await fetch(`http://127.0.0.1:8000/maneuver-analysis?${maneuverParams.toString()}`);
      if (!response.ok) throw new Error('Maneuver analysis response was not successful');
      setManeuverAnalysis(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      maneuverRequestInFlightRef.current = false;
    }
  }, [riskMode, selectedObject, demoScenario]);

  const fetchAiValidation = useCallback(async () => {
    if (aiValidationRequestInFlightRef.current) return;
    aiValidationRequestInFlightRef.current = true;
    try {
      const aiParams = new URLSearchParams({ mode: riskMode });
      if (riskMode === 'selected' && selectedObject?.id) {
        aiParams.set('object_id', selectedObject.id);
      }
      if (riskMode === 'demo') {
        aiParams.set('scenario', demoScenario);
      }
      const response = await fetch(`http://127.0.0.1:8000/ai-validation?${aiParams.toString()}`);
      if (!response.ok) throw new Error('AI validation response was not successful');
      setAiValidation(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      aiValidationRequestInFlightRef.current = false;
    }
  }, [riskMode, selectedObject, demoScenario]);

  const fetchObjectAnalysis = useCallback(async () => {
    if (!selectedObject?.id) {
      setObjectAnalysis(null);
      return;
    }
    if (objectAnalysisRequestInFlightRef.current) return;
    objectAnalysisRequestInFlightRef.current = true;
    try {
      const params = new URLSearchParams({ object_id: selectedObject.id });
      const res = await fetch(`http://127.0.0.1:8000/object-bundle?${params.toString()}`);
      if (!res.ok) throw new Error('Object analysis response was not successful');
      const bundle = await res.json();
      if (!bundle.has_conjunction) {
        setObjectAnalysis({ has_conjunction: false });
        return;
      }
      setObjectAnalysis({
        has_conjunction: true,
        collision_probability: bundle.risk.collision_probability,
        miss_distance_km: bundle.risk.miss_distance_km,
        tca_time: bundle.risk.tca_time,
        delta_v_km_s: bundle.maneuver.required_delta_v_km_s,
        runtime_seconds: bundle.risk.runtime_seconds,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      objectAnalysisRequestInFlightRef.current = false;
    }
  }, [selectedObject]);

  useEffect(() => {
    fetchObjectAnalysis();
    if (!selectedObject?.id) return undefined;
    const objectPoll = setInterval(fetchObjectAnalysis, RISK_REFRESH_INTERVAL_MS);
    return () => clearInterval(objectPoll);
  }, [fetchObjectAnalysis, selectedObject]);

  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [fetchData]);

  useEffect(() => {
    fetchRiskAnalysis();
    const riskPoll = setInterval(fetchRiskAnalysis, RISK_REFRESH_INTERVAL_MS);
    return () => clearInterval(riskPoll);
  }, [fetchRiskAnalysis]);

  useEffect(() => {
    fetchManeuverAnalysis();
  }, [fetchManeuverAnalysis]);

  useEffect(() => {
    fetchAiValidation();
  }, [fetchAiValidation]);

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const counts = useMemo(() => {
    if (!data?.objects) return { satellite: 0, debris: 0 };
    return data.objects.reduce(
      (acc, object) => {
        acc[object.type === 'debris' ? 'debris' : 'satellite'] += 1;
        return acc;
      },
      { satellite: 0, debris: 0 }
    );
  }, [data]);

  const analysis = data?.analysis;
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return (data?.objects ?? [])
      .filter((object) => object.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, data]);

  const handleSearchSelect = useCallback((name) => {
    earthViewerRef.current?.focusObjectByName(name);
    setSearchQuery('');
    setSearchFocused(false);
  }, []);
  const displayedRisk = riskAnalysis?.has_conjunction === false ? null : riskAnalysis;
  const riskData = displayedRisk || (riskMode === 'live' ? analysis : null);
  const riskLevel = riskAnalysis?.has_conjunction === false
    ? 'NO MATCH'
    : displayedRisk?.risk_level
      || (analysis ? (analysis.miss_distance_km < 5 ? 'CRITICAL' : analysis.miss_distance_km < 250 ? 'ELEVATED' : 'LOW') : '—');
  const riskLevelClass = riskLevel === 'NO MATCH' ? 'low' : riskLevel.toLowerCase();
  const recommendedAction = maneuverAnalysis?.has_conjunction
    ? maneuverAnalysis.recommended_action
    : 'MONITOR';

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand-block">
          <span className="brand-orbit" aria-hidden="true">◌</span>
          <div>
            <h1>LEO AUTONOMOUS PLANNER</h1>
            <span className="brand-subtitle">CONJUNCTION OPERATIONS / LEO</span>
          </div>
          <span className="environment-badge">OPS / LEO</span>
        </div>
        <nav className="top-nav" aria-label="Primary navigation">
          <button className="nav-item active">Map</button>
          <button className="nav-item">Watchlist</button>
          <button className="nav-item">Analysis</button>
          <div className="more-menu-wrapper">
            <button className="nav-item" onClick={() => setMoreMenuOpen((value) => !value)}>More</button>
            {moreMenuOpen && (
              <div className="more-menu">
                <button type="button" onClick={() => recenterPanel('selected')}>Selected Object</button>
                <button type="button" onClick={() => recenterPanel('risk')}>Conjunction Risk</button>
                <button type="button" onClick={() => recenterPanel('queue')}>Conjunction Queue</button>
                <button type="button" onClick={() => recenterPanel('ai')}>AI vs Physics Validation</button>
                <button type="button" onClick={() => earthViewerRef.current?.openLegendPanel()}>Satellite Filter</button>
                <button type="button" onClick={() => earthViewerRef.current?.openCollisionWatch()}>Collision Watch</button>
                <button type="button" onClick={() => earthViewerRef.current?.openSelectorPanel()}>Selector</button>
              </div>
            )}
          </div>
        </nav>
        <div className="header-search">
          <input
            type="text"
            className="header-search-input"
            placeholder="Search satellites, debris…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {searchFocused && searchQuery.trim() && (
            <div className="header-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((object) => (
                  <button
                    key={object.name}
                    type="button"
                    className="header-search-result"
                    onMouseDown={() => handleSearchSelect(object.name)}
                  >
                    <span className={`result-dot ${object.type}`} />
                    {object.name}
                  </button>
                ))
              ) : (
                <div className="header-search-empty">No matches</div>
              )}
            </div>
          )}
        </div>
        <div className="header-right">
          <span className="live-indicator"><span className="live-dot" /> LIVE</span>
          <span className="object-count">{(data?.objects?.length ?? 0).toLocaleString()} objects</span>
          <span className="header-time">{lastUpdate ? `${lastUpdate} UTC` : 'SYNCING UTC'}</span>
          <span className="next-update">next in {countdown}s</span>
          <button className={`refresh-btn ${loading ? 'spinning' : ''}`} onClick={fetchData} disabled={loading}>
            {loading ? 'Syncing' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <main className="map-stage">
        <EarthViewer
                       ref={earthViewerRef}
          objects={data?.objects}
          collisions={data?.collisions}
          onObjectClick={setSelectedObject}
          isExpanded
          tcaMarker={displayedRisk?.tca_refined ? displayedRisk : null}
          avoidancePath={maneuverAnalysis?.has_conjunction && maneuverAnalysis.required_delta_v_km_s > 0 ? maneuverAnalysis.avoidance_trajectory : null}
        />
      </main>

                         {!selectedHidden && (
          <section
            className={`floating-panel selected-object-panel glass-surface ${selectedCollapsed ? 'is-collapsed' : ''} ${selectedPanel.dragging ? 'is-dragging' : ''} ${selectedCollapsed && selectedMinimizeZone !== 'default' ? `docked-${selectedMinimizeZone}` : ''}`}
            style={selectedCollapsed && selectedMinimizeZone !== 'default'
              ? getDockedStyle(selectedMinimizeZone, selectedPanel.position)
              : { left: `${selectedPanel.position.x}px`, top: `${selectedPanel.position.y}px` }}
            aria-label="Selected object panel"
              >
                   {selectedHidden ? null : selectedCollapsed ? (
                     <button className="collapsed-panel-button" onPointerDown={(event) => selectedDockedDrag(event, () => setSelectedCollapsed(false))} title="Expand selected object panel">
                       <span className="panel-icon">⌁</span>
                       {selectedMinimizeZone === 'bottom'
                         ? <span className="collapsed-panel-label">Selected Object</span>
                         : <span className="collapsed-status-dot" />}
                     </button>
                   ) : (
                     <>
                       <div className="floating-panel-header" onPointerDown={selectedPanel.handlePointerDown}>
                         <span className="drag-grip" aria-hidden="true">⠿</span>
                         <div>
                           <span className="eyebrow">SELECTED OBJECT</span>
                         </div>
                         <button
                           className="panel-icon-button"
                           onClick={() => {
                             setSelectedMinimizeZone(getEdgeZone(selectedPanel.position.x, selectedPanel.position.y, 294, 560));
                             setSelectedCollapsed(true);
                           }}
                           title="Minimize"
                         >−</button>
                         <button className="panel-icon-button panel-close-button" onClick={() => setSelectedHidden(true)} title="Close">✕</button>
                       </div>
            <div className="selected-object-content">
              <div className="object-identity">
                <span className="object-avatar">{selectedObject ? '✦' : '⌖'}</span>
                <div>
                  <h2>{selectedObject?.id ?? 'No object selected'}</h2>
                  {selectedObject ? (
                    <span className={`type-badge ${selectedObject.type === 'debris' ? 'debris' : 'satellite'}`}>{selectedObject.type}</span>
                  ) : (
                    <span className="panel-context">CLICK A MAP OBJECT TO FOCUS</span>
                  )}
                </div>
              </div>
              <div className="telemetry-list">
                          <div className="telemetry-row"><span>Collision probability</span><strong>{objectAnalysis?.has_conjunction ? `${(objectAnalysis.collision_probability * 100).toFixed(2)}%` : selectedObject ? 'No active conjunction' : '—'}</strong></div>
                          <div className="telemetry-row"><span>Miss distance</span><strong>{objectAnalysis?.has_conjunction ? `${objectAnalysis.miss_distance_km.toFixed(2)} km` : '—'}</strong></div>
                          <div className="telemetry-row"><span>Required delta-v</span><strong>{objectAnalysis?.has_conjunction && objectAnalysis.delta_v_km_s != null ? `${objectAnalysis.delta_v_km_s.toFixed(4)} km/s` : '—'}</strong></div>
                          <div className="telemetry-row"><span>TCA</span><strong>{objectAnalysis?.has_conjunction ? objectAnalysis.tca_time : '—'}</strong></div>
                          <div className="telemetry-row"><span>Altitude</span><strong>{selectedObject ? `${selectedObject.altitude} km` : '—'}</strong></div>
                          <div className="telemetry-row"><span>Velocity</span><strong>{selectedObject ? `${selectedObject.velocity} km/s` : '—'}</strong></div>
                          <div className="telemetry-row"><span>Propagation runtime</span><strong>{objectAnalysis?.has_conjunction && objectAnalysis.runtime_seconds != null ? `${objectAnalysis.runtime_seconds.toFixed(4)} s` : '—'}</strong></div>
              </div>
              <div className="tracked-summary">
                <div><strong>{counts.satellite.toLocaleString()}</strong><span>Satellites</span></div>
                <div><strong>{counts.debris.toLocaleString()}</strong><span>Debris</span></div>
              </div>
            </div>
          </>
        )}
      </section>
                         )}
                              {!riskHidden && (
          <section
            className={`floating-panel risk-panel glass-surface ${riskCollapsed ? 'is-collapsed' : ''} ${riskPanel.dragging ? 'is-dragging' : ''} ${riskCollapsed && riskMinimizeZone !== 'default' ? `docked-${riskMinimizeZone}` : ''}`}
            style={riskCollapsed && riskMinimizeZone !== 'default'
              ? getDockedStyle(riskMinimizeZone, riskPanel.position)
              : { left: `${riskPanel.position.x}px`, top: `${riskPanel.position.y}px` }}
            aria-label="Conjunction risk panel"
          >
                 {riskHidden ? null : riskCollapsed ? (
                                                  <button className="collapsed-panel-button risk-collapsed-button" onPointerDown={(event) => riskDockedDrag(event, () => setRiskCollapsed(false))} title="Expand conjunction risk panel">
                     <span className="panel-icon">!</span>
                     {riskMinimizeZone === 'bottom'
                       ? <span className="collapsed-panel-label">Conjunction Risk</span>
                       : <span className={`risk-status-dot ${riskLevelClass}`} />}
                   </button>
                 ) : (
                   <>
                     <div className="floating-panel-header" onPointerDown={riskPanel.handlePointerDown}>
                       <span className="drag-grip" aria-hidden="true">⠿</span>
                       <div><span className="eyebrow">CONJUNCTION RISK</span></div>
                       <button
                         className="panel-icon-button"
                         onClick={() => {
                           setRiskMinimizeZone(getEdgeZone(riskPanel.position.x, riskPanel.position.y, 380, 560));
                           setRiskCollapsed(true);
                         }}
                         title="Minimize"
                       >−</button>
                                       <button
                                             type="button"
                                             className="panel-icon-button panel-close-button"
                                             onPointerDown={(event) => event.stopPropagation()}
                                             onClick={() => setRiskHidden(true)}
                                             title="Close conjunction risk panel"
                                       >✕</button>
                 </div>
            <div className="risk-content">
                       <div className="risk-mode-switch" role="group" aria-label="Risk analysis mode">
                         <button type="button" className={riskMode === 'live' ? 'active' : ''} onClick={() => setRiskMode('live')} aria-pressed={riskMode === 'live'}>LIVE</button>
                         <button type="button" className={riskMode === 'selected' ? 'active' : ''} onClick={() => setRiskMode('selected')} aria-pressed={riskMode === 'selected'}>SELECTED</button>
                         <button type="button" className={riskMode === 'demo' ? 'active' : ''} onClick={() => setRiskMode('demo')} aria-pressed={riskMode === 'demo'}>DEMO</button>
                       </div>
                       {riskMode === 'demo' && (
                         <label className="scenario-picker">
                           <span>SCENARIO</span>
                           <select value={demoScenario} onChange={(event) => setDemoScenario(event.target.value)}>
                             <option value="safe">Safe</option>
                             <option value="warning">Warning</option>
                             <option value="critical">Critical</option>
                           </select>
                         </label>
                       )}
                       {riskMode === 'selected' && !selectedObject && (
                         <p className="risk-empty-state">Select a satellite or debris object on the map first.</p>
                       )}
                       {riskMode === 'selected' && riskAnalysis?.has_conjunction === false && (
                         <p className="risk-empty-state">{riskAnalysis.message}</p>
                       )}

              <div className="risk-headline"><span className={`risk-symbol ${riskLevelClass}`}>!</span><strong>{riskLevel}</strong><span className={`action-badge ${recommendedAction === 'MONITOR' ? 'monitor' : 'execute'}`}>{recommendedAction}</span></div> 
{maneuverAnalysis?.has_conjunction && maneuverAnalysis.required_delta_v_km_s > 0 && (
                         <div className="maneuver-plan">
                           <div className="telemetry-row"><span>Burn type</span><strong>{maneuverAnalysis.burn_type}</strong></div>
                           <div className="telemetry-row"><span>Required delta-v</span><strong>{maneuverAnalysis.required_delta_v_km_s.toFixed(5)} km/s</strong></div>
                           <div className="telemetry-row"><span>Burn in</span><strong>{Math.round(maneuverAnalysis.burn_time_s_from_now)} s</strong></div>
                           <div className="telemetry-row"><span>Fuel used</span><strong>{(maneuverAnalysis.fuel_used_kg * 1000).toFixed(2)} g</strong></div>
                           <div className="telemetry-row"><span>Post-burn miss distance</span><strong>{maneuverAnalysis.simulated_miss_distance_km.toFixed(2)} km</strong></div>
                           <div className="telemetry-row"><span>Risk reduction</span><strong>{maneuverAnalysis.risk_reduction_percent}%</strong></div>
                           {!maneuverAnalysis.feasible && (
                             <p className="maneuver-warning">Best available option — couldn't fully reach the {maneuverAnalysis.separation_target_km} km target in time.</p>
                           )}
                         </div>
                       )}
                       {aiValidation?.has_conjunction && (
                         <button type="button" className="ai-validation-toggle" onClick={() => setAiPanelOpen((value) => !value)}>
                           {aiPanelOpen ? 'Hide' : 'Show'} AI vs Physics Validation
                         </button>
                       )}                                   
                       <div className="risk-metrics">
                                   <div><span>Probability</span><strong>{riskData ? `${(riskData.collision_probability * 100).toFixed(2)}%` : '—'}</strong></div>
                                   <div><span>TCA</span><strong>{riskData?.tca_time ?? '—'}</strong></div>
                                   <div><span>Miss distance</span><strong>{riskData ? `${riskData.miss_distance_km.toFixed(2)} km` : '—'}</strong></div>
                       </div>
                                                     {displayedRisk && (
                                                       <div className="advanced-risk-card">
                                                         <div className="advanced-risk-heading"><span>{displayedRisk.source}</span><strong>{displayedRisk.risk_level}</strong></div>
                                                         <div className="advanced-risk-grid">
                                                           <div><span>Alfano Pc</span><strong>{`${(displayedRisk.collision_probability * 100).toExponential(2)}%`}</strong></div>
                                                           <div><span>Confidence</span><strong>{`${(displayedRisk.confidence_metric * 100).toFixed(1)}%`}</strong></div>
                                                           <div><span>Radial offset</span><strong>{`${displayedRisk.relative_position_rtn_km[0].toFixed(2)} km`}</strong></div>
                                                           <div><span>Hard-body radius</span><strong>{`${displayedRisk.hard_body_radius_m} m`}</strong></div>
                                                         </div>
                                                         {displayedRisk.tca_refined && (
                                                           <div className="advanced-risk-grid">
                                                             <div><span>TCA countdown</span><strong>{formatTcaCountdown(displayedRisk.tca_offset_from_now_s)}</strong></div>
                                                             <div><span>Refined min. distance</span><strong>{`${displayedRisk.tca_refined_min_distance_km.toFixed(2)} km`}</strong></div>
                                                             <div><span>Screening window</span><strong>{`±${displayedRisk.tca_search_window_s.toFixed(0)}s`}</strong></div>
                                                           </div>
                                                         )}
                                                         <p>{displayedRisk.input_basis}</p>
                                                       </div>
                                                     )}
                                        <p className="risk-explanation">{displayedRisk ? `Risk source: ${displayedRisk.source}.` : riskMode === 'selected' ? 'Select an object with an active conjunction to analyze it.' : 'Waiting for the first backend analysis result.'}</p>
                       <div className="analysis-state"><span>Analysis status</span><strong>{riskData ? 'COMPLETE' : 'AWAITING DATA'}</strong></div>

              <button className="analysis-button" onClick={() => setQueueOpen(true)}>Open analysis <span aria-hidden="true">↗</span></button>
            </div>
          </>
        )}
      </section>
                                )}

      {error && <div className="error-toast glass-surface">Backend unavailable: {error}</div>}

      <div className="map-status-pill glass-surface"><span className="live-dot" /> MAP LIVE <span className="status-divider" /> {loading ? 'UPDATING OBJECTS' : 'PROPAGATION READY'}</div>
       
          {!queueHidden && (
               <section
                 className={`conjunction-queue glass-surface ${queueOpen ? 'is-open' : 'is-closed'}`}
                 aria-label="Conjunction queue"
                 onClick={() => { if (!queueOpen) setQueueOpen(true); }}
               >
                         <div className="queue-header">
                           <span className="queue-title"><span className="queue-icon">≡</span> CONJUNCTION QUEUE <span className="alert-count">{alerts.length}</span></span>
                           <div className="queue-header-actions">
                             {queueOpen && (
                               <button type="button" className="panel-icon-button" onClick={(event) => { event.stopPropagation(); setQueueOpen(false); }} title="Minimize">−</button>
                             )}
                             <button type="button" className="panel-icon-button panel-close-button" onClick={(event) => { event.stopPropagation(); setQueueHidden(true); }} title="Close">✕</button>
                           </div>
                         </div>
        {queueOpen && (
          <div className="queue-body">
            {alerts.slice(0, 5).map((alert) => {
              const severity = severityOf(alert.distance);
              return (
                <div className="queue-row" key={alert.id}>
                  <span className={`severity-label ${severity}`}><span className="severity-dot" />{severity}</span>
                  <span className="queue-pair">{alert.sat1} <small>×</small> {alert.sat2}</span>
                  <span>—</span>
                  <strong className={severity}>{analysis ? `${(analysis.collision_probability * 100).toFixed(2)}%` : '—'}</strong>
                  <strong className={severity}>{Number(alert.distance ?? 0).toFixed(2)} km</strong>
                  <button
                    type="button"
                    className={`queue-action ${severity} ${activeQueueAlertId === alert.id ? 'is-active' : ''}`}
                    onClick={() => {
                      if (activeQueueAlertId === alert.id) {
                        earthViewerRef.current?.clearRiskHighlight();
                        setActiveQueueAlertId(null);
                      } else {
                        earthViewerRef.current?.focusOnPair(alert.sat1, alert.sat2);
                        setActiveQueueAlertId(alert.id);
                      }
                    }}
                  >
                    {severity === 'critical' ? 'REVIEW' : 'MONITOR'}
                  </button>
                </div>
              );
            })}
            {!alerts.length && <div className="queue-empty">No active conjunction alerts.</div>}
          </div>
        )}
      </section>
      )}
                   {aiPanelOpen && aiValidation?.has_conjunction && aiCollapsed && (
                     <button
                       className={`collapsed-panel-button ${aiMinimizeZone !== 'default' ? `docked-${aiMinimizeZone}` : ''}`}
                                                          onPointerDown={moveAiPanel}
                       style={{
                         position: 'absolute',
                         ...(aiMinimizeZone !== 'default'
                           ? getDockedStyle(aiMinimizeZone, aiPanelPosition)
                           : { left: `${aiPanelPosition.x}px`, top: `${aiPanelPosition.y}px` }),
                       }}
                       onPointerDown={(event) => aiDockedDrag(event, () => setAiCollapsed(false))}
                       title="Expand AI validation panel"
                     >
                       <span className="panel-icon">✦</span>
                       {aiMinimizeZone === 'bottom' && <span className="collapsed-panel-label">AI Validation</span>}
                     </button>
                   )}
            {aiPanelOpen && aiValidation?.has_conjunction && !aiCollapsed && (
              <div
                className="globe-overlay-panel glass-surface ai-validation-floating"
                style={{ left: `${aiPanelPosition.x}px`, top: `${aiPanelPosition.y}px` }}
              >
                <div className="ai-validation-floating-header" onPointerDown={moveAiPanel}>
                  <span className="drag-grip" aria-hidden="true">⠿</span>
                  <h4>AI vs Physics Validation</h4>
                            <button
                              type="button"
                              className="panel-icon-button"
                                                                           onPointerDown={(event) => event.stopPropagation()}
                              onClick={() => {
                                setAiMinimizeZone(getEdgeZone(aiPanelPosition.x, aiPanelPosition.y, 380, 440));
                                setAiCollapsed(true);
                               }}
                              title="Minimize"
                            >−</button>
                  <button type="button" className="ai-validation-close" onClick={() => setAiPanelOpen(false)}>✕</button>
                </div>
    
              <div className="telemetry-row">
                <span>Analytical Pc</span>
                <strong>{aiValidation.monte_carlo.analytical_pc.toExponential(2)}</strong>
              </div>
              <div className="telemetry-row">
                <span>Monte Carlo Pc ({aiValidation.monte_carlo.samples} samples)</span>
                <strong>{aiValidation.monte_carlo.monte_carlo_pc.toExponential(2)}</strong>
              </div>
              <div className="telemetry-row">
                <span>Cross-check agreement</span>
                <strong>{(100 - Math.min(aiValidation.monte_carlo.relative_error, 1) * 100).toFixed(1)}%</strong>
              </div>

              <div className="telemetry-row">
                <span>Physics self-consistency</span>
                <strong className={aiValidation.physics_consistency.consistent ? 'ok' : 'warn'}>
                  {aiValidation.physics_consistency.consistent ? 'CONSISTENT' : 'RESIDUAL DETECTED'}
                </strong>
              </div>
    
              <div className="telemetry-row">
                <span>Physics delta-v</span>
                <strong>{aiValidation.ai_vs_physics.physics_required_delta_v_km_s.toFixed(5)} km/s</strong>
              </div>
              <div className="telemetry-row">
                <span>AI-predicted delta-v</span>
                <strong>{aiValidation.ai_vs_physics.ai_predicted_delta_v_km_s.toFixed(5)} km/s</strong>
              </div>
              <div className="telemetry-row">
                <span>AI decision</span>
                <strong className={aiValidation.ai_vs_physics.agreement ? 'ok' : 'warn'}>
                  {aiValidation.ai_vs_physics.ai_recommends_burn ? 'BURN' : 'NO BURN'}
                  {' '}({(aiValidation.ai_vs_physics.ai_recommends_burn
                    ? aiValidation.ai_vs_physics.ai_confidence
                    : 1 - aiValidation.ai_vs_physics.ai_confidence
                  ) * 100 | 0}% confident)
                </strong>
              </div>
                       {!aiValidation.ai_vs_physics.agreement && (
                         <p className="maneuver-warning">AI and physics disagree on whether a burn is needed here.</p>
                       )}
         
                       {aiValidation.monte_carlo.confidence_interval_95 && (
                         <div className="telemetry-row">
                           <span>Monte Carlo 95% CI</span>
                           <strong>
                             {aiValidation.monte_carlo.confidence_interval_95[0].toExponential(2)}
                             {' – '}
                             {aiValidation.monte_carlo.confidence_interval_95[1].toExponential(2)}
                           </strong>
                         </div>
                       )}
         
                       {aiValidation.monte_carlo.distance_histogram && (
                         <div className="monte-carlo-histogram">
                           <div className="monte-carlo-histogram-title">Sampled miss-distance distribution</div>
                           <div className="monte-carlo-histogram-bars">
                             {aiValidation.monte_carlo.distance_histogram.counts.map((count, index) => {
                               const counts = aiValidation.monte_carlo.distance_histogram.counts;
                               const maxCount = Math.max(...counts, 1);
                               const heightPct = (count / maxCount) * 100;
                               const binStart = aiValidation.monte_carlo.distance_histogram.bin_edges_km[index];
                               const binEnd = aiValidation.monte_carlo.distance_histogram.bin_edges_km[index + 1];
                               return (
                                 <div
                                   key={index}
                                   className="monte-carlo-bar"
                                   style={{ height: `${count > 0 ? Math.max(heightPct, 2) : 0}%` }}
                                   title={`${binStart.toFixed(3)}–${binEnd.toFixed(3)} km: ${count} samples`}
                                 />
                               );
                             })}
                           </div>
                           <div className="monte-carlo-histogram-axis">
                             <span>0 km</span>
                             <span>{aiValidation.monte_carlo.distance_histogram.bin_edges_km[aiValidation.monte_carlo.distance_histogram.bin_edges_km.length - 1].toFixed(2)} km</span>
                           </div>
                         </div>
                       )}
                     </div>
          )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dashboardAPI } from '../../utils/api-enhanced';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const createIcon = (status, priority) => {
  const colors = {
    PENDING_VERIFICATION: '#EAB308',
    verified: '#3B82F6',
    in_progress: '#8B5CF6',
    resolved: '#10B981',
    rejected: '#EF4444',
  };

  const prioritySize = {
    urgent: 32,
    high: 28,
    medium: 24,
    low: 20,
  };

  const color = colors[status] || '#6B7280';
  const size = prioritySize[priority] || 24;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        color: white;
        font-weight: bold;
      ">
        !
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const MonitoringMap = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    incident_type: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Default center (Manila, Philippines)
  const defaultCenter = [14.5995, 120.9842];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardAPI.getMapData(filters);
      setIncidents(data.incidents || []);
    } catch (err) {
      setError(err.message || 'Failed to load map data');
      console.error('Map data error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const filteredIncidents = incidents.filter((incident) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      incident.title?.toLowerCase().includes(search) ||
      incident.location?.toLowerCase().includes(search)
    );
  });

  const handleMarkerClick = (incident) => {
    setSelectedIncident(incident);
    setMapCenter([incident.latitude, incident.longitude]);
  };

  const clearFilters = () => {
    setFilters({ status: null, incident_type: null });
    setSearchTerm('');
  };

  // Map bounds updater
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (mapCenter) {
        map.setView(mapCenter, map.getZoom());
      }
    }, [map]);
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Incident Monitoring Map</h1>
            <p className="text-sm text-gray-600 mt-1">
              {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} displayed
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                showFilters
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchMapData}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="verified">Verified</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                <select
                  value={filters.incident_type || ''}
                  onChange={(e) => setFilters({ ...filters, incident_type: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="bite">Bite</option>
                  <option value="stray">Stray</option>
                  <option value="injured">Injured</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Error Display */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-red-900 hover:text-red-700">×</button>
          </div>
        )}
        
        {/* Selected Incident Details */}
        {selectedIncident && (
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{selectedIncident.title}</h3>
              <button 
                onClick={() => setSelectedIncident(null)} 
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Location:</strong> {selectedIncident.location}</p>
              <p><strong>Type:</strong> {selectedIncident.incident_type}</p>
              <p><strong>Priority:</strong> <span className={getPriorityColor(selectedIncident.priority)}>{selectedIncident.priority}</span></p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedIncident.status)}`}>{selectedIncident.status.replace('_', ' ')}</span></p>
              <p><strong>Date:</strong> {new Date(selectedIncident.incident_date).toLocaleDateString()}</p>
              {selectedIncident.description && (
                <p><strong>Description:</strong> {selectedIncident.description}</p>
              )}
            </div>
          </div>
        )}
        
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater />

          <MarkerClusterGroup chunkedLoading>
            {filteredIncidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createIcon(incident.status, incident.priority)}
                eventHandlers={{
                  click: () => handleMarkerClick(incident),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-bold text-lg mb-2">{incident.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Location:</strong> {incident.location}</p>
                      <p><strong>Type:</strong> {incident.incident_type}</p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.status)}`}>
                          {incident.status.replace('_', ' ')}
                        </span>
                      </p>
                      <p>
                        <strong>Priority:</strong>{' '}
                        <span className={`font-semibold ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </p>
                      <p><strong>Date:</strong> {new Date(incident.incident_date).toLocaleDateString()}</p>
                      {incident.patrol_status && (
                        <p><strong>Patrol:</strong> {incident.patrol_status}</p>
                      )}
                    </div>
                    <button
                      onClick={() => window.location.href = `/incidents/${incident.id}`}
                      className="mt-3 w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
          <h3 className="font-bold text-sm mb-2">Legend</h3>
          <div className="space-y-2 text-xs">
            <LegendItem color="#EAB308" label="Pending Verification" />
            <LegendItem color="#3B82F6" label="Verified" />
            <LegendItem color="#8B5CF6" label="In Progress" />
            <LegendItem color="#10B981" label="Resolved" />
            <LegendItem color="#EF4444" label="Rejected" />
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Marker size</strong> indicates priority
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div
      className="w-4 h-4 rounded-full border-2 border-white shadow"
      style={{ backgroundColor: color }}
    />
    <span>{label}</span>
  </div>
);

// Helper Functions
const getStatusColor = (status) => {
  const colors = {
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority) => {
  const colors = {
    urgent: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-gray-600',
  };
  return colors[priority] || 'text-gray-600';
};

export default MonitoringMap;

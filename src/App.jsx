// App.jsx — single-file app (Supabase + React + Vite)

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, FileText, Home, Zap, AlertCircle, Loader, ChevronDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- US states list ---
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// --- Workflow steps ---
const statusSteps = [
  { key: 'site_selection', label: 'Site Selection', icon: Home, timestamp: 'created_at' },
  { key: 'submitted', label: 'Application Submitted', icon: FileText, timestamp: 'submitted_at' },
  { key: 'agreement_approved', label: 'Agreement Approved', icon: CheckCircle, timestamp: 'agreement_approved_at' },
  { key: 'construction', label: 'Construction & Installation', icon: Zap, timestamp: 'construction_started_at' },
  { key: 'complete', label: 'Complete', icon: CheckCircle, timestamp: 'completed_at' }
];

// --- Example of notes per status ---
const STATUS_NOTES = {
  site_selection: 'Customer site survey scheduled with engineering team.',
  submitted: 'Application has been submitted and is pending utility review.',
  agreement_approved: 'Interconnection agreement approved — awaiting construction scheduling.',
  construction: 'Field technicians scheduled for witness test.',
  complete: 'System successfully interconnected to the grid.'
};

const StatusTimeline = ({ application, onDateChange }) => {
  const currentStepIndex = statusSteps.findIndex(step => step.key === application.status);

  const handleDateChange = (stepKey, newDate) => {
    const timestampField = statusSteps.find(s => s.key === stepKey)?.timestamp;
    if (timestampField && newDate) {
      onDateChange(application.ix_application_id, timestampField, newDate);
    }
  };

  const defaultNote = STATUS_NOTES[application.status] || null;
  const noteText = (application.notes && application.notes.trim().length > 0)
    ? application.notes
    : defaultNote;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const timestamp = application[step.timestamp];

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {index < statusSteps.length - 1 && (
                <div className={`absolute top-6 left-1/2 w-full h-0.5 ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} style={{ zIndex: 0 }} />
              )}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                isComplete ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                <Icon size={24} />
              </div>

              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                  Step {index + 1}
                </div>
                <div className="text-xs text-gray-600 max-w-24">{step.label}</div>
                {(isComplete || isCurrent) && (
                  <input
                    type="date"
                    value={timestamp ? new Date(timestamp).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange(step.key, e.target.value)}
                    className="text-xs mt-1 px-1 py-0.5 border border-gray-300 rounded"
                    style={{ fontSize: '10px' }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Clock className="text-blue-600 mr-2 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-900">Current Status: {statusSteps[currentStepIndex]?.label}</p>
            {noteText && (
              <p className="text-sm text-blue-700 mt-1">{noteText}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, onStatusChange, onDelete, onDateChange, isAdmin }) => {
  const [collapsed, setCollapsed] = useState(false);

  const canAdvance = isAdmin && application.status !== 'complete' && application.status !== 'withdrawn';

  const advanceStatus = () => {
    const currentIndex = statusSteps.findIndex(s => s.key === application.status);
    if (currentIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentIndex + 1].key;
      onStatusChange(application.ix_application_id, nextStatus);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      onDelete(application.ix_application_id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-black p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Application #{application.ix_application_id.substring(0, 8)}</h3>
          <p className="text-sm text-gray-600">
            {application.premise?.street_address}, {application.premise?.city}, {application.premise?.state}
          </p>
          {application.customer?.full_name && (
            <p className="text-sm text-gray-600 mt-1">Applicant: {application.customer?.full_name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            application.status === 'complete' ? 'bg-green-100 text-green-800' :
            application.status === 'withdrawn' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {application.status.replace('_', ' ').toUpperCase()}
          </div>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronDown size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-600">System Size</p>
              <p className="font-medium">{application.system?.system_size_kw} kW</p>
            </div>
            <div>
              <p className="text-gray-600">Installer</p>
              <p className="font-medium">{application.installer?.company_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Panels</p>
              <p className="font-medium">{application.system?.panel_manufacturer}</p>
            </div>
            <div>
              <p className="text-gray-600">Inverter</p>
              <p className="font-medium">{application.system?.inverter_manufacturer}</p>
            </div>
          </div>

          <StatusTimeline application={application} onDateChange={onDateChange} />

          <div className="flex gap-3 mt-4 items-center">
            {canAdvance && (
              <button
                onClick={advanceStatus}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Advance to Next Stage
              </button>
            )}
            <button onClick={handleDelete} className="text-red-600 hover:text-red-800 font-medium transition-colors">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const NewApplicationForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    street_address: '',
    city: '',
    state: '', // empty so user must pick; avoids forced CA
    zip_code: '',
    system_size_kw: '',
    panel_manufacturer: '',
    inverter_manufacturer: '',
    installer_company: ''
  });

  const generateRandomData = () => {
    const firstNames = ['Alex','Jordan','Taylor','Riley','Casey','Avery','Parker','Drew','Jamie','Morgan','Quinn','Reese'];
    const lastNames  = ['Smith','Johnson','Lee','Brown','Garcia','Davis','Miller','Wilson','Anderson','Thomas','Moore','Martin'];

    const addresses = [
      '123 Maple Street', '456 Oak Avenue', '789 Pine Drive', '321 Elm Boulevard',
      '654 Cedar Lane', '987 Birch Road', '147 Spruce Court', '258 Willow Way',
      '369 Aspen Circle', '741 Redwood Terrace', '852 Hickory Place', '963 Poplar Drive'
    ];

    const cities = [
      { city: 'San Francisco', state: 'CA', zip: '94102' },
      { city: 'Los Angeles', state: 'CA', zip: '90001' },
      { city: 'Austin', state: 'TX', zip: '73301' },
      { city: 'Denver', state: 'CO', zip: '80202' },
      { city: 'Phoenix', state: 'AZ', zip: '85001' },
      { city: 'Seattle', state: 'WA', zip: '98101' },
      { city: 'Portland', state: 'OR', zip: '97201' },
      { city: 'Boston', state: 'MA', zip: '02101' },
      { city: 'Miami', state: 'FL', zip: '33101' },
      { city: 'Atlanta', state: 'GA', zip: '30301' },
      { city: 'Chicago', state: 'IL', zip: '60601' },
      { city: 'New York', state: 'NY', zip: '10001' }
    ];

    const panelManufacturers = [
      'Canadian Solar', 'SunPower', 'LG Solar', 'Tesla Energy', 'Jinko Solar', 'Trina Solar', 'Q CELLS', 'REC Solar',
      'Panasonic', 'JA Solar', 'Longi Solar', 'First Solar'
    ];

    const inverterManufacturers = [
      'Enphase', 'SolarEdge', 'Tesla Powerwall', 'SMA', 'Fronius', 'Generac', 'Solaria', 'APsystems', 'Huawei', 'Delta', 'GoodWe', 'SunGrow'
    ];

    const installerNames = [
      'SolarGood LLC', 'SuperSolar LLC', 'BrightEnergy Solutions', 'SunPro Installers', 'GreenTech Solar', 'PowerUp Solar Co',
      'EcoSolar Systems', 'SolarWorks LLC', 'SunRise Energy', 'CleanPower Installers', 'BlueSky Solar', 'SolarFirst LLC'
    ];

    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomLocation = cities[Math.floor(Math.random() * cities.length)];
    const randomSystemSize = (Math.random() * (40 - 2) + 2).toFixed(1);
    const randomPanel = panelManufacturers[Math.floor(Math.random() * panelManufacturers.length)];
    const randomInverter = inverterManufacturers[Math.floor(Math.random() * inverterManufacturers.length)];
    const randomInstaller = installerNames[Math.floor(Math.random() * installerNames.length)];

    setFormData({
      first_name: randomFirst,
      last_name: randomLast,
      street_address: randomAddress,
      city: randomLocation.city,
      state: randomLocation.state,
      zip_code: randomLocation.zip,
      system_size_kw: randomSystemSize,
      panel_manufacturer: randomPanel,
      inverter_manufacturer: randomInverter,
      installer_company: randomInstaller
    });
  };

  const handleSubmit = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.street_address ||
      !formData.city ||
      !formData.state ||
      !formData.zip_code ||
      !formData.system_size_kw ||
      !formData.panel_manufacturer ||
      !formData.inverter_manufacturer ||
      !formData.installer_company
    ) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-black p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">New Interconnection Application</h3>
        <button onClick={generateRandomData} className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm">
          Generate Random Data
        </button>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-medium text-gray-900 mb-3">Applicant</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              className="px-3 py-2 border rounded-lg"
              value={formData.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last name"
              className="px-3 py-2 border rounded-lg"
              value={formData.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-gray-900 mb-3">Installation Location (Step 1: Site Selection)</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street Address"
              className="col-span-2 px-3 py-2 border rounded-lg"
              value={formData.street_address}
              onChange={e => setFormData({ ...formData, street_address: e.target.value })}
            />
            <input
              type="text"
              placeholder="City"
              className="px-3 py-2 border rounded-lg"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
            <select
              className="px-3 py-2 border rounded-lg"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
            >
              <option value="" disabled>Choose state</option>
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="ZIP Code"
              className="px-3 py-2 border rounded-lg"
              value={formData.zip_code}
              onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
              inputMode="numeric"
              pattern="\\d{5}(-\\d{4})?"
            />
          </div>
        </div>

        <div className="border-b pb-4">
          <h4 className="font-medium text-gray-900 mb-3">Solar System Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.1"
              placeholder="System Size (kW)"
              className="px-3 py-2 border rounded-lg"
              value={formData.system_size_kw}
              onChange={e => setFormData({ ...formData, system_size_kw: e.target.value })}
            />
            <input
              type="text"
              placeholder="Panel Manufacturer"
              className="px-3 py-2 border rounded-lg"
              value={formData.panel_manufacturer}
              onChange={e => setFormData({ ...formData, panel_manufacturer: e.target.value })}
            />
            <input
              type="text"
              placeholder="Inverter Manufacturer"
              className="col-span-2 px-3 py-2 border rounded-lg"
              value={formData.inverter_manufacturer}
              onChange={e => setFormData({ ...formData, inverter_manufacturer: e.target.value })}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Installer Information</h4>
          <input
            type="text"
            placeholder="Installer Company Name"
            className="w-full px-3 py-2 border rounded-lg"
            value={formData.installer_company}
            onChange={e => setFormData({ ...formData, installer_company: e.target.value })}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Submit Application
          </button>
          <button onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [applications, setApplications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interconnection_application')
        .select(`
          *,
          customer!inner (
            cust_id,
            account (
              full_name,
              email
            ),
            premise (
              street_address,
              city,
              state,
              zip_code
            )
          ),
          installer:interconnection_installer (*),
          system:interconnection_system (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data ?? []).map(app => ({
        ...app,
        premise: app.customer?.premise,
        customer: app.customer?.account
      }));

      setApplications(formattedData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const timestampField = statusSteps.find(s => s.key === newStatus)?.timestamp;

      // for demo purprose, always set notes to the default for the new status when progressing
      const nextNotes = STATUS_NOTES[newStatus] || null;

      const { error } = await supabase
        .from('interconnection_application')
        .update({
          status: newStatus,
          [timestampField]: new Date().toISOString(),
          notes: nextNotes
        })
        .eq('ix_application_id', appId);

      if (error) throw error;

      await fetchApplications();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteApplication = async (appId) => {
    try {
      const { data: app, error: fetchError } = await supabase
        .from('interconnection_application')
        .select('cust_id, ix_installer_id, ix_system_id, customer!inner(prem_id)')
        .eq('ix_application_id', appId)
        .single();
      if (fetchError) throw fetchError;

      const { error: appError } = await supabase
        .from('interconnection_application')
        .delete()
        .eq('ix_application_id', appId);
      if (appError) throw appError;

      if (app.ix_system_id) {
        await supabase.from('interconnection_system').delete().eq('ix_system_id', app.ix_system_id);
      }
      if (app.ix_installer_id) {
        await supabase.from('interconnection_installer').delete().eq('ix_installer_id', app.ix_installer_id);
      }
      if (app.customer?.prem_id) {
        await supabase.from('premise').delete().eq('prem_id', app.customer.prem_id);
      }
      if (app.cust_id) {
        await supabase.from('customer').delete().eq('cust_id', app.cust_id);
      }

      await fetchApplications();
    } catch (err) {
      alert('Error deleting application: ' + err.message);
    }
  };

  const handleDateChange = async (appId, timestampField, newDate) => {
    try {
      const isoDate = new Date(newDate).toISOString();
      const { error } = await supabase
        .from('interconnection_application')
        .update({ [timestampField]: isoDate })
        .eq('ix_application_id', appId);
      if (error) throw error;
      await fetchApplications();
    } catch (err) {
      alert('Error updating date: ' + err.message);
    }
  };

  const handleNewApplication = async (formData) => {
    try {
      // Create new account for this application
      const { data: account, error: accountError } = await supabase
        .from('account')
        .insert({
          email: `customer${Date.now()}@example.com`,
          full_name: `${formData.first_name} ${formData.last_name}`,
          phone: '555-0100'
        })
        .select()
        .single();
      if (accountError) throw accountError;

      // Create new premise
      const { data: premise, error: premiseError } = await supabase
        .from('premise')
        .insert({
          street_address: formData.street_address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code
        })
        .select()
        .single();
      if (premiseError) throw premiseError;

      // Create new customer linked to new account and premise
      const { data: customer, error: customerError } = await supabase
        .from('customer')
        .insert({ account_id: account.account_id, prem_id: premise.prem_id })
        .select()
        .single();
      if (customerError) throw customerError;

      // Create installer
      const { data: installer, error: installerError } = await supabase
        .from('interconnection_installer')
        .insert({ company_name: formData.installer_company })
        .select()
        .single();
      if (installerError) throw installerError;

      // Create system
      const { data: system, error: systemError } = await supabase
        .from('interconnection_system')
        .insert({
          system_size_kw: parseFloat(formData.system_size_kw),
          panel_manufacturer: formData.panel_manufacturer,
          inverter_manufacturer: formData.inverter_manufacturer
        })
        .select()
        .single();
      if (systemError) throw systemError;

      // Create application — set an initial default note for site_selection
      const { error: appError } = await supabase
        .from('interconnection_application')
        .insert({
          cust_id: customer.cust_id,
          ix_installer_id: installer.ix_installer_id,
          ix_system_id: system.ix_system_id,
          status: 'site_selection',
          notes: STATUS_NOTES['site_selection']
        });
      if (appError) throw appError;

      setShowNewForm(false);
      await fetchApplications();
    } catch (err) {
      alert('Error creating application: ' + err.message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interconnection Portal</h1>
                <p className="text-sm text-gray-600">Residential Solar Grid Connection Applications</p>
              </div>
            </div>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAdmin ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isAdmin ? 'Admin View' : 'Customer View'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isAdmin ? 'All Applications' : 'My Applications'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin ? 'Review and manage interconnection applications' : 'Track your solar interconnection application status'}
            </p>
          </div>

          {!isAdmin && !showNewForm && (
            <button onClick={() => setShowNewForm(true)} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + New Application
            </button>
          )}
        </div>

        {showNewForm && (
          <NewApplicationForm onSubmit={handleNewApplication} onCancel={() => setShowNewForm(false)} />
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first interconnection application</p>
            <button onClick={() => setShowNewForm(true)} className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Create Application
            </button>
          </div>
        ) : (
          applications.map(app => (
            <ApplicationCard
              key={app.ix_application_id}
              application={app}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteApplication}
              onDateChange={handleDateChange}
              isAdmin={isAdmin}
            />
          ))
        )}

        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">✓ Connected to Supabase</h3>
          <p className="text-sm text-green-700">You're now using live data from your PostgreSQL database. All changes are persisted in real-time.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

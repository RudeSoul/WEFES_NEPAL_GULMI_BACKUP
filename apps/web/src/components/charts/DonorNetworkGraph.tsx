import React, { useState } from 'react';

interface DonorNetworkGraphProps {
  districtName: string;
}

export const DonorNetworkGraph: React.FC<DonorNetworkGraphProps> = ({ districtName }) => {
  const [selectedNode, setSelectedNode] = useState<string>('wb_reed');

  const donorNodes = [
    { id: 'wb_reed', label: 'World Bank REED', sub: '$80M Alliances', x: 110, y: 70, color: '#0284c7', category: 'donor' },
    { id: 'adb_wrm', label: 'ADB Water Resource', sub: '$60M Basin Mgt', x: 110, y: 150, color: '#0369a1', category: 'donor' },
    { id: 'usaid_ftf', label: 'USAID Feed Future', sub: '$35M Seed/Agro', x: 110, y: 230, color: '#dc2626', category: 'donor' },
    { id: 'ifad_asdp', label: 'IFAD ASDP Value Chain', sub: '$45M High-Value', x: 110, y: 310, color: '#16a34a', category: 'donor' },

    { id: 'moald', label: 'Ministry of Agriculture (MoALD)', sub: 'National Execution', x: 390, y: 100, color: '#10b981', category: 'ministry' },
    { id: 'moewri', label: 'Energy & Water (MoEWRI)', sub: 'Canal & Solar Pumps', x: 390, y: 200, color: '#f59e0b', category: 'ministry' },
    { id: 'mofe', label: 'Forests & Climate (MoFE)', sub: 'Article 6.2 Carbon', x: 390, y: 290, color: '#8b5cf6', category: 'ministry' },

    { id: 'palika_dairy', label: `${districtName} Dairy Hub`, sub: 'Solar Chilling + Biogas', x: 700, y: 70, color: '#059669', category: 'palika' },
    { id: 'palika_irrigation', label: `${districtName} Tubewell Grid`, sub: 'Electric Shallow Wells', x: 700, y: 150, color: '#0284c7', category: 'palika' },
    { id: 'palika_seeds', label: `${districtName} Seed Bank`, sub: 'NARC Foundation Seed', x: 700, y: 230, color: '#d97706', category: 'palika' },
    { id: 'palika_gesi', label: `${districtName} GESI Earmark`, sub: 'Women Goat Cooperatives', x: 700, y: 310, color: '#7c3aed', category: 'palika' },
  ];

  const nodeDetails: Record<string, { title: string; budget: string; scope: string; status: string; partners: string }> = {
    wb_reed: {
      title: 'World Bank Rural Enterprise & Economic Development (REED - Project ID: P170215)',
      budget: '$80,000,000 USD (Sovereign Concessional Credit)',
      scope: 'Productive alliances along trade corridors, market aggregation centers, cold storage and digital traceability.',
      status: 'Active (2021–2027) · Mid-Term Review Completed',
      partners: 'MoALD · Nepal Dairy Development Board · Commercial Banks (ADBL/Nabil)',
    },
    adb_wrm: {
      title: 'Asian Development Bank - Water Resources Management & Command Area Project',
      budget: '$60,000,000 USD (Blended Loan & Grant)',
      scope: 'Conjunctive groundwater governance, command area canal lining, and 50m² community percolation recharge ponds.',
      status: 'Active (2022–2028)',
      partners: 'Department of Water Resources & Irrigation (DWRI) · Water Users Associations (WUAs)',
    },
    usaid_ftf: {
      title: 'USAID Nepal Feed the Future (FtF) Accelerated Agronomic Resilience',
      budget: '$35,000,000 USD (Direct Bilateral Grant)',
      scope: 'Private seed multiplier capacity, digital IPM early warning, and climate-resilient NARC seed commercialization.',
      status: 'Active (2020–2026)',
      partners: 'NARC National Seed Board · SEAN (Seed Entrepreneurs Association Nepal)',
    },
    ifad_asdp: {
      title: 'IFAD Agriculture Sector Development Programme (ASDP)',
      budget: '$45,000,000 USD (Concessional Facility)',
      scope: 'High-value mountain crops, women-led goat breeding clusters, and municipal infrastructure grants.',
      status: 'Active (2019–2026)',
      partners: 'Ministry of Federal Affairs (MoFAGA) · Rural Municipalities Association of Nepal',
    },
    moald: {
      title: 'Ministry of Agriculture and Livestock Development (MoALD) Execution Unit',
      budget: 'National Priority Pipeline 2026',
      scope: 'Site-specific fertilizer subsidies, NARC varietal release certification, and digital registry coordination.',
      status: 'Sovereign Core Agency',
      partners: 'DLS · DoA · NARC Central Laboratory',
    },
    moewri: {
      title: 'Ministry of Energy, Water Resources and Irrigation (MoEWRI)',
      budget: 'National Agricultural Power Transition',
      scope: 'NEA agricultural dedicated electricity tariff (NPR 4.50/kWh) and solar micro-irrigation subsidies.',
      status: 'Active Execution',
      partners: 'NEA · Alternative Energy Promotion Centre (AEPC)',
    },
    mofe: {
      title: 'Ministry of Forests and Environment (MoFE) Climate Change Management Division',
      budget: 'Article 6.2 Carbon Authorization & NDC 2030',
      scope: 'National carbon credit registry, biogas methane abatement verification, and bilateral offset sales.',
      status: 'Regulatory Body',
      partners: 'NPC · UNFCCC National Focal Point',
    },
    palika_dairy: {
      title: `${districtName} Primary Milk Producers' Cooperative (PMPC) Chilling Center`,
      budget: 'NPR 18.5 Million (Matched Grant + Local Equity)',
      scope: '5,000L Bulk Milk Cooler with 15kW Rooftop Solar Back-up to eliminate summer curdling.',
      status: 'Procurement Stage',
      partners: 'Local Palika Ward · DDC Dairy Development Corporation',
    },
    palika_irrigation: {
      title: `${districtName} Conjunctive Tubewell Electrification Grid`,
      budget: 'NPR 24.0 Million (NEA Dedicated Line)',
      scope: '45 shallow tubewells connected to 11kV agricultural grid feeder with smart card energy metering.',
      status: 'Phase 1 Construction',
      partners: 'NEA Local Substation · Farmer Water User Groups',
    },
    palika_seeds: {
      title: `${districtName} Community Foundation Seed Bank`,
      budget: 'NPR 8.5 Million (NARC Partnership)',
      scope: 'Airtight hermetic seed storage chamber storing 40 MT breeder & certified seed locally.',
      status: 'Active Storage',
      partners: 'NARC Regional Station · Local Agro-vets',
    },
    palika_gesi: {
      title: `${districtName} Women's Small Ruminant & GESI Enterprise Cluster`,
      budget: 'NPR 12.0 Million (Palika Gender Earmark)',
      scope: 'Boer/Khari goat cross-breeding buck centers owned 100% by women self-help groups (SHGs).',
      status: 'Active Delivery',
      partners: 'Heifer International Nepal · Palika Livestock Section',
    },
  };

  const connections = [
    { from: 'wb_reed', to: 'moald', path: 'M 190 75 C 270 75, 290 100, 310 100' },
    { from: 'wb_reed', to: 'palika_dairy', path: 'M 470 100 C 560 100, 600 75, 620 75' },
    { from: 'adb_wrm', to: 'moewri', path: 'M 190 155 C 270 155, 290 195, 310 195' },
    { from: 'adb_wrm', to: 'palika_irrigation', path: 'M 470 200 C 560 200, 600 155, 620 155' },
    { from: 'usaid_ftf', to: 'moald', path: 'M 190 230 C 270 230, 290 115, 310 115' },
    { from: 'usaid_ftf', to: 'palika_seeds', path: 'M 470 115 C 560 115, 600 230, 620 230' },
    { from: 'ifad_asdp', to: 'mofe', path: 'M 190 310 C 270 310, 290 290, 310 290' },
    { from: 'ifad_asdp', to: 'palika_gesi', path: 'M 470 290 C 560 290, 600 310, 620 310' },
  ];

  const activeDetail = nodeDetails[selectedNode] || nodeDetails.wb_reed;

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Multilateral Donor & Policy Network
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              World Bank · ADB · USAID · IFAD · GIZ
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Click any donor, ministry, or district intervention node to inspect financing instruments, sovereign alignment, and implementation pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-800">
            🏛️ Active Grants: $220M USD
          </span>
        </div>
      </div>

      {/* Network SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 860 370" className="w-full min-w-[750px] h-auto font-sans select-none">
          {/* Connecting Links */}
          {connections.map((conn, idx) => (
            <path
              key={idx}
              d={conn.path}
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="transition-all"
            />
          ))}

          {/* Nodes */}
          {donorNodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node.id)}
                className="cursor-pointer group"
              >
                <rect
                  x="-75"
                  y="-24"
                  width="155"
                  height="48"
                  rx="14"
                  fill="#1e293b"
                  stroke={isSelected ? '#38bdf8' : '#475569'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="transition-all duration-200 group-hover:stroke-sky-400 drop-shadow-sm"
                />
                <circle cx="-58" cy="0" r="5" fill={node.color} />
                <text x="-46" y="-3" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="Outfit, sans-serif">
                  {node.label}
                </text>
                <text x="-46" y="12" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                  {node.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Node Detail Card */}
      <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-2">
          <div>
            <h5 className="font-bold text-white text-sm font-outfit">{activeDetail.title}</h5>
            <span className="text-[11px] font-mono text-sky-400">Financing Scale: {activeDetail.budget}</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 self-start sm:self-auto">
            {activeDetail.status}
          </span>
        </div>
        <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
          <strong>Intervention Scope:</strong> {activeDetail.scope}
        </p>
        <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-700/60">
          Institutional Implementing Partners: {activeDetail.partners}
        </div>
      </div>
    </div>
  );
};

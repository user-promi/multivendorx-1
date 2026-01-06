import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
import {
    ComposableMap,
    Geographies,
    Geography,
} from 'react-simple-maps';

const GEO_URL =
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type MapStats = {
    [countryCode: string]: {
        hits_count: number;
    };
};

type VisitorMapResponse = {
    map_stats: MapStats;
    colors: Record<string, string>;
};

const VisitorsMap: React.FC = () => {
    const [period, setPeriod] = useState<number>(7);
    const [data, setData] = useState<VisitorMapResponse | null>(null);
    const [tooltip, setTooltip] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);

        axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
                visitorMap: true,
				period: period,
                id: appLocalizer.store_id
			},
		})
			.then((response) => {
				setData(response);
                setLoading(false);
			});

    }, [period]);

    const getCountryCode = (geo: any): string | null => {
        const iso = geo?.properties?.ISO_A2;

        // Ignore invalid / missing ISO codes
        if (!iso || iso === '-99') {
            return null;
        }

        return iso.toLowerCase();
    };

    const handleMouseEnter = (geo: any) => {
        const code = getCountryCode(geo);
        if (!code || !data) return;

        const hits = data.map_stats[code]?.hits_count ?? 0;
        setTooltip(`${geo.properties.NAME} - ${hits} visitors`);
    };

    return (
        <div className="mvx-visitors-map-widget">

            {/* FILTER */}
            <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
            >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
            </select>

            {loading && <p>Loading visitor map…</p>}

            {!loading && data && (
                <div style={{ position: 'relative' }}>
                    {/* TOOLTIP */}
                    {tooltip && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                background: '#fff',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                boxShadow: '0 0 4px rgba(0,0,0,0.25)',
                                fontSize: '12px',
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                        >
                            {tooltip}
                        </div>
                    )}

                    {/* 🌍 MAP */}
                    <ComposableMap
                        projectionConfig={{ scale: 145 }}
                        style={{ width: '100%', height: '270px' }}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const code = getCountryCode(geo);
                                    const fill =
                                        (code && data.colors[code]) ||
                                        '#a0a0a0';

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={fill}
                                            stroke="#fff"
                                            style={{
                                                default: { outline: 'none' },
                                                hover: {
                                                    fillOpacity: 0.7,
                                                    outline: 'none',
                                                },
                                            }}
                                            onMouseEnter={() =>
                                                handleMouseEnter(geo)
                                            }
                                            onMouseLeave={() =>
                                                setTooltip('')
                                            }
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>
                </div>
            )}
        </div>
    );
};

export default VisitorsMap;

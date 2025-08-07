import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { API_URL, headername, keypoint } from '../utils/config';

export default function FilterableParticipantsChart() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [division, setDivision] = useState('');
  const [school, setSchool] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch and clean data (round to whole numbers)
  useEffect(() => {
    fetch(`${API_URL}/api/registration/get_division_count`, {
      headers: { [headername]: keypoint },
    })
      .then((res) => res.json())
      .then((resData) => {
        const cleaned = resData.map((item) => ({
          ...item,
          total_registered: Math.round(Number(item.total_registered || 0)),
          total_attended: Math.round(Number(item.total_attended || 0)),
        }));
        setData(cleaned);
        setFilteredData(cleaned);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // Unique options for filters
  const divisions = [...new Set(data.map((d) => d.division_name))];
  const schools = [
    ...new Set(
      data
        .filter((d) => !division || d.division_name === division)
        .map((d) => d.school_or_section)
    ),
  ];
  const dates = [
    ...new Set(
      data
        .filter(
          (d) =>
            (!division || d.division_name === division) &&
            (!school || d.school_or_section === school)
        )
        .map((d) => d.attendance_date)
    ),
  ].sort();

  // Filter data based on selected filters
  useEffect(() => {
    const filtered = data.filter((d) => {
      return (
        (!division || d.division_name === division) &&
        (!school || d.school_or_section === school) &&
        (!date || d.attendance_date === date)
      );
    });
    setFilteredData(filtered);
  }, [division, school, date, data]);

  // Aggregate data by division
  const divisionSummary = filteredData.reduce((acc, curr) => {
    const div = curr.division_name;
    if (!acc[div]) {
      acc[div] = { registered: 0, attended: 0 };
    }
    acc[div].registered += curr.total_registered;
    acc[div].attended += curr.total_attended;
    return acc;
  }, {});

  const chartLabels = Object.keys(divisionSummary);
  const chartRegistered = chartLabels.map((d) => divisionSummary[d].registered);
  const chartAttended = chartLabels.map((d) => divisionSummary[d].attended);

  return (
    <div className="p-4">
      <div className="shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          Attendance And Registration Summary
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Division */}
          <div className="w-44">
            <label className="block text-sm font-medium mb-1">Division</label>
            <select
              value={division}
              onChange={(e) => {
                setDivision(e.target.value);
                setSchool('');
                setDate('');
              }}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">All Divisions</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* School */}
          <div className="w-56">
            <label className="block text-sm font-medium mb-1">
              School / Section
            </label>
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setDate('');
              }}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {schools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="w-44">
            <label className="block text-sm font-medium mb-1">Date</label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">All Dates</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : chartLabels.length === 0 ? (
          <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-3 rounded">
            No data found for this filter.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
        <BarChart
  height={400}
  xAxis={[
    {
      data: chartLabels,
      scaleType: 'band',
      tickLabelStyle: { fontSize: 12, fontWeight: 500 },
    },
  ]}
  yAxis={[
    {
      label: 'People',
      tickLabelStyle: { fontSize: 12 },
      tickFormat: (value) => `${Math.round(value)}`,
      tickMinStep: 1, // 👈 Prevent decimal Y-axis
    },
  ]}
  series={[
    {
      label: 'Registered',
      data: chartRegistered,
      color: '#1976d2',
    },
    {
      label: 'Attended',
      data: chartAttended,
      color: '#4caf50',
    },
  ]}
  grid={{ vertical: true, horizontal: true }}
/>

          </div>
        )}
      </div>
    </div>
  );
}

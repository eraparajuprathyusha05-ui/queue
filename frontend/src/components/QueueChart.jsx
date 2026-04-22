import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function QueueChart({ history }) {
  const data = history.map((point, index) => ({
    ...point,
    name: `T${index + 1}`,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 4" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "18px",
            }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Line
            dataKey="estimatedPeople"
            dot={{ r: 4, fill: "#67e8f9" }}
            stroke="#67e8f9"
            strokeWidth={3}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default QueueChart;

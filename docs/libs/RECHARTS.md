# Recharts

Biblioteca de gráficos reutilizáveis construída sobre React e D3.

## Instalação

```bash
npm install recharts
# ou
yarn add recharts
# ou
pnpm add recharts
```

## Uso Básico

### Line Chart

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Page A', uv: 400, pv: 2400 },
  { name: 'Page B', uv: 300, pv: 1398 },
  { name: 'Page C', uv: 200, pv: 9800 },
];

function MyLineChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Bar Chart

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function MyBarChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="uv" fill="#8884d8" />
        <Bar dataKey="pv" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Pie Chart

```jsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function MyPieChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

## Componentes Principais

### ResponsiveContainer

Wrapper que torna os gráficos responsivos:

```jsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    {/* componentes do gráfico */}
  </LineChart>
</ResponsiveContainer>
```

### CartesianGrid

Adiciona grade ao gráfico:

```jsx
<CartesianGrid strokeDasharray="3 3" />
```

### XAxis e YAxis

Configuração dos eixos:

```jsx
<XAxis
  dataKey="name"
  tick={<CustomizedAxisTick />}
/>
<YAxis
  label={{ value: 'Price', angle: -90, position: 'insideLeft' }}
/>
```

### Tooltip

Tooltip interativo:

```jsx
<Tooltip />
```

Com customização:

```jsx
<Tooltip
  content={<CustomTooltip />}
  cursor={{ stroke: 'red', strokeWidth: 2 }}
/>
```

### Legend

Legenda do gráfico:

```jsx
<Legend />
```

## Gráficos Avançados

### Area Chart

```jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<AreaChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
  <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
</AreaChart>
```

### Radar Chart

```jsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

<RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="subject" />
  <PolarRadiusAxis />
  <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
</RadarChart>
```

### Scatter Chart

```jsx
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ScatterChart>
  <CartesianGrid />
  <XAxis type="number" dataKey="x" name="weight" unit="kg" />
  <YAxis type="number" dataKey="y" name="height" unit="cm" />
  <ZAxis type="number" dataKey="z" range={[60, 400]} name="score" unit="km" />
  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
  <Scatter name="A school" data={data} fill="#8884d8" />
</ScatterChart>
```

## Customização

### Custom Tooltip

```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
        <p className="intro">{getIntroOfPage(label)}</p>
      </div>
    );
  }
  return null;
};
```

### Custom Label

```jsx
const renderCustomLabel = (props) => {
  const { x, y, value } = props;
  return (
    <text x={x} y={y} fill="#8884d8" textAnchor="middle" dominantBaseline="central">
      {value}
    </text>
  );
};

<Bar dataKey="uv" label={renderCustomLabel} />
```

### Custom Axis Tick

```jsx
const CustomizedAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
        {payload.value}
      </text>
    </g>
  );
};
```

## Recursos Avançados

### Brush (Zoom)

```jsx
import { Brush } from 'recharts';

<LineChart data={data}>
  {/* outros componentes */}
  <Brush
    dataKey="name"
    height={30}
    stroke="#8884d8"
  />
</LineChart>
```

### Reference Lines

```jsx
import { ReferenceLine, ReferenceArea } from 'recharts';

<LineChart data={data}>
  <ReferenceLine y={550} label="Average" stroke="red" />
  <ReferenceArea x1="Mar" x2="May" stroke="red" strokeOpacity={0.3} />
  {/* outros componentes */}
</LineChart>
```

### Animation

```jsx
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="uv"
    stroke="#8884d8"
    isAnimationActive={true}
    animationDuration={1000}
  />
</LineChart>
```

## Hooks Úteis

### useActiveTooltipDataPoints

```jsx
import { useActiveTooltipDataPoints } from 'recharts';

function MyChart() {
  const dataPoints = useActiveTooltipDataPoints();
  // dataPoints contém os pontos ativos no tooltip
}
```

## SSR (Server-Side Rendering)

```jsx
<ResponsiveContainer
  width="100%"
  height={400}
  initialDimension={{ width: 520, height: 400 }}
>
  <LineChart data={data}>
    {/* componentes */}
  </LineChart>
</ResponsiveContainer>
```

## Performance

- Use `ResponsiveContainer` para responsividade
- Evite re-renderizações desnecessárias
- Considere usar `memo` para componentes customizados
- Use `initialDimension` para SSR

## Documentação Oficial

- GitHub: https://github.com/recharts/recharts
- Documentação: https://recharts.org/
- Exemplos: https://recharts.org/en-US/examples


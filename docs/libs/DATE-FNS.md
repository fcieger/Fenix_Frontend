# date-fns

Biblioteca moderna de utilitários JavaScript para manipulação de datas, leve e modular.

## Instalação

```bash
npm install date-fns
# ou
yarn add date-fns
```

## Importação

```javascript
// Importar funções específicas
import { format, compareAsc } from "date-fns";

// Importar locale
import { ptBR } from "date-fns/locale";
```

## Formatação de Datas

### format

```javascript
import { format } from "date-fns";

format(new Date(2014, 1, 11), "yyyy-MM-dd");
//=> '2014-02-11'

format(new Date(2014, 1, 11), "dd/MM/yyyy");
//=> '11/02/2014'

format(new Date(2014, 1, 11), "EEEE, MMMM do, y");
//=> 'Tuesday, February 11th, 2014'
```

### Tokens de Formatação

- `yyyy` - Ano (4 dígitos)
- `MM` - Mês (2 dígitos)
- `dd` - Dia (2 dígitos)
- `EEEE` - Dia da semana (completo)
- `MMMM` - Mês (completo)
- `HH` - Hora (24h)
- `mm` - Minutos
- `ss` - Segundos

## Manipulação de Datas

### Adicionar/Subtrair Tempo

```javascript
import { addDays, subDays, addMonths, subMonths, addYears, subYears } from "date-fns";

// Adicionar dias
addDays(new Date(2014, 1, 11), 10);
//=> Tue Feb 21 2014 00:00:00

// Subtrair dias
subDays(new Date(2014, 1, 11), 10);
//=> Sat Feb 01 2014 00:00:00

// Adicionar meses
addMonths(new Date(2014, 1, 11), 2);
//=> Wed Apr 11 2014 00:00:00

// Adicionar anos
addYears(new Date(2014, 1, 11), 5);
//=> Thu Feb 11 2019 00:00:00
```

### Outras Operações

```javascript
import {
  addHours, subHours,
  addMinutes, subMinutes,
  addSeconds, subSeconds,
  addWeeks, subWeeks
} from "date-fns";

addHours(new Date(2014, 1, 11, 10), 2);
//=> Tue Feb 11 2014 12:00:00

addWeeks(new Date(2014, 1, 11), 1);
//=> Tue Feb 18 2014 00:00:00
```

## Comparação de Datas

### compareAsc e compareDesc

```javascript
import { compareAsc, compareDesc } from "date-fns";

const dates = [
  new Date(1995, 6, 2),
  new Date(1987, 1, 11),
  new Date(1989, 6, 10),
];

dates.sort(compareAsc);
//=> [Wed Feb 11 1987, Mon Jul 10 1989, Sun Jul 02 1995]

dates.sort(compareDesc);
//=> [Sun Jul 02 1995, Mon Jul 10 1989, Wed Feb 11 1987]
```

### isBefore, isAfter, isEqual

```javascript
import { isBefore, isAfter, isEqual } from "date-fns";

isBefore(new Date(1987, 1, 11), new Date(1989, 6, 10));
//=> true

isAfter(new Date(1989, 6, 10), new Date(1987, 1, 11));
//=> true

isEqual(new Date(1987, 1, 11), new Date(1987, 1, 11));
//=> true
```

### isSameDay, isSameMonth, isSameYear

```javascript
import { isSameDay, isSameMonth, isSameYear } from "date-fns";

isSameDay(new Date(2014, 8, 4), new Date(2014, 8, 4));
//=> true

isSameMonth(new Date(2014, 8, 4), new Date(2014, 8, 25));
//=> true

isSameYear(new Date(2014, 8, 4), new Date(2014, 0, 1));
//=> true
```

## Distância entre Datas

### formatDistance

```javascript
import { formatDistance, subDays } from "date-fns";

formatDistance(subDays(new Date(), 3), new Date(), { addSuffix: true });
//=> '3 days ago'

formatDistance(new Date(), addDays(new Date(), 3), { addSuffix: true });
//=> 'in 3 days'
```

### formatDistanceStrict

```javascript
import { formatDistanceStrict } from "date-fns";

formatDistanceStrict(
  new Date(1986, 3, 4, 10, 32, 0),
  new Date(1986, 3, 4, 11, 32, 0),
  { unit: 'minute' }
);
//=> '60 minutes'
```

### differenceInDays, differenceInMonths, etc.

```javascript
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  differenceInHours
} from "date-fns";

differenceInDays(new Date(2014, 6, 2), new Date(2014, 6, 1));
//=> 1

differenceInMonths(new Date(2015, 1, 1), new Date(2014, 6, 1));
//=> 7

differenceInYears(new Date(2015, 1, 1), new Date(2014, 1, 1));
//=> 1
```

## Parsing

### parse

```javascript
import { parse } from "date-fns";

parse("02/11/2014", "MM/dd/yyyy", new Date());
//=> Tue Feb 11 2014 00:00:00

parse("2014-02-11", "yyyy-MM-dd", new Date());
//=> Tue Feb 11 2014 00:00:00
```

### parseISO

```javascript
import { parseISO } from "date-fns";

parseISO("2014-02-11T11:30:30");
//=> Tue Feb 11 2014 11:30:30
```

## Internacionalização (i18n)

### Usar Locale

```javascript
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

format(new Date(2014, 1, 11), "EEEE, MMMM do, y", { locale: ptBR });
//=> 'terça-feira, fevereiro 11º, 2014'
```

### formatRelative

```javascript
import { formatRelative, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

formatRelative(subDays(new Date(), 3), new Date(), { locale: ptBR });
//=> 'na terça-feira passada às 19:26'
```

## Utilitários

### startOfDay, endOfDay

```javascript
import { startOfDay, endOfDay } from "date-fns";

startOfDay(new Date(2014, 8, 2, 11, 55, 0));
//=> Mon Sep 01 2014 00:00:00

endOfDay(new Date(2014, 8, 2, 11, 55, 0));
//=> Mon Sep 01 2014 23:59:59.999
```

### startOfWeek, endOfWeek

```javascript
import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

startOfWeek(new Date(2014, 8, 2), { locale: ptBR });
//=> Segunda-feira (início da semana)

endOfWeek(new Date(2014, 8, 2), { locale: ptBR });
//=> Domingo (fim da semana)
```

### startOfMonth, endOfMonth

```javascript
import { startOfMonth, endOfMonth } from "date-fns";

startOfMonth(new Date(2014, 8, 2, 11, 55, 0));
//=> Mon Sep 01 2014 00:00:00

endOfMonth(new Date(2014, 8, 2, 11, 55, 0));
//=> Tue Sep 30 2014 23:59:59.999
```

## Functional Programming (FP)

### Usar versão FP

```javascript
import { addDays, formatWithOptions } from "date-fns/fp";
import { ptBR } from "date-fns/locale";

// FP functions têm argumentos invertidos (curried)
const addFiveDays = addDays(5);
const formatDate = formatWithOptions({ locale: ptBR }, "dd/MM/yyyy");

const dates = [
  new Date(2017, 0, 1),
  new Date(2017, 1, 11),
  new Date(2017, 6, 2),
];

const formattedDates = dates.map(addFiveDays).map(formatDate);
//=> ['06/01/2017', '16/02/2017', '07/07/2017']
```

## Validação

### isValid

```javascript
import { isValid } from "date-fns";

isValid(new Date());
//=> true

isValid(new Date("invalid"));
//=> false
```

### isDate

```javascript
import { isDate } from "date-fns";

isDate(new Date());
//=> true

isDate("2014-02-11");
//=> false
```

## Recursos Adicionais

- Tree-shaking: importe apenas o que precisa
- Imutável: não modifica datas originais
- TypeScript: suporte completo a tipos
- Locales: suporte a mais de 70 idiomas
- Timezone: suporte a timezones (com date-fns-tz)

## Documentação Oficial

- Website: https://date-fns.org/
- GitHub: https://github.com/date-fns/date-fns
- Documentação: https://date-fns.org/docs/Getting-Started


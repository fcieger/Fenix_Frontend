# Axios

Biblioteca JavaScript para fazer requisições HTTP baseada em Promises.

## Instalação

```bash
npm install axios
# ou
yarn add axios
# ou
pnpm add axios
# ou
bun add axios
```

## Importação

```javascript
// ES Modules
import axios from 'axios';
import axios, {isCancel, AxiosError} from 'axios';

// CommonJS
const axios = require('axios');
```

## Uso Básico

### GET Request

```javascript
// Usando async/await
async function getUser() {
  try {
    const response = await axios.get('/user?ID=12345');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Usando Promises
axios.get('/user', {
    params: {
      ID: 12345
    }
  })
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
```

### POST Request

```javascript
// Usando async/await
const response = await axios.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
});
console.log(response.data);
```

### Múltiplas Requisições Concorrentes

```javascript
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

Promise.all([getUserAccount(), getUserPermissions()])
  .then(function (results) {
    const acct = results[0].data;
    const perm = results[1].data;
    console.log('Account:', acct);
    console.log('Permissions:', perm);
  })
  .catch(function (error) {
    console.error(error);
  });
```

## Criando uma Instância

```javascript
const instance = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});
```

## Configuração de Requisição

```javascript
axios({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  timeout: 5000,
  responseType: 'json'
});
```

## Aliases de Métodos

```javascript
axios.request(config)
axios.get(url[, config])
axios.delete(url[, config])
axios.head(url[, config])
axios.options(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.patch(url[, data[, config]])
```

## Interceptores

### Request Interceptor

```javascript
axios.interceptors.request.use(
  function (config) {
    // Faça algo antes da requisição ser enviada
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Faça algo com o erro da requisição
    return Promise.reject(error);
  }
);
```

### Response Interceptor

```javascript
axios.interceptors.response.use(
  function (response) {
    // Qualquer código de status que esteja dentro do intervalo de 2xx faz com que esta função seja acionada
    return response;
  },
  function (error) {
    // Qualquer código de status que esteja fora do intervalo de 2xx faz com que esta função seja acionada
    if (error.response && error.response.status === 401) {
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);
```

## Rastreamento de Progresso

### Upload Progress

```javascript
const formData = new FormData();
formData.append('file', file);

const response = await axios.post('https://example.com/upload', formData, {
  onUploadProgress: function (progressEvent) {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload progress: ${percentCompleted}%`);
  }
});
```

### Download Progress

```javascript
const response = await axios.get(url, {
  responseType: 'blob',
  onDownloadProgress: function (progressEvent) {
    if (progressEvent.total) {
      const progress = progressEvent.progress * 100;
      console.log(`Download progress: ${progress.toFixed(2)}%`);
    }
  }
});
```

## Cancelamento de Requisições

```javascript
const controller = new AbortController();
axios.get('/foo/bar', {
   signal: controller.signal
}).then(function(response) {
   //...
});
// cancelar a requisição
controller.abort();
```

## Tratamento de Erros

```javascript
try {
  const response = await axios.get('/user?ID=12345');
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // O servidor respondeu com um código de status fora do intervalo de 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // A requisição foi feita mas nenhuma resposta foi recebida
    console.log(error.request);
  } else {
    // Algo aconteceu ao configurar a requisição que acionou um erro
    console.log('Error', error.message);
  }
}
```

## Configurações Globais

```javascript
// Configurar baseURL
axios.defaults.baseURL = 'https://api.example.com';

// Configurar headers padrão
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Configurar timeout
axios.defaults.timeout = 10000;
```

## Métodos de Formulário

```javascript
// POST com multipart/form-data
await axios.postForm('https://httpbin.org/post', {
  'myVar' : 'foo',
  'file': document.querySelector('#fileInput').files[0]
});
```

## Recursos Adicionais

- Suporte a HTTP/2
- Suporte a adaptadores customizados (fetch, xhr, http)
- Transformação automática de dados
- Proteção XSRF
- Suporte a upload/download de streams

## Documentação Oficial

- GitHub: https://github.com/axios/axios
- Documentação: https://axios-http.com/


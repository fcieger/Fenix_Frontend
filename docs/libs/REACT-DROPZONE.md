# React Dropzone

Hook React simples para criar zonas de drag and drop de arquivos compatíveis com HTML5.

## Instalação

```bash
npm install --save react-dropzone
# ou
yarn add react-dropzone
```

## Uso Básico

### Hook useDropzone

```jsx
import React from 'react';
import { useDropzone } from 'react-dropzone';

function MyDropzone() {
  const { getRootProps, getInputProps } = useDropzone();

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  );
}
```

### Com Callback onDrop

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function MyDropzone() {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}
```

## Validação de Arquivos

### Aceitar Tipos Específicos

```jsx
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'text/html': ['.html', '.htm'],
  }
});
```

### Limites de Tamanho

```jsx
const { getRootProps, getInputProps } = useDropzone({
  maxSize: 5242880, // 5MB em bytes
  minSize: 1024,    // 1KB mínimo
});
```

### Número Máximo de Arquivos

```jsx
const { getRootProps, getInputProps } = useDropzone({
  maxFiles: 5,
});
```

## Estados do Dropzone

### Estados Disponíveis

```jsx
const {
  getRootProps,
  getInputProps,
  isDragActive,    // true quando arquivo está sendo arrastado
  isDragAccept,    // true quando arquivo é aceito
  isDragReject,    // true quando arquivo é rejeitado
  isFocused,       // true quando dropzone está focado
} = useDropzone();
```

### Feedback Visual

```jsx
const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function StyledDropzone() {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({ accept: {'image/*': []} });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [isFocused, isDragAccept, isDragReject]);

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  );
}
```

## Preview de Imagens

### Preview com Object URLs

```jsx
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function ImagePreviews() {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  const thumbs = files.map(file => (
    <div key={file.name} style={{
      display: 'inline-flex',
      borderRadius: 2,
      border: '1px solid #eaeaea',
      marginBottom: 8,
      marginRight: 8,
      width: 100,
      height: 100,
      padding: 4
    }}>
      <div style={{ display: 'flex', minWidth: 0, overflow: 'hidden' }}>
        <img
          src={file.preview}
          style={{ display: 'block', width: 'auto', height: '100%' }}
          alt={file.name}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Cleanup: revoke object URLs on unmount
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <section>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag images here to preview</p>
      </div>
      <aside style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16
      }}>
        {thumbs}
      </aside>
    </section>
  );
}
```

## Arquivos Aceitos e Rejeitados

### Exibir Lista de Arquivos

```jsx
function Accept() {
  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    }
  });

  const acceptedFileItems = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <section className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.jpeg and *.png images will be accepted)</em>
      </div>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
    </section>
  );
}
```

## Ler Conteúdo de Arquivos

### Usando FileReader API

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function MyDropzone() {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  );
}
```

## Componente Dropzone (Wrapper)

### Usando como Componente

```jsx
import React from 'react';
import Dropzone from 'react-dropzone';

<Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
  {({ getRootProps, getInputProps }) => (
    <section>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
    </section>
  )}
</Dropzone>
```

### Abrir Dialog Programaticamente

```jsx
import React, { createRef } from 'react';
import Dropzone from 'react-dropzone';

const dropzoneRef = createRef();

<Dropzone ref={dropzoneRef} noClick noKeyboard>
  {({ getRootProps, getInputProps }) => (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <button
        type="button"
        onClick={() => dropzoneRef.current?.open()}
      >
        Open File Dialog
      </button>
    </div>
  )}
</Dropzone>
```

## File System Access API

### Habilitar File System Access API

```jsx
const { getRootProps, getInputProps } = useDropzone({
  useFsAccessApi: true, // Requer HTTPS
  onFileDialogOpen: () => {
    console.log('File dialog opened');
  },
  onFileDialogCancel: () => {
    console.log('File dialog cancelled');
  },
});
```

## Tratamento de Erros

### Callbacks de Erro

```jsx
const {
  getRootProps,
  getInputProps,
  acceptedFiles,
  fileRejections
} = useDropzone({
  onDrop: (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      console.log('Some files were rejected:', fileRejections);
    }
  },
  onError: (error) => {
    console.error('Dropzone error:', error);
  },
  onDropRejected: (fileRejections) => {
    console.log('Rejected files:', fileRejections);
  },
  maxSize: 1048576, // 1MB
  accept: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  }
});
```

## Refs Diretos

### Acessar Refs

```jsx
const {
  getRootProps,
  getInputProps,
  rootRef,  // Ref para o elemento root
  inputRef  // Ref para o input
} = useDropzone();
```

## Props Adicionais

### Passar Props Adicionais

```jsx
<div
  {...getRootProps({
    onClick: event => console.log(event),
    role: 'button',
    'aria-label': 'drag and drop area',
  })}
/>
```

## Recursos

- Suporte a drag and drop
- Validação de tipos de arquivo
- Limites de tamanho e quantidade
- Preview de imagens
- File System Access API
- Acessibilidade
- TypeScript support

## Documentação Oficial

- GitHub: https://github.com/react-dropzone/react-dropzone
- Documentação: https://react-dropzone.js.org/


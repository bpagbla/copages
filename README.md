# Copages 

Aplicación web para escribir, guardar y colaborar en obras literarias.

## Instrucciones rápidas

1. **Clonar el repositorio**
```bash
git clone https://github.com/bpagbla/copages.git
cd copages
```
2. **Crear archivo .env**
```bash
cp .env.example .env
```

3. **Construir los contenedores Docker**
```bash
docker compose build
```

4. **Levantar los servicios en segundo plano**
```bash
docker compose up -d
```

5. **Iniciar el frontend (Angular)**
```bash
cd src/app
npm install
ng serve -o
```

---

Desarrollado por [@bpagbla](https://github.com/bpagbla)

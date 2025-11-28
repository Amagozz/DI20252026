
---

## 🔹 Caso 1. Estás en **tu fork** y quieres traer los cambios del **repo original (upstream)**

Cuando haces un fork en GitHub, tu repo ya no se actualiza solo. Para sincronizarlo:

1. Asegúrate de tener el remoto `upstream` configurado:

   ```bash
   git remote -v
   ```

   Deberías ver algo como:

   ```
   origin   https://github.com/TU-USUARIO/DI20252026.git (fetch)
   origin   https://github.com/TU-USUARIO/DI20252026.git (push)
   upstream https://github.com/Amagozz/DI20252026.git (fetch)
   upstream https://github.com/Amagozz/DI20252026.git (push)
   ```

   Si **no tienes `upstream`**, añádelo:

   ```bash
   git remote add upstream https://github.com/Amagozz/DI20252026.git
   ```

2. Trae los cambios del original:

   ```bash
   git fetch upstream
   ```

3. Haz merge o rebase en tu rama:

   ```bash
   git checkout main
   git merge upstream/main
   ```

   o bien:

   ```bash
   git rebase upstream/main
   ```

4. Sube a tu fork:

   ```bash
   git push origin main
   ```

---
Exacto ⚡️. Esa es la clave: **`git pull` no es más que `git fetch` + `git merge` (o rebase)**.

---

### 🔹 `git fetch`

* Solo **descarga** los commits del remoto a tu repo local.
* No toca tu rama actual.
* Ejemplo:

  ```bash
  git fetch upstream
  git log main..upstream/main
  ```

  Con eso ves qué hay de nuevo sin alterar tu `main`.

---

### 🔹 `git pull`

* Hace lo mismo que `fetch` **y además** intenta **fusionar** o **rebasar** en tu rama actual.
* Ejemplo:

  ```bash
  git pull upstream main
  ```

  Te traerá los cambios de `upstream/main` y los aplicará en tu `main`.

---

### 🔹 ¿Por qué se suele recomendar `fetch` en forks?

Porque con forks normalmente quieres **controlar** cómo integras los cambios del repo original:

* A veces haces `merge` para mantener la historia.
* Otras veces prefieres `rebase` para que tu `main` quede lineal.

Con `pull` lo hace todo de golpe y puede meterte un merge automático que no querías.

---

👉 Regla práctica:

* **`fetch`** → observar, comparar, decidir qué hacer.
* **`pull`** → traer y aplicar directamente, sin preguntar demasiado.

¿Quieres que te arme un mini-workflow recomendado para que tus alumnos mantengan su fork sincronizado con tu repo (con ejemplos de `fetch` y `merge/rebase` paso a paso)?



---

```markdown
# 🧭 Guía Git – Fetch vs Pull, conflictos y cómo deshacer commits

Esta guía explica **por qué `git fetch` no descarga carpetas visibles**, qué hace realmente `git pull`, y cómo actuar en los tres supuestos más comunes:
1. Tengo **conflictos** al hacer pull.  
2. Quiero **volver a antes del último commit**.  
3. Quiero **volver a antes del último push** (ya subido a GitHub).

---

## ⚙️ Cómo funciona Git: las tres capas

```

Repositorio remoto (GitHub)
│   Estado "oficial" del proyecto (p.ej. upstream/main)
│
├── git fetch upstream
│
▼
Base de datos local (.git)
│   Guarda commits e historial. Aquí llegan los cambios descargados.
│
├── git merge upstream/main
│
▼
Carpeta de trabajo (VS Code)
Archivos reales que editas y ves.

````

👉 **`git pull upstream main` = `git fetch upstream` + `git merge upstream/main`**

- `fetch` solo actualiza la base de datos → **no ves carpetas nuevas aún**.  
- `merge` aplica esos cambios a tu rama → **ahora sí aparecen los archivos nuevos**.

---

## 💥 1) Hago pull y tengo conflictos con mi código

### Método 1: Resolver conflictos directamente
```bash
git pull upstream main
# Si hay conflictos, Git marca los archivos con <<<<<<< HEAD ... ======= ... >>>>>>>
# Abre los archivos en VS Code → elige 'Accept Current', 'Accept Incoming' o edita manualmente.
git status                  # Muestra los archivos en conflicto
git add RUTA/ARCHIVO        # Marca cada archivo como resuelto
git commit                  # Cierra el merge
git push origin main        # (opcional) sube los cambios resueltos a tu fork
````

### Método 2: Plan B – actualizar limpio sin perder tu trabajo

```bash
# 1) Guarda tu trabajo local en una rama temporal
git checkout -b mi-trabajo-local

# 2) Actualiza tu rama main con los últimos cambios del upstream
git checkout main
git fetch upstream
git merge --ff-only upstream/main   # fast-forward limpio

# 3) Reintegra tu trabajo encima de la nueva base
git checkout mi-trabajo-local
git rebase main
# Si hay conflictos:
# git add ...
# git rebase --continue

# 4) Fusiona tu rama con main y sube
git checkout main
git merge mi-trabajo-local
git push origin main
```

---

## ⏪ 2) Quiero volver a antes del último commit (sin tocar el remoto)

| Caso                                                 | Comando                    | Qué hace                                                                 |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| Quitar el último commit pero mantener cambios staged | `git reset --soft HEAD~1`  | El commit desaparece, los cambios quedan listos para volver a commitear. |
| Quitar el último commit y dejar cambios en archivos  | `git reset --mixed HEAD~1` | El commit desaparece, los cambios siguen sin preparar.                   |
| Borrar el commit y los cambios (peligroso)           | `git reset --hard HEAD~1`  | Revierte al estado anterior, se pierden los cambios.                     |

💡 Consejo: empieza por `--soft` o `--mixed`; evita `--hard` salvo que tengas copia o backup.

---

## 🔙 3) Quiero volver a antes del último push (ya subido a GitHub)

### Opción segura – crear un commit inverso (no reescribe historia)

```bash
git log --oneline          # Copia el hash del commit que quieres revertir
git revert <HASH>          # Crea un commit que deshace el cambio
git push origin main
```

### Opción avanzada – reescribir historia (evitar en ramas compartidas)

```bash
git reset --hard <HASH_ANTERIOR>     # Mueve la rama al commit anterior
git push origin main --force-with-lease
```

> ⚠️ Usa `--force-with-lease` (no `--force`) para minimizar riesgos si alguien más ha hecho push.

---

## 📚 Resumen express

| Acción                    | Qué hace                         | Visible en VS Code |
| ------------------------- | -------------------------------- | ------------------ |
| `git fetch upstream`      | Descarga cambios, actualiza .git | ❌ No               |
| `git merge upstream/main` | Aplica cambios a tu rama         | ✅ Sí               |
| `git pull upstream main`  | Fetch + Merge en un paso         | ✅ Sí               |
| `git reset --soft HEAD~1` | Deshace commit, conserva cambios | ✅ Sí               |
| `git revert <HASH>`       | Crea commit que revierte cambios | ✅ Sí               |
| `git reset --hard <HASH>` | Borra cambios (peligroso)        | ❌ Se pierden       |

---

## 🧩 Material visual complementario

* 🖼️ [Infografía SVG: tres capas de Git y flujo fetch/merge/pull](./git_tres_capas_infografia.svg)
* 📄 [Chuleta PDF: conflictos y revertir commits](./chuleta_git_pull_conflictos_y_revert.pdf)

---

✳️ **Consejo final:**
Antes de hacer `git pull upstream main`, guarda tus cambios locales (`git stash` o rama temporal).
Después, actualiza y vuelve a aplicar tu trabajo. Así evitarás la mayoría de los conflictos.

```

---


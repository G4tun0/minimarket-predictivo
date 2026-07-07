"""
predecir.py — Minimarket Predictivo
Entrena un modelo de regresion (scikit-learn) POR PRODUCTO usando el
historial de `ventas` y sube el resultado a la tabla `predicciones`
en Supabase.

Se eligio regresion lineal sobre Prophet por restriccion de tiempo y
de entorno: Prophet requiere un compilador C++ (CmdStan) que no esta
disponible por defecto en Windows y cuya instalacion puede fallar o
tardar mucho. La regresion lineal captura la tendencia de ventas
(pendiente dia a dia) sin dependencias de compilacion, cumpliendo el
mismo rol dentro de la arquitectura: un modelo entrenado con datos
historicos que escribe en la tabla `predicciones`.

Uso:
    python predecir.py

Requiere en el mismo folder un archivo .env con:
    SUPABASE_URL=https://TU-PROYECTO.supabase.co
    SUPABASE_SERVICE_KEY=tu-service-role-key   <-- OJO: service_role, no anon
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LinearRegression
from supabase import create_client

# ------------------------------------------------------------------
# 0. Config
# ------------------------------------------------------------------
def cargar_env(path=".env"):
    env = {}
    if os.path.exists(path):
        with open(path) as f:
            for linea in f:
                linea = linea.strip()
                if linea and not linea.startswith("#") and "=" in linea:
                    k, v = linea.split("=", 1)
                    env[k.strip()] = v.strip()
    return env

env = {**cargar_env(), **os.environ}
SUPABASE_URL = env.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = env.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise SystemExit(
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY. Crea un .env con esas 2 variables."
    )

DIAS_A_PREDECIR = 30       # horizonte de la prediccion
MIN_VENTAS_PARA_ML = 5     # si un producto tiene menos dias de venta que esto, usamos fallback simple

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ------------------------------------------------------------------
# 1. Extraer ventas desde Supabase
# ------------------------------------------------------------------
def cargar_ventas() -> pd.DataFrame:
    print("Descargando ventas desde Supabase...")
    resp = supabase.table("ventas").select("producto, fecha, cantidad").execute()
    df = pd.DataFrame(resp.data)
    if df.empty:
        raise SystemExit("No hay ventas registradas todavia. Genera algunas ventas de prueba primero.")
    df["fecha"] = pd.to_datetime(df["fecha"]).dt.tz_localize(None).dt.normalize()
    print(f"  {len(df)} filas de ventas, {df['producto'].nunique()} productos distintos.")
    return df


# ------------------------------------------------------------------
# 2. Entrenar un modelo de regresion lineal por producto
# ------------------------------------------------------------------
def entrenar_y_predecir(df_producto: pd.DataFrame):
    serie = (
        df_producto.groupby("fecha")["cantidad"]
        .sum()
        .reset_index()
        .sort_values("fecha")
    )

    total_historico = serie["cantidad"].sum()

    if len(serie) < MIN_VENTAS_PARA_ML:
        return round(total_historico * 1.1), False

    try:
        primer_dia = serie["fecha"].min()
        serie["dia_num"] = (serie["fecha"] - primer_dia).dt.days

        X = serie[["dia_num"]].values
        y = serie["cantidad"].values

        modelo = LinearRegression()
        modelo.fit(X, y)

        ultimo_dia = serie["dia_num"].max()
        dias_futuros = np.arange(ultimo_dia + 1, ultimo_dia + 1 + DIAS_A_PREDECIR).reshape(-1, 1)
        pred_diaria = modelo.predict(dias_futuros)
        pred_diaria = np.clip(pred_diaria, a_min=0, a_max=None)

        prediccion_total = round(pred_diaria.sum())
        # Limite de sensatez: la prediccion no debe superar 1.5x ni ser menor
        # a 0.5x el historico, para evitar extrapolaciones extremas de la
        # regresion lineal simple sobre datos con poca historia.
        limite_sup = total_historico * 1.5
        limite_inf = total_historico * 0.5
        prediccion_total = max(limite_inf, min(prediccion_total, limite_sup))
        return int(round(prediccion_total)), True
    except Exception as e:
        print(f"    [aviso] Regresion fallo para este producto ({e}); uso fallback simple.")
        return round(total_historico * 1.1), False


# ------------------------------------------------------------------
# 3. Subir resultados a la tabla `predicciones`
# ------------------------------------------------------------------
def subir_predicciones(resultados):
    print("\nSubiendo predicciones a Supabase...")
    for r in resultados:
        supabase.table("predicciones").delete().eq("producto", r["producto"]).execute()
        supabase.table("predicciones").insert({
            "producto": r["producto"],
            "vendidos_30d": r["vendidos_30d"],
            "prediccion": r["prediccion"],
            "generado_en": r["generado_en"],
        }).execute()
        etiqueta = "ML" if r["uso_ml"] else "fallback"
        print(f"  [{etiqueta:8s}] {r['producto']:35s} vendidos_30d={r['vendidos_30d']:>4}  prediccion={r['prediccion']:>4}")


# ------------------------------------------------------------------
# 4. Main
# ------------------------------------------------------------------
def main():
    df = cargar_ventas()
    resultados = []

    print("\nEntrenando modelos por producto (regresion lineal)...")
    for producto, grupo in df.groupby("producto"):
        vendidos_30d = int(grupo["cantidad"].sum())
        prediccion, uso_ml = entrenar_y_predecir(grupo)
        resultados.append({
            "producto": producto,
            "vendidos_30d": vendidos_30d,
            "prediccion": int(prediccion),
            "uso_ml": uso_ml,
            "generado_en": datetime.utcnow().isoformat(),
        })

    subir_predicciones(resultados)

    n_ml = sum(1 for r in resultados if r["uso_ml"])
    print(f"\nListo. {len(resultados)} productos actualizados ({n_ml} con regresion, {len(resultados)-n_ml} con fallback simple).")
    print("Abre la app (Reportes) y deberias ver el badge 'Modelo ML' en los productos entrenados.")


if __name__ == "__main__":
    main()
import pandas as pd
import re


def analyze_and_process_file(df):
    """
    Принимает "сырой" DataFrame, выполняет всю обработку
    и возвращает словарь со статистикой, превью и обработанными данными.
    """
    original_rows = len(df)
    original_cols = len(df.columns)

    columns_to_keep = [col for col in df.columns if col in ['Query', 'Url'] or '_position' in str(col)]
    if not columns_to_keep:
        raise ValueError("В файле не найдены столбцы 'Query', 'Url' или '_position'.")
    df_cleaned = df[columns_to_keep].copy()

    position_columns = [col for col in df_cleaned.columns if '_position' in str(col)]
    for col in position_columns:
        df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce')

    df_cleaned.dropna(subset=position_columns, inplace=True, how='any')

    for col in position_columns:
        df_cleaned[col] = df_cleaned[col].round(0).astype(int)

    final_rows = len(df_cleaned)
    final_cols = len(df_cleaned.columns)

    stats = {
        "rowsProcessed": int(original_rows),
        "originalColumns": int(original_cols),
        "columnsRemoved": int(original_cols - final_cols),
        "finalColumns": int(final_cols)
    }

    available_dates = sorted(list(set(re.findall(r'(\d{4}-\d{2}-\d{2})', ' '.join(position_columns)))))

    data_preview = df_cleaned.head(50).to_dict('records')

    return {
        "full_data": df_cleaned,
        "stats": stats,
        "available_dates": available_dates,
        "data_preview": data_preview
    }

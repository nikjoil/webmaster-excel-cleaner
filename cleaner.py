import pandas as pd
import numpy as np


def process_webmaster_file(filepath, output_filepath):
    """
    Эта функция читает Excel-файл от Яндекс.Вебмастера, удаляет
    ненужные столбцы, округляет позиции и сохраняет результат.
    """
    print(f"Читаем файл: {filepath}")

    try:
        df = pd.read_excel(filepath)
        print("Файл успешно прочитан.")
        print("\nИсходные столбцы:")
        print(df.columns.tolist())

    except FileNotFoundError:
        print(f"ОШИБКА: Файл не найден по пути: {filepath}")
        return

    # Фильтрация столбцов
    columns_to_keep = []
    for column_name in df.columns:
        if column_name in ['Query', 'Url'] or '_position' in str(column_name):
            columns_to_keep.append(column_name)

    print("\nСтолбцы, которые оставим:")
    print(columns_to_keep)

    df_cleaned = df[columns_to_keep]

    print("\nПредпросмотр данных ДО округления (первые 5 строк):")
    print(df_cleaned.head())

    # Округление значений в столбцах с позициями
    print("\nНачинаем округление позиций...")

    for column_name in df_cleaned.columns:
        if '_position' in column_name:
            df_cleaned[column_name] = pd.to_numeric(
                df_cleaned[column_name], errors='coerce')
            df_cleaned[column_name] = df_cleaned[
                column_name].round(0).astype('Int64')

            print(f"Столбец '{column_name}' обработан.")

    print("\nОкругление завершено.")

    print("\nПредпросмотр данных ПОСЛЕ округления (первые 5 строк):")
    print(df_cleaned.head())

    # Сохраняем итоговую таблицу в Excel
    df_cleaned.to_excel(output_filepath, index=False)

    print(f"\nГотово! Итоговый файл сохранен как: {output_filepath}")


if __name__ == "__main__":
    input_file = 'data_full.xlsx'
    output_file = 'result_cleaned.xlsx'

    process_webmaster_file(input_file, output_file)

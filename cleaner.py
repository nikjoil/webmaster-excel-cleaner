import pandas as pd


def process_webmaster_file(filepath, output_filepath):
    """
    Эта функция читает Excel-файл от Яндекс.Вебмастера, удаляет
    ненужные столбцы и сохраняет результат в новый файл.
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

    columns_to_keep = []

    for column_name in df.columns:
        if column_name in ['Query', 'Url'] or '_position' in str(column_name):
            columns_to_keep.append(column_name)

    print("\nСтолбцы, которые мы оставим:")
    print(columns_to_keep)

    df_cleaned = df[columns_to_keep]

    print("\nПредпросмотр очищенных данных (первые 5 строк):")
    print(df_cleaned.head())

    df_cleaned.to_excel(output_filepath, index=False)

    print(f"\nГотово! Очищенный файл сохранен как: {output_filepath}")


if __name__ == "__main__":
    input_file = 'data_full.xlsx'
    output_file = 'result_cleaned.xlsx'

    process_webmaster_file(input_file, output_file)

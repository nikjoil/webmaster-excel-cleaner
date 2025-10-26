import pandas as pd
import re


def process_webmaster_file(filepath):
    """
    Основная функция, которая читает, очищает и округляет данные.
    Возвращает готовый для фильтрации DataFrame.
    """
    print(f"1. Читаем файл: {filepath}")
    try:
        df = pd.read_excel(filepath)
    except FileNotFoundError:
        print(f"ОШИБКА: Файл не найден по пути: {filepath}")
        return None

    columns_to_keep = []
    for col in df.columns:
        if col in ["Query", "Url"] or "_position" in str(col):
            columns_to_keep.append(col)

    df_cleaned = df[columns_to_keep]

    print("2. Округляем позиции до целых чисел...")
    for col in df_cleaned.columns:
        if "_position" in col:
            df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors="coerce")
            df_cleaned.dropna(subset=[col], inplace=True)
            df_cleaned[col] = df_cleaned[col].round(0).astype(int)

    print("   Очистка и округление завершены.")
    return df_cleaned


def filter_data_interactively(df):
    """
    Функция для интерактивной фильтрации данных по ТОПу и дате.
    """
    if df is None or df.empty:
        print("Нет данных для фильтрации.")
        return

    position_columns = [col for col in df.columns if "_position" in col]
    available_dates = sorted(
        list(set(re.findall(r"(\d{4}-\d{2}-\d{2})", " ".join(position_columns))))
    )

    if not available_dates:
        print(
            "ОШИБКА: Не удалось найти столбцы с датами в формате 'ГГГГ-ММ-ДД_position'."
        )
        return

    print("\n3. Доступные даты для анализа:")
    for i, date in enumerate(available_dates, 1):
        print(f"   {i}. {date}")

    date_choice = ""
    while not date_choice.isdigit() or not 1 <= int(date_choice) <= len(
        available_dates
    ):
        date_choice = input("   Введите номер даты, по которой хотите составить ТОП: ")
    selected_date = available_dates[int(date_choice) - 1]

    top_n_choice = ""
    while not top_n_choice.isdigit() or int(top_n_choice) <= 0:
        top_n_choice = input(
            f"   Введите ТОП-N (например, 10 для ТОП-10) для даты {selected_date}: "
        )
    top_n = int(top_n_choice)

    print(f"\n4. Фильтруем данные: ТОП-{top_n} для {selected_date}...")
    position_column_name = f"{selected_date}_position"

    filtered_df = df[
        (df[position_column_name] > 0) & (df[position_column_name] <= top_n)
    ].copy()

    filtered_df.sort_values(by=position_column_name, ascending=True, inplace=True)

    if filtered_df.empty:
        print("   По вашему запросу не найдено ни одной позиции.")
        return

    output_filename = f"result_TOP{top_n}_for_{selected_date}.xlsx"
    filtered_df.to_excel(output_filename, index=False)

    print(f"\nГотово! Результат сохранен в файле: {output_filename}")


if __name__ == "__main__":
    input_file = "data_full.xlsx"

    processed_data = process_webmaster_file(input_file)

    filter_data_interactively(processed_data)
